'use client';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/navigation';
import { locales } from '@/i18n';

const LABELS: Record<string, string> = {
  ko: '한국어',
  en: 'English',
  ja: '日本語',
  es: 'Español',
};

export default function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const switchLocale = (next: string) => {
    router.replace(pathname, { locale: next });
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
