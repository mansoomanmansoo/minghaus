import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://minghaus.vercel.app';
  const locales = ['ko', 'en', 'ja', 'es'];
  const paths = ['', '/blog', '/privacy', '/terms'];

  const entries: MetadataRoute.Sitemap = [];

  for (const path of paths) {
    for (const locale of locales) {
      const url = locale === 'ko'
        ? `${base}${path || '/'}`
        : `${base}/${locale}${path || ''}`;
      entries.push({
        url,
        lastModified: new Date(),
        changeFrequency: path === '' ? 'weekly' : path === '/blog' ? 'monthly' : 'monthly',
        priority: path === '' ? 1.0 : path === '/blog' ? 0.8 : 0.6,
      });
    }
  }

  return entries;
}
