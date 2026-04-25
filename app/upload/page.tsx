'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

type Step = 'name' | 'about-me' | 'upload' | 'processing';

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.85rem 1.1rem',
  background: 'rgba(20, 24, 34, 0.8)',
  border: '1px solid rgba(30, 39, 56, 0.9)',
  borderRadius: '10px',
  color: '#e2e8f0',
  fontSize: '1rem',
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
};

export default function UploadPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('name');
  const [personName, setPersonName] = useState('');
  const [myName, setMyName] = useState('');
  const [relation, setRelation] = useState('');
  const [memo, setMemo] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);
  const [embeddingProgress, setEmbeddingProgress] = useState<{ done: number; total: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleNameSubmit = () => {
    if (!personName.trim()) {
      setError('이름을 입력해주세요.');
      return;
    }
    setError('');
    setStep('about-me');
  };

  const handleAboutMeSubmit = () => {
    if (!myName.trim()) {
      setError('상대방이 나를 부르던 이름을 입력해주세요.');
      return;
    }
    if (!relation) {
      setError('관계를 선택해주세요.');
      return;
    }
    setError('');
    setStep('upload');
  };

  const handleFile = useCallback((file: File) => {
    if (!file.name.endsWith('.txt') && !file.name.endsWith('.csv')) {
      setError('.txt 또는 .csv 파일만 업로드할 수 있습니다.');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setError('파일 크기는 50MB 이하여야 합니다. 대화를 분할해서 업로드해주세요.');
      return;
    }
    setError('');
    setSelectedFile(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('파일을 선택해주세요.');
      return;
    }

    setStep('processing');
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('personName', personName);
      formData.append('myName', myName);
      formData.append('relation', relation);
      formData.append('memo', memo);

      const res = await fetch('/api/parse', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('업로드에 실패했습니다.');
      }

      // SSE 스트림으로 진행 상황 수신
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let personaId = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split('\n\n');
        buffer = events.pop() ?? '';

        for (const event of events) {
          const line = event.replace(/^data: /, '').trim();
          if (!line) continue;
          try {
            const msg = JSON.parse(line);
            if (msg.type === 'ready') {
              personaId = msg.id;
            } else if (msg.type === 'embedding_start') {
              setEmbeddingProgress({ done: 0, total: msg.totalChunks });
            } else if (msg.type === 'embedding_progress') {
              setEmbeddingProgress({ done: msg.done, total: msg.total });
            } else if (msg.type === 'embedding_done') {
              setEmbeddingProgress({ done: msg.chunks, total: msg.chunks });
            }
          } catch { /* ignore parse errors */ }
        }
      }

      if (personaId) router.push(`/chat/${personaId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
      setStep('upload');
    }
  };

  const cardStyle: React.CSSProperties = {
    background: 'rgba(14, 17, 23, 0.75)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(30, 39, 56, 0.8)',
    borderRadius: '20px',
    padding: '2.5rem',
    width: '100%',
    maxWidth: '520px',
  };

  return (
    <main
      style={{
        background: '#07090f',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.5rem',
        color: '#e2e8f0',
      }}
    >
      {/* Back link */}
      <div style={{ width: '100%', maxWidth: '520px', marginBottom: '1.5rem' }}>
        <Link
          href="/"
          style={{
            color: '#64748b',
            textDecoration: 'none',
            fontSize: '0.9rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          ← 돌아가기
        </Link>
      </div>

      {/* Logo */}
      <div
        style={{
          fontSize: '1.2rem',
          fontWeight: 700,
          color: '#a78bfa',
          letterSpacing: '0.1em',
          marginBottom: '2rem',
        }}
      >
        echo
      </div>

      <AnimatePresence mode="wait">
        {/* ── STEP: NAME ── */}
        {step === 'name' && (
          <motion.div
            key="name"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            style={cardStyle}
          >
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              누구와의 대화인가요?
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem', lineHeight: 1.6 }}>
              이 이름으로 대화 상대를 식별합니다
            </p>

            <input
              type="text"
              placeholder="이름을 입력하세요 (예: 아빠, 민준, 지아)"
              value={personName}
              onChange={e => setPersonName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleNameSubmit()}
              onFocus={e => {
                e.target.style.borderColor = '#a78bfa';
                e.target.style.boxShadow = '0 0 0 3px rgba(167,139,250,0.15)';
              }}
              onBlur={e => {
                e.target.style.borderColor = 'rgba(30, 39, 56, 0.9)';
                e.target.style.boxShadow = 'none';
              }}
              style={{ ...inputStyle, marginBottom: '1rem' }}
              autoFocus
            />

            {error && (
              <p style={{ color: '#f87171', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</p>
            )}

            <button
              onClick={handleNameSubmit}
              style={{
                width: '100%',
                padding: '0.85rem',
                background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 600,
                fontSize: '1rem',
                cursor: 'pointer',
                boxShadow: '0 0 16px rgba(167,139,250,0.25)',
              }}
            >
              다음 →
            </button>
          </motion.div>
        )}

        {/* ── STEP: ABOUT ME ── */}
        {step === 'about-me' && (
          <motion.div
            key="about-me"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            style={cardStyle}
          >
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.4rem' }}>
              <span style={{ color: '#c4b5fd' }}>{personName}</span>은
              <br />
              나를 뭐라고 불렀나요?
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem', lineHeight: 1.6 }}>
              AI가 당신을 알아야 진짜 대화처럼 느껴집니다
            </p>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.82rem', marginBottom: '0.4rem' }}>
                상대방이 나를 부르던 이름/별명 *
              </label>
              <input
                type="text"
                placeholder="예: 민수, 오빠, 자기, 친구야"
                value={myName}
                onChange={e => setMyName(e.target.value)}
                onFocus={e => { e.target.style.borderColor = '#a78bfa'; e.target.style.boxShadow = '0 0 0 3px rgba(167,139,250,0.15)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(30,39,56,0.9)'; e.target.style.boxShadow = 'none'; }}
                style={inputStyle}
                autoFocus
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.82rem', marginBottom: '0.4rem' }}>
                관계 *
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {['연인', '친구', '가족', '직장동료', '기타'].map(r => (
                  <button
                    key={r}
                    onClick={() => setRelation(r)}
                    style={{
                      padding: '0.45rem 1rem',
                      borderRadius: '9999px',
                      border: `1px solid ${relation === r ? '#a78bfa' : 'rgba(30,39,56,0.9)'}`,
                      background: relation === r ? 'rgba(167,139,250,0.15)' : 'transparent',
                      color: relation === r ? '#c4b5fd' : '#64748b',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.82rem', marginBottom: '0.4rem' }}>
                한 줄 메모 <span style={{ color: '#475569' }}>(선택)</span>
              </label>
              <input
                type="text"
                placeholder="예: 3년 사귀었어, 고등학교 친구, 첫 직장 동료"
                value={memo}
                onChange={e => setMemo(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAboutMeSubmit()}
                onFocus={e => { e.target.style.borderColor = '#a78bfa'; e.target.style.boxShadow = '0 0 0 3px rgba(167,139,250,0.15)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(30,39,56,0.9)'; e.target.style.boxShadow = 'none'; }}
                style={inputStyle}
              />
            </div>

            {error && (
              <p style={{ color: '#f87171', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</p>
            )}

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => { setError(''); setStep('name'); }}
                style={{
                  flex: 1,
                  padding: '0.85rem',
                  background: 'transparent',
                  color: '#64748b',
                  border: '1px solid rgba(30,39,56,0.9)',
                  borderRadius: '10px',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                }}
              >
                ← 이전
              </button>
              <button
                onClick={handleAboutMeSubmit}
                style={{
                  flex: 2,
                  padding: '0.85rem',
                  background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 600,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  boxShadow: '0 0 16px rgba(167,139,250,0.25)',
                }}
              >
                다음 →
              </button>
            </div>
          </motion.div>
        )}

        {/* ── STEP: UPLOAD ── */}
        {step === 'upload' && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            style={cardStyle}
          >
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.4rem' }}>
              <span style={{ color: '#c4b5fd' }}>{personName}</span>와의 대화를
              <br />
              불러와주세요
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem' }}>
              카카오톡 대화 내보내기 파일 (.txt 또는 .csv)
            </p>

            {/* Drop zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              style={{
                border: `2px dashed ${isDragging ? '#a78bfa' : selectedFile ? '#6d28d9' : 'rgba(30,39,56,0.9)'}`,
                borderRadius: '14px',
                padding: '2.5rem 1.5rem',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                background: isDragging
                  ? 'rgba(167,139,250,0.05)'
                  : selectedFile
                    ? 'rgba(109,40,217,0.06)'
                    : 'transparent',
                boxShadow: isDragging ? '0 0 20px rgba(167,139,250,0.15)' : 'none',
                marginBottom: '1.25rem',
              }}
            >
              {/* Chat bubble icon */}
              <svg
                width="48"
                height="48"
                viewBox="0 0 48 48"
                fill="none"
                style={{ margin: '0 auto 1rem', display: 'block', opacity: selectedFile ? 1 : 0.5 }}
              >
                <rect x="4" y="8" width="40" height="28" rx="8" fill={selectedFile ? '#6d28d9' : '#1e2738'} />
                <rect x="4" y="8" width="40" height="28" rx="8" stroke={selectedFile ? '#a78bfa' : '#334155'} strokeWidth="2" />
                <path d="M16 40 L20 36 H10 Q8 36 8 34 V34" fill={selectedFile ? '#6d28d9' : '#1e2738'} />
                <circle cx="16" cy="22" r="2.5" fill={selectedFile ? '#c4b5fd' : '#475569'} />
                <circle cx="24" cy="22" r="2.5" fill={selectedFile ? '#c4b5fd' : '#475569'} />
                <circle cx="32" cy="22" r="2.5" fill={selectedFile ? '#c4b5fd' : '#475569'} />
              </svg>

              {selectedFile ? (
                <>
                  <p style={{ color: '#c4b5fd', fontWeight: 600, marginBottom: '0.25rem' }}>
                    {selectedFile.name}
                  </p>
                  <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
                    {(selectedFile.size / 1024).toFixed(1)} KB · 클릭하여 변경
                  </p>
                </>
              ) : (
                <>
                  <p style={{ color: '#94a3b8', fontWeight: 500, marginBottom: '0.4rem' }}>
                    카카오톡 대화 파일을 드래그하거나 클릭해서 업로드하세요
                  </p>
                  <p style={{ color: '#475569', fontSize: '0.8rem' }}>
                    .txt 또는 .csv · 대화방 내보내기 후 저장된 파일
                  </p>
                </>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.csv"
              onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
              style={{ display: 'none' }}
            />

            {/* Instructions accordion */}
            <div
              style={{
                border: '1px solid rgba(30,39,56,0.7)',
                borderRadius: '10px',
                marginBottom: '1.25rem',
                overflow: 'hidden',
              }}
            >
              <button
                onClick={() => setIsInstructionsOpen(v => !v)}
                style={{
                  width: '100%',
                  padding: '0.8rem 1.1rem',
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>카카오톡 내보내기 방법</span>
                <span style={{ transition: 'transform 0.2s', transform: isInstructionsOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
              </button>
              <AnimatePresence>
                {isInstructionsOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <ol
                      style={{
                        padding: '0.5rem 1.1rem 1rem 2.2rem',
                        color: '#64748b',
                        fontSize: '0.85rem',
                        lineHeight: 2,
                        margin: 0,
                      }}
                    >
                      <li>카카오톡 앱에서 대화방을 엽니다</li>
                      <li>오른쪽 상단 메뉴(≡) → 대화 내보내기</li>
                      <li>텍스트 파일(.txt) 또는 CSV(.csv)로 저장합니다</li>
                      <li>PC 카카오톡은 .csv, 모바일은 .txt로 내보내기 됩니다</li>
                      <li>저장된 파일을 위에 업로드하세요</li>
                    </ol>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Privacy notice */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.7rem 1rem',
              background: 'rgba(167,139,250,0.06)',
              border: '1px solid rgba(167,139,250,0.15)',
              borderRadius: '10px',
              marginBottom: '1rem',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <span style={{ color: '#64748b', fontSize: '0.8rem', lineHeight: 1.5 }}>
                업로드된 대화는 <strong style={{ color: '#94a3b8' }}>암호화되어 저장</strong>되며, 운영자를 포함한 누구도 내용을 볼 수 없습니다.
              </span>
            </div>

            {error && (
              <p style={{ color: '#f87171', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</p>
            )}

            <button
              onClick={handleUpload}
              disabled={!selectedFile}
              style={{
                width: '100%',
                padding: '0.85rem',
                background: selectedFile
                  ? 'linear-gradient(135deg, #7c3aed, #a78bfa)'
                  : 'rgba(30,39,56,0.6)',
                color: selectedFile ? '#fff' : '#475569',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 600,
                fontSize: '1rem',
                cursor: selectedFile ? 'pointer' : 'not-allowed',
                boxShadow: selectedFile ? '0 0 16px rgba(167,139,250,0.25)' : 'none',
                transition: 'all 0.25s',
              }}
            >
              분석 시작하기 →
            </button>
          </motion.div>
        )}

        {/* ── STEP: PROCESSING ── */}
        {step === 'processing' && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            style={{ ...cardStyle, textAlign: 'center' }}
          >
            {/* Pulsing violet orb */}
            <div style={{ position: 'relative', width: '80px', height: '80px', margin: '0 auto 2rem' }}>
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0.2, 0.6] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                style={{
                  position: 'absolute',
                  inset: '-10px',
                  borderRadius: '50%',
                  background: 'rgba(167,139,250,0.15)',
                }}
              />
              <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [0.8, 0.4, 0.8] }}
                transition={{ repeat: Infinity, duration: 2, delay: 0.3, ease: 'easeInOut' }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
                }}
              />
            </div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              {embeddingProgress ? '기억을 학습하고 있어요...' : '대화를 분석하고 있어요...'}
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
              {embeddingProgress
                ? `${personName}과의 모든 기억을 저장하는 중입니다`
                : '말투, 어휘, 표현 방식을 학습합니다'}
            </p>

            {embeddingProgress && (
              <div style={{ width: '100%' }}>
                <div style={{
                  height: '4px',
                  background: 'rgba(30,39,56,0.8)',
                  borderRadius: '9999px',
                  overflow: 'hidden',
                  marginBottom: '0.75rem',
                }}>
                  <motion.div
                    animate={{ width: `${Math.round(embeddingProgress.done / embeddingProgress.total * 100)}%` }}
                    transition={{ duration: 0.3 }}
                    style={{
                      height: '100%',
                      background: 'linear-gradient(90deg, #7c3aed, #a78bfa)',
                      borderRadius: '9999px',
                    }}
                  />
                </div>
                <p style={{ color: '#64748b', fontSize: '0.78rem' }}>
                  {embeddingProgress.done.toLocaleString()} / {embeddingProgress.total.toLocaleString()} 청크
                  &nbsp;·&nbsp;
                  {Math.round(embeddingProgress.done / embeddingProgress.total * 100)}%
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
