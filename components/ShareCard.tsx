'use client';

import { useRef, useState } from 'react';
import { toPng } from 'html-to-image';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Props {
  personName: string;
  messages: Message[];
  onClose: () => void;
}

export default function ShareCard({ personName, messages, onClose }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [capturing, setCapturing] = useState(false);

  type Bubble = { role: 'user' | 'assistant'; text: string };

  // last 6 visible messages, truncated per bubble
  const preview: Bubble[] = messages
    .filter(m => m.content.trim())
    .slice(-6)
    .flatMap((m): Bubble[] => {
      if (m.role === 'assistant') {
        return m.content.split('\n\n').map(p => p.trim()).filter(Boolean).map(text => ({
          role: 'assistant' as const,
          text: text.length > 120 ? text.slice(0, 117) + '…' : text,
        }));
      }
      const text = m.content;
      return [{ role: 'user' as const, text: text.length > 120 ? text.slice(0, 117) + '…' : text }];
    })
    .slice(-6);

  const initial = personName.charAt(0).toUpperCase();

  const handleSave = async () => {
    if (!cardRef.current) return;
    setCapturing(true);
    try {
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 3, cacheBust: true });

      if (navigator.share && navigator.canShare?.({ files: [] })) {
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], 'echo-memory.png', { type: 'image/png' });
        await navigator.share({ files: [file], title: `${personName}과의 대화` });
      } else {
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `echo-${personName}.png`;
        a.click();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCapturing(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      {/* card */}
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '400px' }}>
        <div
          ref={cardRef}
          style={{
            background: 'linear-gradient(160deg, #0d1020 0%, #0a0d18 50%, #0f0a1e 100%)',
            borderRadius: '20px',
            padding: '1.5rem',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {/* subtle glow */}
          <div style={{
            position: 'absolute', top: '-60px', right: '-60px',
            width: '200px', height: '200px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          {/* header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(124,58,237,0.4), rgba(167,139,250,0.25))',
              border: '1.5px solid rgba(167,139,250,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.1rem', fontWeight: 700, color: '#c4b5fd', flexShrink: 0,
            }}>
              {initial}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#e2e8f0' }}>{personName}</div>
              <div style={{
                fontSize: '0.65rem', marginTop: '2px',
                background: 'rgba(167,139,250,0.15)',
                border: '1px solid rgba(167,139,250,0.3)',
                borderRadius: '9999px',
                padding: '0.1rem 0.45rem',
                color: '#a78bfa', display: 'inline-block',
              }}>
                AI
              </div>
            </div>
          </div>

          {/* bubbles */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {preview.map((m, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
              }}>
                <div style={{
                  maxWidth: '82%',
                  padding: '0.6rem 0.85rem',
                  borderRadius: m.role === 'user'
                    ? '16px 16px 4px 16px'
                    : '16px 16px 16px 4px',
                  background: m.role === 'user'
                    ? 'linear-gradient(135deg, rgba(109,40,217,0.7), rgba(167,139,250,0.4))'
                    : 'rgba(20,24,34,0.9)',
                  border: m.role === 'user'
                    ? '1px solid rgba(167,139,250,0.3)'
                    : '1px solid rgba(30,39,56,0.9)',
                  fontSize: '0.82rem', lineHeight: 1.55,
                  color: '#e2e8f0', whiteSpace: 'pre-wrap',
                }}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          {/* footer */}
          <div style={{
            marginTop: '1.25rem', paddingTop: '1rem',
            borderTop: '1px solid rgba(30,39,56,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: '1rem', fontWeight: 700, color: '#a78bfa', letterSpacing: '0.1em' }}>echo</span>
            <span style={{ fontSize: '0.65rem', color: '#334155' }}>minghaus.vercel.app</span>
          </div>
        </div>

        {/* buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
          <button
            onClick={handleSave}
            disabled={capturing}
            style={{
              flex: 1, padding: '0.85rem',
              background: capturing ? 'rgba(30,39,56,0.6)' : 'linear-gradient(135deg, #7c3aed, #a78bfa)',
              color: capturing ? '#475569' : '#fff',
              border: 'none', borderRadius: '12px',
              fontWeight: 600, fontSize: '0.9rem', cursor: capturing ? 'not-allowed' : 'pointer',
              boxShadow: capturing ? 'none' : '0 0 16px rgba(167,139,250,0.25)',
            }}
          >
            {capturing ? '저장 중…' : '📷 이미지 저장'}
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '0.85rem 1.1rem',
              background: 'rgba(30,39,56,0.4)',
              color: '#64748b', border: '1px solid rgba(30,39,56,0.6)',
              borderRadius: '12px', cursor: 'pointer', fontSize: '0.9rem',
            }}
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
