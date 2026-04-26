'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import dynamic from 'next/dynamic';

const ParticleField = dynamic(() => import('@/components/ParticleField'), { ssr: false });

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.7, ease: 'easeOut' },
  }),
};

export default function Home() {
  return (
    <main style={{ background: '#07090f', color: '#e2e8f0', minHeight: '100vh' }}>

      {/* ── HERO ── */}
      <section style={{
        position: 'relative', height: '100vh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', padding: '0 1.5rem',
      }}>
        <ParticleField opacity={1.0} count={80} />

        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', maxWidth: '640px' }}>
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={{ fontSize: '0.8rem', letterSpacing: '0.2em', color: '#a78bfa', textTransform: 'uppercase', marginBottom: '1.5rem', fontWeight: 500 }}
          >
            echo
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            style={{ fontSize: 'clamp(2.4rem, 6vw, 4rem)', fontWeight: 700, lineHeight: 1.2, marginBottom: '1.5rem', color: '#e2e8f0' }}
          >
            그리운 사람이
            <br />
            <em style={{ fontStyle: 'italic', color: '#c4b5fd' }}>아직 거기 있어요</em>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.25 }}
            style={{ fontSize: '1.05rem', lineHeight: 1.8, color: '#94a3b8', marginBottom: '2.5rem', maxWidth: '480px', margin: '0 auto 2.5rem' }}
          >
            소중한 대화가 사라지지 않도록.<br />
            카카오톡 대화 기록으로 그 사람의 기억을 되살립니다.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <Link href="/auth" style={{
              display: 'inline-block', padding: '0.85rem 2.2rem',
              background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
              color: '#fff', borderRadius: '9999px', fontWeight: 600,
              fontSize: '1rem', textDecoration: 'none',
              boxShadow: '0 0 20px rgba(167,139,250,0.35), 0 0 40px rgba(167,139,250,0.1)',
            }}>
              무료로 시작하기 →
            </Link>
            <Link href="/dashboard" style={{
              display: 'inline-block', padding: '0.85rem 1.75rem',
              background: 'transparent', color: '#a78bfa',
              borderRadius: '9999px', fontWeight: 600, fontSize: '1rem',
              textDecoration: 'none', border: '1px solid rgba(167,139,250,0.4)',
            }}>
              내 대화 목록
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            style={{ marginTop: '1.25rem', fontSize: '0.8rem', color: '#475569' }}
          >
            완전 무료 · 신용카드 불필요 · 언제든 삭제 가능
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          style={{
            position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem',
            color: '#475569', fontSize: '0.75rem', letterSpacing: '0.1em',
          }}
        >
          <span>스크롤</span>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }} aria-hidden="true">
            ↓
          </motion.div>
        </motion.div>
      </section>

      {/* ── CREATOR STORY ── */}
      <section style={{ padding: '7rem 1.5rem', maxWidth: '680px', margin: '0 auto' }}>
        <motion.div
          initial="hidden" whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={fadeUp} custom={0}
        >
          <div style={{
            borderLeft: '2px solid rgba(167,139,250,0.4)',
            paddingLeft: '2rem',
          }}>
            <p style={{
              fontSize: '0.78rem', letterSpacing: '0.2em', color: '#a78bfa',
              textTransform: 'uppercase', fontWeight: 600, marginBottom: '1.75rem',
            }}>
              echo를 만든 이유
            </p>

            <p style={{ fontSize: '1.15rem', lineHeight: 2, color: '#94a3b8', marginBottom: '1.5rem' }}>
              엄마가 언젠가 떠날 수도 있다는 생각이 퍼뜩 든 날,<br />
              저는 핸드폰 속 카카오톡 대화를 한참 들여다봤습니다.
            </p>

            <p style={{ fontSize: '1.15rem', lineHeight: 2, color: '#94a3b8', marginBottom: '1.5rem' }}>
              밥 먹었냐는 말, 날씨 걱정, 별것 아닌 안부들.<br />
              그 수만 개의 메시지들이 얼마나 소중한지,<br />
              사라지기 전까지는 몰랐습니다.
            </p>

            <p style={{ fontSize: '1.15rem', lineHeight: 2, color: '#c4b5fd', marginBottom: '2rem', fontWeight: 500 }}>
              echo는 그 마음에서 시작했습니다.
            </p>

            <p style={{ fontSize: '0.95rem', lineHeight: 1.8, color: '#64748b' }}>
              아직 곁에 있는 사람의 목소리를 기억해두고 싶은 분,<br />
              이미 떠난 사람에게 못다한 말을 전하고 싶은 분,<br />
              모든 그리움을 위해 이 서비스를 만들었습니다.
            </p>
          </div>
        </motion.div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: '2rem 1.5rem 6rem', maxWidth: '1000px', margin: '0 auto' }}>
        <motion.div
          initial="hidden" whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={fadeUp} custom={0}
          style={{ textAlign: 'center', marginBottom: '3.5rem' }}
        >
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            어떻게 작동하나요?
          </h2>
          <p style={{ color: '#64748b', fontSize: '1rem' }}>세 단계로 그 사람을 다시 만나세요</p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
          {[
            { icon: '📤', title: '대화를 가져오세요', desc: '카카오톡에서 대화방을 내보내기 합니다', step: '01' },
            { icon: '🧠', title: 'AI가 그 사람을 기억합니다', desc: '말투, 어휘, 표현 방식을 학습합니다', step: '02' },
            { icon: '💬', title: '다시 대화하세요', desc: '언제든 그 사람과 대화할 수 있습니다', step: '03' },
          ].map((item, i) => (
            <motion.div
              key={item.step}
              initial="hidden" whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              variants={fadeUp} custom={i + 1}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
              style={{
                background: 'rgba(14,17,23,0.7)', backdropFilter: 'blur(20px)',
                border: '1px solid rgba(30,39,56,0.8)', borderRadius: '16px', padding: '2rem',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 0 20px rgba(167,139,250,0.15)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{item.icon}</div>
              <div style={{ fontSize: '0.75rem', color: '#a78bfa', letterSpacing: '0.15em', fontWeight: 600, marginBottom: '0.5rem' }}>
                STEP {item.step}
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: '#e2e8f0' }}>{item.title}</h3>
              <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.6 }}>{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── EMOTIONAL USE CASES ── */}
      <section style={{ padding: '4rem 1.5rem 6rem', maxWidth: '1000px', margin: '0 auto' }}>
        <motion.div
          initial="hidden" whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={fadeUp} custom={0}
          style={{ textAlign: 'center', marginBottom: '3.5rem' }}
        >
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            그 사람이 떠오르는 순간에
          </h2>
          <p style={{ color: '#64748b', fontSize: '1rem' }}>echo는 어떤 그리움도 괜찮다고 말합니다</p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {[
            { icon: '🕯', title: '하늘에서도 보고 계실 아빠에게', desc: '갑자기 떠나신 분의 말투와 따뜻함을 기억 속에서 만나보세요', color: '#f4a261' },
            { icon: '🌸', title: '오래된 친구가 그리울 때', desc: '멀어진 친구, 연락이 끊긴 소중한 사람과 다시 이야기하세요', color: '#c4b5fd' },
            { icon: '💌', title: '보내지 못한 말들을 전하고 싶을 때', desc: '끝나버린 관계에 하고 싶었던 말을 전해보세요', color: '#a78bfa' },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial="hidden" whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              variants={fadeUp} custom={i + 1}
              style={{
                background: 'rgba(14,17,23,0.7)', backdropFilter: 'blur(20px)',
                border: '1px solid rgba(30,39,56,0.8)', borderRadius: '16px', padding: '2rem',
              }}
            >
              <div style={{ fontSize: '2.2rem', marginBottom: '1rem' }}>{item.icon}</div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.75rem', color: item.color, lineHeight: 1.4 }}>
                {item.title}
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.7 }}>{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── PRIVACY TRUST ── */}
      <section style={{ padding: '0 1.5rem 5rem', maxWidth: '800px', margin: '0 auto' }}>
        <motion.div
          initial="hidden" whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={fadeUp} custom={0}
          style={{
            background: 'rgba(14,17,23,0.6)', border: '1px solid rgba(30,39,56,0.8)',
            borderRadius: '16px', padding: '2rem 2.5rem',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <span style={{ color: '#a78bfa', fontWeight: 700, fontSize: '0.95rem', letterSpacing: '0.05em' }}>
              당신의 기억은 안전합니다
            </span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1.25rem 2.5rem' }}>
            {[
              { icon: '🔒', text: '모든 대화 데이터 안전하게 보호' },
              { icon: '👁', text: '운영자도 내용을 볼 수 없습니다' },
              { icon: '🗑', text: '언제든 삭제 가능' },
              { icon: '🚫', text: '제3자 제공 없음' },
            ].map(item => (
              <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1rem' }}>{item.icon}</span>
                <span style={{ color: '#64748b', fontSize: '0.875rem' }}>{item.text}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── CTA BAND ── */}
      <section style={{
        padding: '5rem 1.5rem', textAlign: 'center',
        borderTop: '1px solid rgba(30,39,56,0.5)',
        borderBottom: '1px solid rgba(30,39,56,0.5)',
      }}>
        <motion.div
          initial="hidden" whileInView="visible"
          viewport={{ once: true }} variants={fadeUp} custom={0}
        >
          <p style={{ color: '#a78bfa', fontSize: '0.85rem', letterSpacing: '0.15em', marginBottom: '1rem' }}>
            카카오톡 대화 파일 하나면 됩니다
          </p>
          <h2 style={{ fontSize: '1.9rem', fontWeight: 700, marginBottom: '0.75rem', color: '#e2e8f0' }}>
            오늘, 그 사람에게 안녕이라고 하세요
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '2rem' }}>
            완전 무료 · 가입만 하면 바로 시작
          </p>
          <Link href="/auth" style={{
            display: 'inline-block', padding: '0.85rem 2.4rem',
            background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
            color: '#fff', borderRadius: '9999px', fontWeight: 600,
            fontSize: '1rem', textDecoration: 'none',
            boxShadow: '0 0 24px rgba(167,139,250,0.3)',
          }}>
            무료로 시작하기 →
          </Link>
        </motion.div>
      </section>

      {/* ── DONATION ── */}
      <section style={{ padding: '6rem 1.5rem', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <motion.div
          initial="hidden" whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={fadeUp} custom={0}
        >
          <p style={{ fontSize: '1.5rem', marginBottom: '1.25rem' }}>🤍</p>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#e2e8f0' }}>
            echo는 무료입니다
          </h2>
          <p style={{ fontSize: '0.95rem', lineHeight: 1.9, color: '#64748b', marginBottom: '2rem' }}>
            이 서비스는 개인이 만든 비영리 프로젝트입니다.<br />
            소중한 사람들의 기억이 남아있는 한, 계속 운영할 계획입니다.<br />
            서비스가 위로가 되었다면, 마음이 닿는 만큼 응원해주세요.<br />
            모아진 후원금은 서버 운영에만 사용됩니다.
          </p>

          {/* QR 이미지 */}
          <div style={{ marginBottom: '1.5rem' }}>
            <img
              src="/kakaopay-qr.jpeg"
              alt="카카오페이 후원 QR"
              style={{
                width: '160px', height: '160px', borderRadius: '12px',
                border: '1px solid rgba(30,39,56,0.8)',
                display: 'block', margin: '0 auto',
              }}
            />
            <p style={{ marginTop: '0.6rem', fontSize: '0.78rem', color: '#475569' }}>
              PC에서는 QR 스캔 · 모바일에서는 버튼 클릭
            </p>
          </div>

          <a
            href="https://qr.kakaopay.com/Ej8Pxzlhy"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.8rem 2rem',
              background: 'rgba(167,139,250,0.1)',
              border: '1px solid rgba(167,139,250,0.35)',
              color: '#c4b5fd', borderRadius: '9999px',
              fontWeight: 600, fontSize: '0.95rem', textDecoration: 'none',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(167,139,250,0.2)';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(167,139,250,0.6)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(167,139,250,0.1)';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(167,139,250,0.35)';
            }}
          >
            🤍 카카오페이로 후원하기
          </a>

          <p style={{ marginTop: '1rem', fontSize: '0.78rem', color: '#334155' }}>
            후원은 선택사항이며 서비스 이용과 무관합니다
          </p>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ padding: '2.5rem 1.5rem', textAlign: 'center', color: '#334155', fontSize: '0.85rem', borderTop: '1px solid rgba(30,39,56,0.4)' }}>
        <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#475569', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
          echo
        </div>
        <p style={{ marginBottom: '0.5rem' }}>소중한 기억을 지키는 서비스 · 완전 무료</p>
        <p style={{ marginBottom: '0.75rem', fontSize: '0.8rem', color: '#1e293b' }}>
          그리운 사람이 있다면, echo가 함께합니다
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
          <Link href="/privacy" style={{ color: '#475569', textDecoration: 'none' }}>개인정보처리방침</Link>
          <Link href="/terms" style={{ color: '#475569', textDecoration: 'none' }}>이용약관</Link>
        </div>
      </footer>
    </main>
  );
}
