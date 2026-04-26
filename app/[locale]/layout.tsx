import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { locales } from '@/i18n';
import type { Locale } from '@/i18n';

export function generateStaticParams() {
  return locales.map(locale => ({ locale }));
}

const META: Record<string, { title: string; description: string }> = {
  ko: {
    title: 'echo — 기억은 대화로 살아납니다',
    description: '소중한 카카오톡 대화 기록으로 그리운 사람의 기억을 되살립니다. 그 사람이 아직 거기 있어요.',
  },
  en: {
    title: 'echo — The people you miss are still here',
    description: "Bring back the voice of someone you miss using your shared chat history. They're still here.",
  },
  ja: {
    title: 'echo — 会いたい人はまだそこにいます',
    description: '交わしたトーク履歴でその人の記憶を蘇らせます。その人はまだそこにいます。',
  },
  es: {
    title: 'echo — Las personas que extrañas siguen aquí',
    description: 'Revive los recuerdos de alguien que extrañas usando sus chats compartidos.',
  },
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const m = META[locale] ?? META.ko;
  return {
    title: m.title,
    description: m.description,
    metadataBase: new URL('https://minghaus.vercel.app'),
    alternates: {
      canonical: locale === 'ko' ? '/' : `/${locale}`,
      languages: {
        'ko': '/',
        'en': '/en',
        'ja': '/ja',
        'es': '/es',
      },
    },
    openGraph: {
      title: m.title,
      description: m.description,
      url: locale === 'ko' ? 'https://minghaus.vercel.app' : `https://minghaus.vercel.app/${locale}`,
      siteName: 'echo',
      locale: locale === 'ko' ? 'ko_KR' : locale === 'ja' ? 'ja_JP' : locale === 'es' ? 'es_ES' : 'en_US',
      type: 'website',
      images: [{ url: '/og-image.png', width: 1200, height: 630, alt: m.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: m.title,
      description: m.description,
      images: ['/og-image.png'],
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!locales.includes(locale as Locale)) notFound();
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
