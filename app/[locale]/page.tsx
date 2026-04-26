'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useTranslations, useLocale } from 'next-intl';
import LocaleSwitcher from '@/components/LocaleSwitcher';

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
  const t = useTranslations('landing');
  const locale = useLocale();

  return (
    <main style={{ background: '#07090f', color: '#e2e8f0', minHeight: '100vh' }}>

      {/* ── TOP NAV (locale switcher) ── */}
      <div style={{
        position: 'fixed', top: '1rem', right: '1.25rem',
        zIndex: 100,
      }}>
        <LocaleSwitcher />
      </div>

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
            {t('hero_h1_line1')}
            <br />
            <em style={{ fontStyle: 'italic', color: '#c4b5fd' }}>{t('hero_h1_line2')}</em>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.25 }}
            style={{ fontSize: '1.05rem', lineHeight: 1.8, color: '#94a3b8', marginBottom: '2.5rem', maxWidth: '480px', margin: '0 auto 2.5rem' }}
          >
            {t('hero_sub').split('\n').map((line, i, arr) => (
              <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
            ))}
            <br />
            <span style={{ fontSize: '0.9rem', color: '#7c3aed' }}>{t('hero_sub_note')}</span>
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
              {t('cta_start')}
            </Link>
            <Link href="/dashboard" style={{
              display: 'inline-block', padding: '0.85rem 1.75rem',
              background: 'transparent', color: '#a78bfa',
              borderRadius: '9999px', fontWeight: 600, fontSize: '1rem',
              textDecoration: 'none', border: '1px solid rgba(167,139,250,0.4)',
            }}>
              {t('cta_list')}
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            style={{ marginTop: '1.25rem', fontSize: '0.8rem', color: '#475569' }}
          >
            {t('hero_free')}
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
          <span>{t('scroll')}</span>
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
              {t('story_label')}
            </p>

            <p style={{ fontSize: '1.15rem', lineHeight: 2, color: '#94a3b8', marginBottom: '1.5rem' }}>
              {t('story_p1').split('\n').map((line, i, arr) => (
                <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
              ))}
            </p>

            <p style={{ fontSize: '1.15rem', lineHeight: 2, color: '#94a3b8', marginBottom: '1.5rem' }}>
              {t('story_p2').split('\n').map((line, i, arr) => (
                <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
              ))}
            </p>

            <p style={{ fontSize: '1.15rem', lineHeight: 2, color: '#c4b5fd', marginBottom: '2rem', fontWeight: 500 }}>
              {t('story_p3')}
            </p>

            <p style={{ fontSize: '0.95rem', lineHeight: 1.8, color: '#64748b' }}>
              {t('story_p4').split('\n').map((line, i, arr) => (
                <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
              ))}
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
            {t('how_title')}
          </h2>
          <p style={{ color: '#64748b', fontSize: '1rem' }}>{t('how_sub')}</p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
          {[
            { icon: '📤', titleKey: 'step01_title' as const, descKey: 'step01_desc' as const, step: '01' },
            { icon: '🧠', titleKey: 'step02_title' as const, descKey: 'step02_desc' as const, step: '02' },
            { icon: '💬', titleKey: 'step03_title' as const, descKey: 'step03_desc' as const, step: '03' },
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
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: '#e2e8f0' }}>{t(item.titleKey)}</h3>
              <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.6 }}>{t(item.descKey)}</p>
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
            {t('cases_title')}
          </h2>
          <p style={{ color: '#64748b', fontSize: '1rem' }}>{t('cases_sub')}</p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {[
            { icon: '🕯', titleKey: 'case1_title' as const, descKey: 'case1_desc' as const, color: '#f4a261' },
            { icon: '🌸', titleKey: 'case2_title' as const, descKey: 'case2_desc' as const, color: '#c4b5fd' },
            { icon: '💌', titleKey: 'case3_title' as const, descKey: 'case3_desc' as const, color: '#a78bfa' },
          ].map((item, i) => (
            <motion.div
              key={item.titleKey}
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
                {t(item.titleKey)}
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.7 }}>{t(item.descKey)}</p>
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
              {t('privacy_title')}
            </span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1.25rem 2.5rem' }}>
            {[
              { icon: '🔒', textKey: 'privacy_1' as const },
              { icon: '👁', textKey: 'privacy_2' as const },
              { icon: '🗑', textKey: 'privacy_3' as const },
              { icon: '🚫', textKey: 'privacy_4' as const },
            ].map(item => (
              <div key={item.textKey} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1rem' }}>{item.icon}</span>
                <span style={{ color: '#64748b', fontSize: '0.875rem' }}>{t(item.textKey)}</span>
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
            {t('cta_label')}
          </p>
          <h2 style={{ fontSize: '1.9rem', fontWeight: 700, marginBottom: '0.75rem', color: '#e2e8f0' }}>
            {t('cta_h2')}
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '2rem' }}>
            {t('cta_sub')}
          </p>
          <Link href="/auth" style={{
            display: 'inline-block', padding: '0.85rem 2.4rem',
            background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
            color: '#fff', borderRadius: '9999px', fontWeight: 600,
            fontSize: '1rem', textDecoration: 'none',
            boxShadow: '0 0 24px rgba(167,139,250,0.3)',
          }}>
            {t('cta_start')}
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
            {t('donation_title')}
          </h2>
          <p style={{ fontSize: '0.95rem', lineHeight: 1.9, color: '#64748b', marginBottom: '2rem' }}>
            {t('donation_desc').split('\n').map((line, i, arr) => (
              <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
            ))}
          </p>

          {locale === 'ko' && (
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
                {t('donation_qr_caption')}
              </p>
            </div>
          )}

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
            {t('donation_btn')}
          </a>

          <p style={{ marginTop: '1rem', fontSize: '0.78rem', color: '#334155' }}>
            {t('donation_note')}
          </p>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ padding: '2.5rem 1.5rem', textAlign: 'center', color: '#334155', fontSize: '0.85rem', borderTop: '1px solid rgba(30,39,56,0.4)' }}>
        <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#475569', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
          echo
        </div>
        <p style={{ marginBottom: '0.5rem' }}>{t('footer_tagline')}</p>
        <p style={{ marginBottom: '0.75rem', fontSize: '0.8rem', color: '#1e293b' }}>
          {t('footer_sub')}
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '1rem' }}>
          <Link href="/privacy" style={{ color: '#475569', textDecoration: 'none' }}>{t('footer_privacy')}</Link>
          <Link href="/terms" style={{ color: '#475569', textDecoration: 'none' }}>{t('footer_terms')}</Link>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <LocaleSwitcher />
        </div>
      </footer>
    </main>
  );
}
