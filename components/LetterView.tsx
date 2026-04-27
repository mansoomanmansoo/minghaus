'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toPng } from 'html-to-image';

interface Props {
  personaId: string;
  personName: string;
  onClose: () => void;
}

type Phase = 'loading' | 'envelope' | 'opening' | 'reading';

export default function LetterView({ personaId, personName, onClose }: Props) {
  const [phase, setPhase] = useState<Phase>('loading');
  const [letter, setLetter] = useState('');
  const [isCached, setIsCached] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const letterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/persona/${personaId}/letter`, { method: 'POST' })
      .then(r => r.json())
      .then((d: { letter?: string; cached?: boolean; error?: string }) => {
        if (d.error) { setError(d.error); }
        else {
          setLetter(d.letter ?? '');
          setIsCached(d.cached ?? false);
        }
        setPhase('envelope');
      })
      .catch(() => { setError('편지를 불러오지 못했어요.'); setPhase('envelope'); });
  }, [personaId]);

  const openEnvelope = () => {
    if (!letter) return;
    setPhase('opening');
    setTimeout(() => setPhase('reading'), 900);
  };

  const handleSave = async () => {
    if (!letterRef.current) return;
    setSaving(true);
    try {
      const dataUrl = await toPng(letterRef.current, { pixelRatio: 3, cacheBust: true });
      if (navigator.share && navigator.canShare?.({ files: [] })) {
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], `${personName}의-편지.png`, { type: 'image/png' });
        await navigator.share({ files: [file], title: `${personName}에게서 온 편지` });
      } else {
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `${personName}의-편지.png`;
        a.click();
      }
    } finally {
      setSaving(false);
    }
  };

  const paragraphs = letter.split('\n').filter(l => l.trim());

  // ── overlay shell ──────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        background: 'rgba(4,5,10,0.93)',
        backdropFilter: 'blur(8px)',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {/* ── centred wrapper for loading / envelope / opening ── */}
      {phase !== 'reading' && (
        <div style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '2rem 1rem',
        }}
          onClick={onClose}
        >
          {/* loading */}
          {phase === 'loading' && (
            <div style={{ textAlign: 'center' }} onClick={e => e.stopPropagation()}>
              <motion.div
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ repeat: Infinity, duration: 2 }}
                style={{ fontSize: '3rem', marginBottom: '1rem' }}
              >
                ✉️
              </motion.div>
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                {personName}이(가) 편지를 쓰고 있어요…
              </p>
            </div>
          )}

          {/* envelope */}
          {phase === 'envelope' && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              onClick={e => e.stopPropagation()}
              style={{ textAlign: 'center', maxWidth: '360px', width: '100%' }}
            >
              {error ? (
                <p style={{ color: '#f87171', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</p>
              ) : (
                <>
                  {/* envelope graphic */}
                  <div style={{ position: 'relative', width: '180px', height: '130px', margin: '0 auto 2rem' }}>
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'linear-gradient(160deg, #fdf6e3, #f5e6c8)',
                      borderRadius: '4px 4px 8px 8px',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                    }} />
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '65px', overflow: 'hidden' }}>
                      <div style={{ width: 0, height: 0, borderLeft: '90px solid transparent', borderRight: '90px solid transparent', borderTop: '65px solid #e8d5a3' }} />
                    </div>
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '65px', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', bottom: 0, left: 0, width: 0, height: 0, borderBottom: '65px solid #e8d5a3', borderRight: '90px solid transparent' }} />
                      <div style={{ position: 'absolute', bottom: 0, right: 0, width: 0, height: 0, borderBottom: '65px solid #e0c98a', borderLeft: '90px solid transparent' }} />
                    </div>
                    <div style={{
                      position: 'absolute', top: '50%', left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '32px', height: '32px', borderRadius: '50%',
                      background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.75rem', fontWeight: 700, color: '#fff',
                      boxShadow: '0 0 12px rgba(167,139,250,0.5)',
                    }}>
                      e
                    </div>
                  </div>

                  <p style={{ color: '#c4b5fd', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 500 }}>
                    {personName}에게서 편지가 왔어요
                  </p>
                  <p style={{ color: '#475569', fontSize: '0.78rem', marginBottom: '1.75rem' }}>
                    {isCached ? '받았던 편지를 다시 읽어보세요' : '봉투를 열어보세요'}
                  </p>

                  <motion.button
                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                    onClick={openEnvelope}
                    style={{
                      padding: '0.85rem 2rem',
                      background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
                      color: '#fff', border: 'none', borderRadius: '12px',
                      fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer',
                      boxShadow: '0 0 20px rgba(167,139,250,0.3)',
                    }}
                  >
                    ✉️ 편지 열기
                  </motion.button>
                </>
              )}
              <button
                onClick={onClose}
                style={{
                  display: 'block', margin: '1.25rem auto 0',
                  background: 'none', border: 'none',
                  color: '#334155', fontSize: '0.82rem', cursor: 'pointer',
                }}
              >
                닫기
              </button>
            </motion.div>
          )}

          {/* opening flash */}
          {phase === 'opening' && (
            <motion.div
              initial={{ scale: 1 }}
              animate={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.5 }}
              style={{ fontSize: '3rem' }}
            >
              ✉️
            </motion.div>
          )}
        </div>
      )}

      {/* ── reading: scrollable, padded ── */}
      {phase === 'reading' && (
        <div style={{
          maxWidth: '680px', margin: '0 auto',
          padding: 'clamp(1.5rem, 5vw, 3rem) 1rem',
          display: 'flex', flexDirection: 'column', gap: '1rem',
        }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            {/* paper */}
            <div
              ref={letterRef}
              style={{
                background: 'linear-gradient(160deg, #fefcf5 0%, #fdf6e3 60%, #fef9ec 100%)',
                borderRadius: '4px',
                padding: 'clamp(1.75rem, 6vw, 3rem)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(232,213,163,0.25)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* ruled lines */}
              <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, rgba(180,160,100,0.1) 31px, rgba(180,160,100,0.1) 32px)',
                backgroundPositionY: '56px',
              }} />
              {/* left margin */}
              <div style={{
                position: 'absolute', top: 0, bottom: 0,
                left: 'clamp(2.25rem, 7vw, 3.5rem)',
                borderLeft: '1px solid rgba(220,40,40,0.1)',
                pointerEvents: 'none',
              }} />

              <div style={{ position: 'relative' }}>
                <p style={{
                  fontSize: '0.76rem', color: '#b8a070',
                  marginBottom: '2rem', letterSpacing: '0.06em',
                }}>
                  {personName} 씀
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {paragraphs.map((para, i) => (
                    <motion.p
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.15 + i * 0.1, duration: 0.6 }}
                      style={{
                        fontFamily: '"Apple SD Gothic Neo", "Malgun Gothic", Georgia, serif',
                        fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                        lineHeight: 2.0,
                        color: '#261808',
                        margin: 0,
                        wordBreak: 'keep-all',
                      }}
                    >
                      {para}
                    </motion.p>
                  ))}
                </div>

                <div style={{
                  marginTop: '2.5rem', paddingTop: '1rem',
                  borderTop: '1px solid rgba(180,160,100,0.18)',
                  display: 'flex', justifyContent: 'flex-end',
                }}>
                  <span style={{ fontSize: '0.65rem', color: '#c8b080', letterSpacing: '0.1em' }}>echo</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* action buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', paddingBottom: '2rem' }}>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleSave}
              disabled={saving}
              style={{
                flex: 1, padding: '0.9rem',
                background: saving ? 'rgba(30,39,56,0.6)' : 'linear-gradient(135deg, #7c3aed, #a78bfa)',
                color: saving ? '#475569' : '#fff',
                border: 'none', borderRadius: '12px',
                fontWeight: 600, fontSize: '0.9rem',
                cursor: saving ? 'not-allowed' : 'pointer',
                boxShadow: saving ? 'none' : '0 0 16px rgba(167,139,250,0.25)',
              }}
            >
              {saving ? '저장 중…' : '📷 이미지로 저장'}
            </motion.button>
            <button
              onClick={onClose}
              style={{
                padding: '0.9rem 1.25rem',
                background: 'rgba(30,39,56,0.4)',
                color: '#64748b',
                border: '1px solid rgba(30,39,56,0.6)',
                borderRadius: '12px', cursor: 'pointer', fontSize: '0.9rem',
              }}
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
