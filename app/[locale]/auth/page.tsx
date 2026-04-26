'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Suspense } from 'react';
import { useTranslations } from 'next-intl';

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
  boxSizing: 'border-box',
};

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get('next') || '/dashboard';
  const t = useTranslations('auth');

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError(t('err_empty')); return; }
    if (password.length < 6) { setError(t('err_short_pw')); return; }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: mode, email, password }),
      });

      const data = await res.json() as { ok?: boolean; error?: string; needsVerification?: boolean };

      if (!res.ok) {
        setError(data.error || t('err_generic'));
        return;
      }

      if (data.needsVerification) {
        setSuccess(t('verify_email'));
        return;
      }

      router.push(nextPath);
    } catch {
      setError(t('err_generic'));
    } finally {
      setLoading(false);
    }
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
      <Link
        href="/"
        style={{
          fontSize: '1.3rem',
          fontWeight: 700,
          color: '#a78bfa',
          letterSpacing: '0.1em',
          textDecoration: 'none',
          marginBottom: '2.5rem',
          display: 'block',
        }}
      >
        echo
      </Link>

      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.35 }}
          style={{
            background: 'rgba(14, 17, 23, 0.75)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(30, 39, 56, 0.8)',
            borderRadius: '20px',
            padding: '2.5rem',
            width: '100%',
            maxWidth: '420px',
          }}
        >
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            {mode === 'signin' ? t('signin') : t('signup')}
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem', lineHeight: 1.6 }}>
            {mode === 'signin'
              ? t('email_placeholder')
              : t('password_placeholder')}
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.82rem', marginBottom: '0.4rem' }}>
                {t('email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={t('email_placeholder')}
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = '#a78bfa'; e.target.style.boxShadow = '0 0 0 3px rgba(167,139,250,0.15)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(30,39,56,0.9)'; e.target.style.boxShadow = 'none'; }}
                autoFocus
              />
            </div>

            <div>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.82rem', marginBottom: '0.4rem' }}>
                {t('password')}
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={t('password_placeholder')}
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = '#a78bfa'; e.target.style.boxShadow = '0 0 0 3px rgba(167,139,250,0.15)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(30,39,56,0.9)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            {error && (
              <p style={{ color: '#f87171', fontSize: '0.85rem', margin: 0 }}>{error}</p>
            )}
            {success && (
              <p style={{ color: '#34d399', fontSize: '0.85rem', margin: 0 }}>{success}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '0.85rem',
                background: loading ? 'rgba(30,39,56,0.6)' : 'linear-gradient(135deg, #7c3aed, #a78bfa)',
                color: loading ? '#475569' : '#fff',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 600,
                fontSize: '1rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 0 16px rgba(167,139,250,0.25)',
                transition: 'all 0.2s',
                marginTop: '0.25rem',
              }}
            >
              {loading ? '...' : mode === 'signin' ? t('submit_signin') : t('submit_signup')}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <button
              onClick={() => { setMode(m => m === 'signin' ? 'signup' : 'signin'); setError(''); setSuccess(''); }}
              style={{
                background: 'none',
                border: 'none',
                color: '#a78bfa',
                fontSize: '0.88rem',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              {mode === 'signin' ? t('switch_to_signup') : t('switch_to_signin')}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </main>
  );
}

export default function AuthPage() {
  return (
    <Suspense>
      <AuthForm />
    </Suspense>
  );
}
