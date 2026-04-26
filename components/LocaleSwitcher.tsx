'use client';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { locales } from '@/i18n';
import type { Locale } from '@/i18n';

const LABELS: Record<string, string> = {
  ko: '한국어',
  en: 'English',
  ja: '日本語',
  es: 'Español',
};

export default function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (next: string) => {
    const segments = pathname.split('/').filter(Boolean);
    const hasLocale = locales.includes(segments[0] as Locale);
    const rest = hasLocale ? segments.slice(1) : segments;
    const newPath = next === 'ko'
      ? '/' + rest.join('/')
      : '/' + [next, ...rest].join('/');
    router.push(newPath || '/');
  };

  return (
    <select
      value={locale}
      onChange={e => switchLocale(e.target.value)}
      style={{
        background: 'transparent',
        color: '#64748b',
        border: '1px solid rgba(30,39,56,0.6)',
        borderRadius: '6px',
        padding: '0.3rem 0.5rem',
        fontSize: '0.8rem',
        cursor: 'pointer',
      }}
    >
      {locales.map(l => (
        <option key={l} value={l} style={{ background: '#0e1117' }}>
          {LABELS[l]}
        </option>
      ))}
    </select>
  );
}
