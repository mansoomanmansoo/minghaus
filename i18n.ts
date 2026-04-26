import { getRequestConfig } from 'next-intl/server';

export const locales = ['ko', 'en', 'ja', 'es'] as const;
export type Locale = typeof locales[number];

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale;
  return {
    locale: locale ?? 'ko',
    messages: (await import(`./messages/${locale ?? 'ko'}.json`)).default,
  };
});
