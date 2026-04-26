'use client';

import { useState, useEffect, useRef, useCallback, use } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';

const ParticleField = dynamic(() => import('@/components/ParticleField'), { ssr: false });

function TypingDots() {
  return (
    <div style={{ display: 'flex', gap: '5px', padding: '4px 2px', alignItems: 'center' }}>
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          animate={{ y: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 0.7, delay: i * 0.15, ease: 'easeInOut' }}
          style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#a78bfa', opacity: 0.8 }}
        />
      ))}
    </div>
  );
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  hidden?: boolean;
}

interface PersonaInfo {
  personName: string;
  messageCount: number;
  coveredCount: number;
  createdAt?: string;
  myName?: string;
  relation?: string;
}

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [personaInfo, setPersonaInfo] = useState<PersonaInfo | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [greetingFailed, setGreetingFailed] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    return () => { abortRef.current?.abort(); };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    abortRef.current = controller;
    setGreetingFailed(false);
    setIsInitializing(true);

    const init = async () => {
      let info: PersonaInfo = { personName: '그 사람', messageCount: 0, coveredCount: 0 };
      try {
        const pRes = await fetch(`/api/persona/${id}`, { signal: controller.signal });
        if (pRes.ok) {
          const data = await pRes.json() as PersonaInfo & { userInfo?: { name: string; relation: string } };
          info = {
            personName: data.personName,
            messageCount: data.messageCount,
            coveredCount: data.coveredCount,
            createdAt: data.createdAt,
            myName: data.userInfo?.name,
            relation: data.userInfo?.relation,
          };
        }
      } catch { /* use default */ }
      if (controller.signal.aborted) return;
      setPersonaInfo(info);

      try {
        const histRes = await fetch(`/api/messages?personaId=${id}`, { signal: controller.signal });
        if (histRes.ok) {
          const { conversationId: cid, messages: dbMsgs } = await histRes.json() as {
            conversationId: string;
            messages: Array<{ role: 'user' | 'assistant'; content: string; hidden: boolean; created_at: string }>;
          };
          setConversationId(cid);

          if (dbMsgs.length > 0) {
            setMessages(dbMsgs.map(m => ({
              role: m.role,
              content: m.content,
              timestamp: new Date(m.created_at),
              hidden: m.hidden,
            })));
            setIsInitializing(false);
            return;
          }
        }
      } catch { /* fresh start */ }
      if (controller.signal.aborted) return;

      const greetingTrigger = info.myName
        ? `안녕, 나 ${info.myName}야.`
        : '안녕, 나야.';

      const seedUserMsg: Message = {
        role: 'user',
        content: greetingTrigger,
        timestamp: new Date(),
        hidden: true,
      };

      try {
        const greetRes = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            personaId: id,
            messages: [{ role: 'user', content: greetingTrigger }],
          }),
          signal: controller.signal,
        });

        if (!greetRes.ok) {
          setGreetingFailed(true);
          setIsInitializing(false);
          return;
        }

        const reader = greetRes.body?.getReader();
        if (!reader) { setGreetingFailed(true); setIsInitializing(false); return; }

        const decoder = new TextDecoder();
        let greetText = '';
        const greetMsg: Message = { role: 'assistant', content: '', timestamp: new Date() };
        setMessages([seedUserMsg, greetMsg]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          greetText += decoder.decode(value, { stream: true });
          if (!controller.signal.aborted)
            setMessages([seedUserMsg, { ...greetMsg, content: greetText }]);
        }

        if (controller.signal.aborted) return;

        if (greetText) {
          fetch('/api/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              personaId: id,
              messages: [
                { role: 'user', content: greetingTrigger, hidden: true },
                { role: 'assistant', content: greetText, hidden: false },
              ],
            }),
          }).then(r => r.json()).then((d: { conversationId?: string }) => {
            if (d.conversationId) setConversationId(d.conversationId);
          }).catch(() => {});
        }
      } catch (err) {
        if ((err as Error).name !== 'AbortError') setGreetingFailed(true);
      }

      if (!controller.signal.aborted) setIsInitializing(false);
    };

    init();
    return () => { controller.abort(); };
  }, [id, retryCount]);

  const showToast = useCallback((msg: string) => setToast(msg), []);

  const learnFromConversation = (msgs: Message[]) => {
    const visible = msgs.filter(m => !m.hidden);
    if (visible.length % 10 !== 0 || visible.length === 0) return;
    fetch('/api/learn', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        personaId: id,
        messages: visible.map(m => ({ role: m.role, content: m.content })),
      }),
    }).catch(() => {});
  };

  const sendMessage = async () => {
    const text = inputValue.trim();
    if (!text || isLoading) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setInputValue('');
    const userMsg: Message = { role: 'user', content: text, timestamp: new Date() };
    const assistantMsg: Message = { role: 'assistant', content: '', timestamp: new Date() };
    const newMessages = [...messages, userMsg];
    setMessages([...newMessages, assistantMsg]);
    setIsLoading(true);

    const apiMessages = newMessages.map(m => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personaId: id, messages: apiMessages }),
        signal: controller.signal,
      });

      if (!res.ok) throw new Error('응답 실패');

      const reader = res.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      let assistantText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantText += decoder.decode(value, { stream: true });
      }

      if (controller.signal.aborted) return;

      const parts = assistantText.split('\n\n').map(p => p.trim()).filter(Boolean);
      if (parts.length === 0) return;

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const delay = Math.min(700 + part.length * 28, 5500);
        await new Promise(r => setTimeout(r, delay));
        if (controller.signal.aborted) return;

        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'assistant', content: part, timestamp: new Date() };
          return updated;
        });

        if (i < parts.length - 1) {
          await new Promise(r => setTimeout(r, 350));
          if (controller.signal.aborted) return;
          setMessages(prev => [...prev, { role: 'assistant', content: '', timestamp: new Date() }]);
        }
      }

      if (assistantText && !controller.signal.aborted) {
        fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            personaId: id,
            messages: [
              { role: 'user', content: text },
              { role: 'assistant', content: assistantText },
            ],
          }),
        }).catch(() => { showToast('메시지 저장에 실패했습니다. 대화는 이 세션에서만 유지됩니다.'); });
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: 'assistant',
          content: '응답을 받지 못했습니다. 잠시 후 다시 시도해주세요.',
          timestamp: new Date(),
        };
        return updated;
      });
    } finally {
      setIsLoading(false);
      setMessages(prev => { learnFromConversation(prev); return prev; });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // 모바일에서는 Enter로 전송하지 않음 (줄바꿈 기대 동작)
    if (e.key === 'Enter' && !e.shiftKey && !isMobile) {
      e.preventDefault();
      sendMessage();
    }
  };

  const personName = personaInfo?.personName ?? '그 사람';
  const initial = personName.charAt(0);
  const bubbleMaxWidth = isMobile ? '85%' : '65%';

  return (
    <div style={{
      background: '#07090f',
      height: '100dvh',
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      overflow: 'hidden',
      color: '#e2e8f0',
    }}>
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            style={{
              position: 'fixed', bottom: isMobile ? '5.5rem' : '5rem', left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(30,39,56,0.95)', border: '1px solid rgba(167,139,250,0.3)',
              borderRadius: '10px', padding: '0.75rem 1.25rem',
              color: '#e2e8f0', fontSize: '0.85rem', zIndex: 9999,
              boxShadow: '0 4px 20px rgba(0,0,0,0.4)', whiteSpace: 'nowrap',
              maxWidth: 'calc(100vw - 2rem)', textAlign: 'center',
            }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── SIDEBAR (desktop only) ── */}
      {!isMobile && (
        <aside style={{
          width: '220px', minWidth: '220px',
          background: '#0e1117',
          borderRight: '1px solid rgba(30,39,56,0.8)',
          display: 'flex', flexDirection: 'column',
          padding: '1.5rem 1.25rem', gap: '0',
        }}>
          <Link href="/dashboard" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#a78bfa', letterSpacing: '0.1em', textDecoration: 'none', marginBottom: '2rem', display: 'block' }}>
            echo
          </Link>

          <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
            <div style={{
              width: '72px', height: '72px', borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(167,139,250,0.2))',
              border: '2px solid rgba(167,139,250,0.4)',
              boxShadow: '0 0 20px rgba(167,139,250,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.8rem', fontWeight: 700, color: '#c4b5fd', margin: '0 auto',
            }}>
              {initial}
            </div>
          </div>

          <p style={{ textAlign: 'center', fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.5rem', color: '#e2e8f0' }}>
            {personName}
          </p>

          {personaInfo?.relation && (
            <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.78rem', marginBottom: '0.5rem' }}>
              {personaInfo.relation}
            </p>
          )}

          <p style={{ textAlign: 'center', color: '#475569', fontSize: '0.78rem', marginBottom: '1.25rem' }}>
            {personaInfo?.createdAt
              ? new Date(personaInfo.createdAt).toLocaleDateString('ko-KR')
              : new Date().toLocaleDateString('ko-KR')}
          </p>

          {personaInfo && (
            <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.78rem', marginBottom: '1.5rem' }}>
              대화 기록 {personaInfo.messageCount.toLocaleString()}개
            </p>
          )}

          <div style={{ borderTop: '1px solid rgba(30,39,56,0.6)', paddingTop: '1.25rem', marginTop: 'auto' }}>
            <p style={{
              fontSize: '0.72rem', color: '#334155', lineHeight: 1.6,
              padding: '0.75rem', background: 'rgba(30,39,56,0.3)', borderRadius: '8px',
            }}>
              이 대화는 AI가 생성합니다. 실제 인물의 응답이 아닙니다.
            </p>
          </div>

          <Link href="/upload" style={{
            marginTop: '1rem', display: 'block', textAlign: 'center',
            padding: '0.65rem',
            border: '1px solid rgba(167,139,250,0.3)', borderRadius: '8px',
            color: '#a78bfa', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 500,
          }}>
            + 새 대화
          </Link>

          <Link href="/dashboard" style={{
            marginTop: '0.5rem', display: 'block', textAlign: 'center',
            padding: '0.65rem',
            border: '1px solid rgba(30,39,56,0.6)', borderRadius: '8px',
            color: '#64748b', textDecoration: 'none', fontSize: '0.82rem',
          }}>
            대화 목록
          </Link>
        </aside>
      )}

      {/* ── CHAT AREA ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <ParticleField opacity={0.2} count={isMobile ? 10 : 20} />
        </div>

        {/* ── Mobile header ── */}
        {isMobile ? (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            padding: '0.75rem 1rem',
            paddingTop: 'max(0.75rem, env(safe-area-inset-top))',
            borderBottom: '1px solid rgba(30,39,56,0.8)',
            background: 'rgba(14,17,23,0.95)', backdropFilter: 'blur(10px)',
            position: 'relative', zIndex: 10,
          }}>
            <Link href="/dashboard" style={{
              color: '#a78bfa', textDecoration: 'none',
              fontSize: '1.3rem', lineHeight: 1, padding: '0.25rem',
              display: 'flex', alignItems: 'center',
            }}>
              ←
            </Link>
            <div style={{
              width: '38px', height: '38px', borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(167,139,250,0.2))',
              border: '1.5px solid rgba(167,139,250,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1rem', fontWeight: 700, color: '#c4b5fd', flexShrink: 0,
            }}>
              {initial}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {personName}
              </div>
              {personaInfo?.relation && (
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '1px' }}>
                  {personaInfo.relation}
                </div>
              )}
            </div>
            <span style={{
              fontSize: '0.68rem', padding: '0.2rem 0.5rem',
              background: 'rgba(167,139,250,0.15)',
              border: '1px solid rgba(167,139,250,0.3)',
              borderRadius: '9999px', color: '#a78bfa', flexShrink: 0,
            }}>
              AI
            </span>
          </div>
        ) : (
          /* ── Desktop top bar ── */
          <div style={{
            padding: '1rem 1.5rem',
            borderBottom: '1px solid rgba(30,39,56,0.6)',
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            background: 'rgba(14,17,23,0.6)', backdropFilter: 'blur(10px)',
            position: 'relative', zIndex: 10,
          }}>
            <span style={{ fontWeight: 700, fontSize: '1rem' }}>{personName}</span>
            <span style={{
              fontSize: '0.72rem', padding: '0.2rem 0.6rem',
              background: 'rgba(167,139,250,0.15)',
              border: '1px solid rgba(167,139,250,0.3)',
              borderRadius: '9999px', color: '#a78bfa',
            }}>
              AI 페르소나
            </span>
          </div>
        )}

        {/* ── Messages ── */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: isMobile ? '1rem' : '1.5rem',
          display: 'flex', flexDirection: 'column', gap: '0.75rem',
          position: 'relative', zIndex: 1,
          WebkitOverflowScrolling: 'touch',
        }}>
          {isInitializing && (
            <div style={{ textAlign: 'center', color: '#475569', marginTop: '3rem' }}>
              <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5 }} style={{ fontSize: '0.9rem' }}>
                연결 중...
              </motion.div>
            </div>
          )}

          {greetingFailed && !isInitializing && messages.length === 0 && (
            <div style={{ textAlign: 'center', marginTop: '4rem' }}>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                연결에 실패했습니다.
              </p>
              <button
                onClick={() => setRetryCount(c => c + 1)}
                style={{
                  padding: '0.65rem 1.5rem',
                  background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
                  color: '#fff', border: 'none', borderRadius: '10px',
                  fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
                  boxShadow: '0 0 12px rgba(167,139,250,0.2)',
                }}
              >
                다시 시도
              </button>
            </div>
          )}

          <AnimatePresence initial={false}>
            {(() => {
              const visibleMsgs = messages.filter(m => !m.hidden);
              return visibleMsgs.flatMap((msg, msgIdx) => {
                const isLastMsg = msgIdx === visibleMsgs.length - 1;

                const bubbles = msg.role === 'assistant'
                  ? (msg.content ? msg.content.split('\n\n').map(p => p.trim()).filter(Boolean) : [''])
                  : null;

                if (bubbles) {
                  return bubbles.map((text, bIdx) => {
                    const isLastBubble = isLastMsg && bIdx === bubbles.length - 1;
                    return (
                      <motion.div
                        key={`${msgIdx}-${bIdx}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.25rem' }}
                      >
                        <div style={{
                          maxWidth: bubbleMaxWidth, padding: '0.7rem 1rem',
                          background: 'rgba(20,24,34,0.8)',
                          border: '1px solid rgba(30,39,56,0.8)',
                          borderRadius: '18px 18px 18px 4px',
                          fontSize: '0.92rem', lineHeight: 1.6, color: '#e2e8f0', whiteSpace: 'pre-wrap',
                          boxShadow: '0 0 12px rgba(167,139,250,0.06)',
                          minWidth: '60px',
                        }}>
                          {isLoading && isLastBubble && text === '' ? <TypingDots /> : text}
                        </div>
                        {bIdx === bubbles.length - 1 && (
                          <span style={{ fontSize: '0.7rem', color: '#f4a261', opacity: 0.7, paddingLeft: '0.25rem' }}>
                            {msg.timestamp.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </motion.div>
                    );
                  });
                }

                return [(
                  <motion.div
                    key={`${msgIdx}-0`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}
                  >
                    <div style={{
                      maxWidth: bubbleMaxWidth, padding: '0.7rem 1rem',
                      background: 'linear-gradient(135deg, rgba(109,40,217,0.6), rgba(167,139,250,0.3))',
                      border: '1px solid rgba(167,139,250,0.25)',
                      borderRadius: '18px 18px 4px 18px',
                      fontSize: '0.92rem', lineHeight: 1.6, color: '#e2e8f0', whiteSpace: 'pre-wrap',
                    }}>
                      {msg.content}
                    </div>
                    <span style={{ fontSize: '0.7rem', color: '#475569', opacity: 0.7, paddingRight: '0.25rem' }}>
                      {msg.timestamp.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </motion.div>
                )];
              });
            })()}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* ── Input bar ── */}
        <div style={{
          padding: '0.75rem 1rem',
          paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))',
          borderTop: '1px solid rgba(30,39,56,0.6)',
          background: 'rgba(14,17,23,0.7)', backdropFilter: 'blur(10px)',
          display: 'flex', gap: '0.5rem', alignItems: 'flex-end',
          position: 'relative', zIndex: 10,
        }}>
          <textarea
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`${personName}에게 말을 건네보세요...`}
            rows={1}
            style={{
              flex: 1, padding: '0.75rem 1rem',
              background: 'rgba(20,24,34,0.8)',
              border: '1px solid rgba(30,39,56,0.9)',
              borderRadius: '12px', color: '#e2e8f0',
              fontSize: '16px', // 16px 미만이면 iOS에서 자동 줌인 발생
              resize: 'none', outline: 'none', lineHeight: 1.5,
              maxHeight: '120px', overflow: 'auto', fontFamily: 'inherit',
            }}
            onInput={e => {
              const el = e.target as HTMLTextAreaElement;
              el.style.height = 'auto';
              el.style.height = Math.min(el.scrollHeight, 120) + 'px';
            }}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !inputValue.trim()}
            style={{
              padding: isMobile ? '0.75rem 1.1rem' : '0.75rem 1.25rem',
              minWidth: isMobile ? '52px' : undefined,
              minHeight: isMobile ? '48px' : undefined,
              background: inputValue.trim() && !isLoading
                ? 'linear-gradient(135deg, #7c3aed, #a78bfa)'
                : 'rgba(30,39,56,0.6)',
              color: inputValue.trim() && !isLoading ? '#fff' : '#475569',
              border: 'none', borderRadius: '12px', fontWeight: 600,
              cursor: inputValue.trim() && !isLoading ? 'pointer' : 'not-allowed',
              fontSize: '0.9rem', transition: 'all 0.2s',
              boxShadow: inputValue.trim() && !isLoading ? '0 0 12px rgba(167,139,250,0.2)' : 'none',
              whiteSpace: 'nowrap', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {isLoading ? '...' : (isMobile ? '↑' : '전송')}
          </button>
        </div>
      </div>
    </div>
  );
}
