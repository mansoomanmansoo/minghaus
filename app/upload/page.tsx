'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

type Step = 'name' | 'about-me' | 'source' | 'upload' | 'text-input' | 'processing';
type PlatformId = 'kakao' | 'whatsapp' | 'line' | 'text';

interface PlatformInfo {
  id: PlatformId;
  label: string;
  icon: string;
  desc: string;
  color: string;
}

const PLATFORMS: PlatformInfo[] = [
  { id: 'kakao',    label: '카카오톡',  icon: '💬', desc: '.txt / .csv 내보내기',        color: '#f9e200' },
  { id: 'whatsapp', label: 'WhatsApp', icon: '🟢', desc: '.txt 채팅 내보내기',           color: '#25d366' },
  { id: 'line',     label: 'Line',     icon: '🟩', desc: '.txt 대화 내보내기',           color: '#06c755' },
  { id: 'text',     label: '직접 입력', icon: '✏️', desc: '파일 없이 말투·추억 직접 묘사', color: '#a78bfa' },
];

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

const GUIDE: Record<Exclude<PlatformId, 'text'>, { ios: string[]; android?: string[]; pc?: string[] }> = {
  kakao: {
    ios:     ['카카오톡 → 대화방 열기', '우상단 ≡ 터치', '대화 내보내기 → 텍스트 파일', '파일에 저장 선택', '저장된 .txt 파일 업로드'],
    android: ['카카오톡 → 대화방 열기', '우상단 ≡ 터치', '채팅방 설정 → 대화 내보내기', '텍스트만 선택 → 저장', '저장된 .txt 파일 업로드'],
    pc:      ['카카오톡 → 대화방 열기', '오른쪽 상단 ≡ → 대화 내보내기', '.csv 또는 .txt로 저장', '저장된 파일 업로드'],
  },
  whatsapp: {
    ios:     ['WhatsApp → 채팅방 열기', '상단 이름 탭 → 아래로 스크롤', '채팅 내보내기 → 미디어 없이', '파일로 저장', '저장된 .txt 파일 업로드'],
    android: ['WhatsApp → 채팅방 열기', '우상단 ⋮ → 더보기', '채팅 내보내기 → 미디어 없이', '.txt 파일로 저장', '저장된 .txt 파일 업로드'],
    pc:      ['WhatsApp Web/Desktop → 채팅방 열기', '우상단 ⋮ → 채팅 내보내기', '미디어 없이 선택 → .txt 저장', '저장된 파일 업로드'],
  },
  line: {
    ios:     ['Line → 채팅방 열기', '우상단 ≡ → 채팅 설정', '대화 내보내기 → 텍스트 저장', '파일로 저장', '저장된 .txt 파일 업로드'],
    android: ['Line → 채팅방 열기', '우상단 ≡ → 채팅 설정', '대화 내보내기 → 텍스트 저장', '저장된 .txt 파일 업로드'],
    pc:      ['Line → 대화방 열기', '우상단 ≡ → 대화 내보내기', '텍스트로 저장 → .txt 파일', '저장된 파일 업로드'],
  },
};

export default function UploadPage() {
  const router = useRouter();
  const [step, setStep]               = useState<Step>('name');
  const [platform, setPlatform]       = useState<PlatformId>('kakao');
  const [personName, setPersonName]   = useState('');
  const [myName, setMyName]           = useState('');
  const [relation, setRelation]       = useState('');
  const [memo, setMemo]               = useState('');
  const [description, setDescription] = useState('');
  const [isDragging, setIsDragging]   = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError]             = useState('');
  const [guideOS, setGuideOS]         = useState<'ios' | 'android' | 'pc'>('pc');
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [embeddingProgress, setEmbeddingProgress] = useState<{ done: number; total: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const ua = navigator.userAgent;
    if (/iphone|ipad|ipod/i.test(ua)) setGuideOS('ios');
    else if (/android/i.test(ua))      setGuideOS('android');
    else                               setGuideOS('pc');
  }, []);

  const cardStyle: React.CSSProperties = {
    background: 'rgba(14, 17, 23, 0.75)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(30, 39, 56, 0.8)',
    borderRadius: '20px',
    padding: '2.5rem',
    width: '100%',
    maxWidth: '520px',
  };

  const handleNameSubmit = () => {
    if (!personName.trim()) { setError('이름을 입력해주세요.'); return; }
    setError('');
    setStep('about-me');
  };

  const handleAboutMeSubmit = () => {
    if (!myName.trim()) { setError('상대방이 나를 부르던 이름을 입력해주세요.'); return; }
    if (!relation)      { setError('관계를 선택해주세요.'); return; }
    setError('');
    setStep('source');
  };

  const handleSourceSelect = (p: PlatformId) => {
    setPlatform(p);
    setSelectedFile(null);
    setDescription('');
    setError('');
    setStep(p === 'text' ? 'text-input' : 'upload');
  };

  const handleFile = useCallback((file: File) => {
    if (!file.name.endsWith('.txt') && !file.name.endsWith('.csv')) {
      setError('.txt 또는 .csv 파일만 업로드할 수 있습니다.'); return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setError('파일 크기는 50MB 이하여야 합니다. 대화를 분할해서 업로드해주세요.'); return;
    }
    setError('');
    setSelectedFile(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const startProcessing = async (formData: FormData) => {
    setStep('processing');
    setError('');
    try {
      const res = await fetch('/api/parse', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('업로드에 실패했습니다.');

      const reader  = res.body!.getReader();
      const decoder = new TextDecoder();
      let personaId = '';
      let buffer    = '';

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
            if (msg.type === 'ready')              personaId = msg.id;
            if (msg.type === 'embedding_start')    setEmbeddingProgress({ done: 0, total: msg.totalChunks });
            if (msg.type === 'embedding_progress') setEmbeddingProgress({ done: msg.done, total: msg.total });
            if (msg.type === 'embedding_done')     setEmbeddingProgress({ done: msg.chunks, total: msg.chunks });
          } catch { /* ignore */ }
        }
      }

      if (personaId) router.push(`/chat/${personaId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
      setStep(platform === 'text' ? 'text-input' : 'upload');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) { setError('파일을 선택해주세요.'); return; }
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('personName', personName);
    formData.append('myName', myName);
    formData.append('relation', relation);
    formData.append('memo', memo);
    formData.append('platform', platform);
    await startProcessing(formData);
  };

  const handleTextSubmit = async () => {
    if (!description.trim()) { setError('설명을 입력해주세요.'); return; }
    const formData = new FormData();
    formData.append('description', description);
    formData.append('personName', personName);
    formData.append('myName', myName);
    formData.append('relation', relation);
    formData.append('memo', memo);
    formData.append('platform', 'text');
    await startProcessing(formData);
  };

  const guideSteps = (() => {
    if (platform === 'text') return [];
    const info = GUIDE[platform as Exclude<PlatformId, 'text'>];
    if (guideOS === 'ios' && info.ios)         return info.ios;
    if (guideOS === 'android' && info.android) return info.android;
    return info.pc ?? info.ios ?? [];
  })();

  const guideLabel: Record<Exclude<PlatformId, 'text'>, string> = {
    kakao:    '카카오톡 내보내기 방법',
    whatsapp: 'WhatsApp 내보내기 방법',
    line:     'Line 내보내기 방법',
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
      <div style={{ width: '100%', maxWidth: '520px', marginBottom: '1.5rem' }}>
        <Link href="/" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
          ← 돌아가기
        </Link>
      </div>

      <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#a78bfa', letterSpacing: '0.1em', marginBottom: '2rem' }}>
        echo
      </div>

      <AnimatePresence mode="wait">

        {/* ── NAME ── */}
        {step === 'name' && (
          <motion.div key="name" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }} style={cardStyle}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>누구와의 대화인가요?</h1>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem', lineHeight: 1.6 }}>이 이름으로 대화 상대를 식별합니다</p>
            <input
              type="text"
              placeholder="이름을 입력하세요 (예: 아빠, 민준, 지아)"
              value={personName}
              onChange={e => setPersonName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleNameSubmit()}
              onFocus={e => { e.target.style.borderColor = '#a78bfa'; e.target.style.boxShadow = '0 0 0 3px rgba(167,139,250,0.15)'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(30, 39, 56, 0.9)'; e.target.style.boxShadow = 'none'; }}
              style={{ ...inputStyle, marginBottom: '1rem' }}
              autoFocus
            />
            {error && <p style={{ color: '#f87171', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</p>}
            <button onClick={handleNameSubmit} style={{ width: '100%', padding: '0.85rem', background: 'linear-gradient(135deg, #7c3aed, #a78bfa)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 0 16px rgba(167,139,250,0.25)' }}>
              다음 →
            </button>
          </motion.div>
        )}

        {/* ── ABOUT ME ── */}
        {step === 'about-me' && (
          <motion.div key="about-me" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }} style={cardStyle}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.4rem' }}>
              <span style={{ color: '#c4b5fd' }}>{personName}</span>은<br />나를 뭐라고 불렀나요?
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem', lineHeight: 1.6 }}>AI가 당신을 알아야 진짜 대화처럼 느껴집니다</p>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.82rem', marginBottom: '0.4rem' }}>상대방이 나를 부르던 이름/별명 *</label>
              <input type="text" placeholder="예: 민수, 오빠, 자기, 친구야" value={myName} onChange={e => setMyName(e.target.value)}
                onFocus={e => { e.target.style.borderColor = '#a78bfa'; e.target.style.boxShadow = '0 0 0 3px rgba(167,139,250,0.15)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(30,39,56,0.9)'; e.target.style.boxShadow = 'none'; }}
                style={inputStyle} autoFocus />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.82rem', marginBottom: '0.4rem' }}>관계 *</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {['연인', '친구', '가족', '직장동료', '기타'].map(r => (
                  <button key={r} onClick={() => setRelation(r)} style={{
                    padding: '0.45rem 1rem', borderRadius: '9999px',
                    border: `1px solid ${relation === r ? '#a78bfa' : 'rgba(30,39,56,0.9)'}`,
                    background: relation === r ? 'rgba(167,139,250,0.15)' : 'transparent',
                    color: relation === r ? '#c4b5fd' : '#64748b',
                    fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s',
                  }}>{r}</button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.82rem', marginBottom: '0.4rem' }}>
                한 줄 메모 <span style={{ color: '#475569' }}>(선택)</span>
              </label>
              <input type="text" placeholder="예: 3년 사귀었어, 고등학교 친구" value={memo} onChange={e => setMemo(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAboutMeSubmit()}
                onFocus={e => { e.target.style.borderColor = '#a78bfa'; e.target.style.boxShadow = '0 0 0 3px rgba(167,139,250,0.15)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(30,39,56,0.9)'; e.target.style.boxShadow = 'none'; }}
                style={inputStyle} />
            </div>

            {error && <p style={{ color: '#f87171', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</p>}

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => { setError(''); setStep('name'); }} style={{ flex: 1, padding: '0.85rem', background: 'transparent', color: '#64748b', border: '1px solid rgba(30,39,56,0.9)', borderRadius: '10px', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer' }}>← 이전</button>
              <button onClick={handleAboutMeSubmit} style={{ flex: 2, padding: '0.85rem', background: 'linear-gradient(135deg, #7c3aed, #a78bfa)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 0 16px rgba(167,139,250,0.25)' }}>다음 →</button>
            </div>
          </motion.div>
        )}

        {/* ── SOURCE ── */}
        {step === 'source' && (
          <motion.div key="source" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }} style={cardStyle}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.4rem' }}>어떤 방식으로 알려줄까요?</h1>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.75rem', lineHeight: 1.6 }}>
              대화 파일을 내보내거나, 직접 묘사할 수 있어요
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.75rem' }}>
              {PLATFORMS.map(p => (
                <button
                  key={p.id}
                  onClick={() => handleSourceSelect(p.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '1rem',
                    padding: '1rem 1.25rem',
                    background: 'rgba(20, 24, 34, 0.6)',
                    border: '1px solid rgba(30, 39, 56, 0.9)',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'left',
                    width: '100%',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = p.color + '66';
                    (e.currentTarget as HTMLButtonElement).style.background  = p.color + '11';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(30, 39, 56, 0.9)';
                    (e.currentTarget as HTMLButtonElement).style.background  = 'rgba(20, 24, 34, 0.6)';
                  }}
                >
                  <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{p.icon}</span>
                  <div>
                    <p style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.95rem', margin: 0 }}>{p.label}</p>
                    <p style={{ color: '#64748b', fontSize: '0.8rem', margin: 0 }}>{p.desc}</p>
                  </div>
                  <span style={{ marginLeft: 'auto', color: '#475569', fontSize: '0.85rem' }}>→</span>
                </button>
              ))}
            </div>

            <button onClick={() => { setError(''); setStep('about-me'); }} style={{ width: '100%', padding: '0.75rem', background: 'transparent', color: '#64748b', border: '1px solid rgba(30,39,56,0.9)', borderRadius: '10px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>← 이전</button>
          </motion.div>
        )}

        {/* ── UPLOAD ── */}
        {step === 'upload' && (
          <motion.div key="upload" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }} style={cardStyle}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.4rem' }}>
              <span style={{ color: '#c4b5fd' }}>{personName}</span>와의 대화를<br />불러와주세요
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
              {platform === 'kakao' ? '카카오톡' : platform === 'whatsapp' ? 'WhatsApp' : 'Line'} 내보내기 파일 (.txt{platform === 'kakao' ? ' 또는 .csv' : ''})
            </p>

            {/* 모바일: 가이드 먼저 */}
            {guideOS !== 'pc' && guideSteps.length > 0 && (
              <div style={{ background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: '14px', padding: '1.25rem', marginBottom: '1.25rem' }}>
                <p style={{ color: '#a78bfa', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.1em', marginBottom: '1rem' }}>
                  📱 {guideOS === 'ios' ? 'iPhone' : 'Android'}에서 내보내기
                </p>
                <ol style={{ margin: 0, paddingLeft: '1.25rem', color: '#94a3b8', fontSize: '0.9rem', lineHeight: 2.2 }}>
                  {guideSteps.map((s, i) => <li key={i}>{s}</li>)}
                </ol>
              </div>
            )}

            {/* 파일 선택 */}
            {guideOS !== 'pc' ? (
              <div style={{ marginBottom: '1.25rem' }}>
                {selectedFile && (
                  <div style={{ border: '2px solid #6d28d9', borderRadius: '14px', padding: '1.5rem', textAlign: 'center', background: 'rgba(109,40,217,0.06)', marginBottom: '0.75rem' }}>
                    <p style={{ color: '#c4b5fd', fontWeight: 600, marginBottom: '0.25rem' }}>{selectedFile.name}</p>
                    <p style={{ color: '#64748b', fontSize: '0.85rem' }}>{(selectedFile.size / 1024 / 1024).toFixed(1)} MB</p>
                  </div>
                )}
                <button onClick={() => fileInputRef.current?.click()} style={{ width: '100%', padding: '1rem', background: selectedFile ? 'rgba(109,40,217,0.15)' : 'rgba(167,139,250,0.08)', border: `2px dashed ${selectedFile ? '#6d28d9' : 'rgba(167,139,250,0.3)'}`, borderRadius: '14px', color: selectedFile ? '#c4b5fd' : '#94a3b8', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' }}>
                  {selectedFile ? '다른 파일 선택' : '📂  파일 선택하기'}
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                style={{
                  border: `2px dashed ${isDragging ? '#a78bfa' : selectedFile ? '#6d28d9' : 'rgba(30,39,56,0.9)'}`,
                  borderRadius: '14px', padding: '2.5rem 1.5rem', textAlign: 'center',
                  cursor: 'pointer', transition: 'all 0.25s ease',
                  background: isDragging ? 'rgba(167,139,250,0.05)' : selectedFile ? 'rgba(109,40,217,0.06)' : 'transparent',
                  boxShadow: isDragging ? '0 0 20px rgba(167,139,250,0.15)' : 'none',
                  marginBottom: '1.25rem',
                }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem', opacity: selectedFile ? 1 : 0.5 }}>
                  {platform === 'kakao' ? '💬' : platform === 'whatsapp' ? '🟢' : '🟩'}
                </div>
                {selectedFile ? (
                  <>
                    <p style={{ color: '#c4b5fd', fontWeight: 600, marginBottom: '0.25rem' }}>{selectedFile.name}</p>
                    <p style={{ color: '#64748b', fontSize: '0.85rem' }}>{(selectedFile.size / 1024).toFixed(1)} KB · 클릭하여 변경</p>
                  </>
                ) : (
                  <>
                    <p style={{ color: '#94a3b8', fontWeight: 500, marginBottom: '0.4rem' }}>파일을 드래그하거나 클릭해서 업로드</p>
                    <p style={{ color: '#475569', fontSize: '0.8rem' }}>.txt{platform === 'kakao' ? ' 또는 .csv' : ''}</p>
                  </>
                )}
              </div>
            )}

            <input ref={fileInputRef} type="file" accept=".txt,.csv" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} style={{ display: 'none' }} />

            {/* PC 가이드 아코디언 */}
            {guideOS === 'pc' && guideSteps.length > 0 && (
              <div style={{ border: '1px solid rgba(30,39,56,0.7)', borderRadius: '10px', marginBottom: '1.25rem', overflow: 'hidden' }}>
                <button onClick={() => setIsGuideOpen(v => !v)} style={{ width: '100%', padding: '0.8rem 1.1rem', background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '0.875rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{guideLabel[platform as Exclude<PlatformId, 'text'>]}</span>
                  <span style={{ transition: 'transform 0.2s', transform: isGuideOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
                </button>
                <AnimatePresence>
                  {isGuideOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} style={{ overflow: 'hidden' }}>
                      <ol style={{ padding: '0.5rem 1.1rem 1rem 2.2rem', color: '#64748b', fontSize: '0.85rem', lineHeight: 2, margin: 0 }}>
                        {guideSteps.map((s, i) => <li key={i}>{s}</li>)}
                      </ol>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Privacy */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 1rem', background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.15)', borderRadius: '10px', marginBottom: '1rem' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <span style={{ color: '#64748b', fontSize: '0.8rem', lineHeight: 1.5 }}>
                업로드된 대화는 <strong style={{ color: '#94a3b8' }}>암호화되어 저장</strong>되며, 운영자를 포함한 누구도 내용을 볼 수 없습니다.
              </span>
            </div>

            {error && <p style={{ color: '#f87171', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</p>}

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => { setError(''); setStep('source'); }} style={{ flex: 1, padding: '0.85rem', background: 'transparent', color: '#64748b', border: '1px solid rgba(30,39,56,0.9)', borderRadius: '10px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>← 이전</button>
              <button onClick={handleUpload} disabled={!selectedFile} style={{ flex: 2, padding: '0.85rem', background: selectedFile ? 'linear-gradient(135deg, #7c3aed, #a78bfa)' : 'rgba(30,39,56,0.6)', color: selectedFile ? '#fff' : '#475569', border: 'none', borderRadius: '10px', fontWeight: 600, fontSize: '1rem', cursor: selectedFile ? 'pointer' : 'not-allowed', boxShadow: selectedFile ? '0 0 16px rgba(167,139,250,0.25)' : 'none', transition: 'all 0.25s' }}>
                분석 시작하기 →
              </button>
            </div>
          </motion.div>
        )}

        {/* ── TEXT INPUT ── */}
        {step === 'text-input' && (
          <motion.div key="text-input" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }} style={cardStyle}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.4rem' }}>
              <span style={{ color: '#c4b5fd' }}>{personName}</span>을<br />직접 묘사해주세요
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.75rem', lineHeight: 1.6 }}>
              말투, 자주 쓰던 표현, 이모지 습관, 우리 사이의 추억 등을 자유롭게 적어주세요. 많을수록 더 비슷해집니다.
            </p>

            <textarea
              placeholder={`예시:\n- 항상 "ㅋㅋ"나 "ㅎㅎ"로 문장을 끝냈어\n- 먼저 연락을 자주 했고 항상 따뜻하게 안부를 물었어\n- 음식 얘기를 정말 좋아했고 맛집 추천을 많이 해줬어\n- "자기야", "오빠"라고 불렀어\n- 이모지는 거의 안 쓰고 대신 "ㅠㅠ", "~~"를 자주 썼어\n- 우리는 매주 토요일마다 카페에서 만났어`}
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={10}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.7, fontFamily: 'inherit', marginBottom: '1rem' }}
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 1rem', background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.15)', borderRadius: '10px', marginBottom: '1rem' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span style={{ color: '#64748b', fontSize: '0.8rem', lineHeight: 1.5 }}>
                나중에라도 <strong style={{ color: '#94a3b8' }}>카카오톡·WhatsApp·Line 파일</strong>을 추가하면 더 정교해집니다
              </span>
            </div>

            {error && <p style={{ color: '#f87171', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</p>}

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => { setError(''); setStep('source'); }} style={{ flex: 1, padding: '0.85rem', background: 'transparent', color: '#64748b', border: '1px solid rgba(30,39,56,0.9)', borderRadius: '10px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>← 이전</button>
              <button onClick={handleTextSubmit} disabled={!description.trim()} style={{ flex: 2, padding: '0.85rem', background: description.trim() ? 'linear-gradient(135deg, #7c3aed, #a78bfa)' : 'rgba(30,39,56,0.6)', color: description.trim() ? '#fff' : '#475569', border: 'none', borderRadius: '10px', fontWeight: 600, fontSize: '1rem', cursor: description.trim() ? 'pointer' : 'not-allowed', boxShadow: description.trim() ? '0 0 16px rgba(167,139,250,0.25)' : 'none', transition: 'all 0.25s' }}>
                대화 시작하기 →
              </button>
            </div>
          </motion.div>
        )}

        {/* ── PROCESSING ── */}
        {step === 'processing' && (
          <motion.div key="processing" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} style={{ ...cardStyle, textAlign: 'center' }}>
            <div style={{ position: 'relative', width: '80px', height: '80px', margin: '0 auto 2rem' }}>
              <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0.2, 0.6] }} transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                style={{ position: 'absolute', inset: '-10px', borderRadius: '50%', background: 'rgba(167,139,250,0.15)' }} />
              <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.8, 0.4, 0.8] }} transition={{ repeat: Infinity, duration: 2, delay: 0.3, ease: 'easeInOut' }}
                style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #a78bfa)' }} />
            </div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              {embeddingProgress ? '기억을 학습하고 있어요...' : `${personName}을 준비하고 있어요...`}
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
              {embeddingProgress
                ? `${personName}과의 모든 기억을 저장하는 중입니다`
                : platform === 'text' ? '설명을 바탕으로 페르소나를 구성합니다' : '말투, 어휘, 표현 방식을 학습합니다'}
            </p>

            {embeddingProgress && (
              <div style={{ width: '100%' }}>
                <div style={{ height: '4px', background: 'rgba(30,39,56,0.8)', borderRadius: '9999px', overflow: 'hidden', marginBottom: '0.75rem' }}>
                  <motion.div
                    animate={{ width: `${Math.round(embeddingProgress.done / embeddingProgress.total * 100)}%` }}
                    transition={{ duration: 0.3 }}
                    style={{ height: '100%', background: 'linear-gradient(90deg, #7c3aed, #a78bfa)', borderRadius: '9999px' }}
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
