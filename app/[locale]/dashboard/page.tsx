'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';

interface PersonaCard {
  id: string;
  personName: string;
  userInfo: { name: string; relation: string; memo: string };
  messageCount: number;
  coveredCount: number;
  createdAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const t = useTranslations('dashboard');
  const locale = useLocale();
  const [personas, setPersonas] = useState<PersonaCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const [authRes, personasRes] = await Promise.all([
        fetch('/api/auth'),
        fetch('/api/personas'),
      ]);

      if (!authRes.ok) { router.push('/auth'); return; }
      const { user } = await authRes.json() as { user: { email: string } | null };
      if (!user) { router.push('/auth'); return; }
      setUserEmail(user.email);

      if (personasRes.ok) {
        const data = await personasRes.json() as PersonaCard[];
        setPersonas(data);
      }
      setLoading(false);
    };
    load();
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'signout' }) });
    router.push('/auth');
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(t('delete_confirm', { name }))) return;
    setDeletingId(id);
    await fetch(`/api/personas/${id}`, { method: 'DELETE' });
    setPersonas(prev => prev.filter(p => p.id !== id));
    setDeletingId(null);
  };

  const relationEmoji: Record<string, string> = {
    '연인': '💌', '친구': '🌸', '가족': '🕯', '직장동료': '💼', '기타': '💭',
    'romantic': '💌', 'friend': '🌸', 'family': '🕯', 'colleague': '💼', 'other': '💭',
  };

  const relationLabel = (rel: string) => {
    const map: Record<string, string> = {
      '연인': t('relation_romantic'), '친구': t('relation_friend'), '가족': t('relation_family'),
      '직장동료': t('relation_colleague'), '기타': t('relation_other'),
    };
    return map[rel] ?? rel;
  };

  return (
    <div style={{ background: '#07090f', minHeight: '100vh', color: '#e2e8f0' }}>
      {/* Header */}
      <header
        style={{
          borderBottom: '1px solid rgba(30,39,56,0.8)',
          padding: '1rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(14,17,23,0.8)',
          backdropFilter: 'blur(10px)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <Link href="/" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#a78bfa', textDecoration: 'none', letterSpacing: '0.1em' }}>
          echo
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: '#475569', fontSize: '0.85rem' }}>{userEmail}</span>
          <button
            onClick={handleLogout}
            style={{
              padding: '0.4rem 0.9rem',
              background: 'transparent',
              border: '1px solid rgba(30,39,56,0.9)',
              borderRadius: '8px',
              color: '#64748b',
              fontSize: '0.82rem',
              cursor: 'pointer',
            }}
          >
            {t('logout')}
          </button>
        </div>
      </header>

      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        {/* Title row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              {t('title')}
            </h1>
            <p style={{ color: '#475569', fontSize: '0.9rem' }}>
              {t('subtitle')}
            </p>
          </div>
          <Link
            href="/upload"
            style={{
              padding: '0.7rem 1.4rem',
              background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
              color: '#fff',
              borderRadius: '10px',
              fontWeight: 600,
              fontSize: '0.9rem',
              textDecoration: 'none',
              boxShadow: '0 0 16px rgba(167,139,250,0.25)',
              whiteSpace: 'nowrap',
            }}
          >
            {t('add_btn')}
          </Link>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#475569' }}>
            <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5 }}>
              {t('loading')}
            </motion.div>
          </div>
        ) : personas.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              textAlign: 'center',
              padding: '5rem 2rem',
              background: 'rgba(14,17,23,0.5)',
              border: '1px dashed rgba(30,39,56,0.9)',
              borderRadius: '20px',
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1.25rem' }}>💭</div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.75rem', color: '#94a3b8' }}>
              {t('empty_title')}
            </h2>
            <p style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.7 }}>
              {t('empty_desc').split('\n').map((line, i, arr) => (
                <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
              ))}
            </p>
            <Link
              href="/upload"
              style={{
                display: 'inline-block',
                padding: '0.75rem 1.75rem',
                background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
                color: '#fff',
                borderRadius: '10px',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              {t('empty_cta')}
            </Link>
          </motion.div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <AnimatePresence>
              {personas.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: i * 0.06 }}
                  style={{
                    background: 'rgba(14,17,23,0.75)',
                    border: '1px solid rgba(30,39,56,0.8)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {/* Subtle glow */}
                  <div style={{
                    position: 'absolute', top: 0, right: 0,
                    width: '80px', height: '80px',
                    background: 'radial-gradient(circle, rgba(167,139,250,0.08), transparent)',
                    pointerEvents: 'none',
                  }} />

                  {/* Avatar + name */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1rem' }}>
                    <div style={{
                      width: '48px', height: '48px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(167,139,250,0.2))',
                      border: '2px solid rgba(167,139,250,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.3rem', fontWeight: 700, color: '#c4b5fd', flexShrink: 0,
                    }}>
                      {p.personName.charAt(0)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.15rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.personName}
                      </p>
                      <p style={{ color: '#64748b', fontSize: '0.78rem' }}>
                        {relationEmoji[p.userInfo.relation] ?? '💭'} {relationLabel(p.userInfo.relation)}
                        {p.userInfo.name ? ` · ${t('me_label', { name: p.userInfo.name })}` : ''}
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem' }}>
                    <div>
                      <p style={{ fontSize: '0.75rem', color: '#475569', marginBottom: '0.1rem' }}>{t('card_total')}</p>
                      <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#94a3b8' }}>
                        {p.messageCount.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.75rem', color: '#475569', marginBottom: '0.1rem' }}>{t('card_date')}</p>
                      <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#94a3b8' }}>
                        {new Date(p.createdAt).toLocaleDateString(locale)}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.6rem' }}>
                    <Link
                      href={`/chat/${p.id}`}
                      style={{
                        flex: 1,
                        padding: '0.6rem',
                        background: 'linear-gradient(135deg, rgba(124,58,237,0.5), rgba(167,139,250,0.3))',
                        border: '1px solid rgba(167,139,250,0.3)',
                        borderRadius: '8px',
                        color: '#e2e8f0',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        textDecoration: 'none',
                        textAlign: 'center',
                        transition: 'all 0.2s',
                      }}
                    >
                      {t('card_chat')}
                    </Link>
                    <button
                      onClick={() => handleDelete(p.id, p.personName)}
                      disabled={deletingId === p.id}
                      style={{
                        padding: '0.6rem 0.75rem',
                        background: 'transparent',
                        border: '1px solid rgba(30,39,56,0.9)',
                        borderRadius: '8px',
                        color: '#475569',
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      {deletingId === p.id ? '...' : t('card_delete')}
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}
