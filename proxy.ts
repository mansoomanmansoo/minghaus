import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { locales } from './i18n';
import type { Locale } from './i18n';

const SESSION_COOKIE = 'echo_session';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: 'ko',
  localePrefix: 'as-needed',
});

const isValidJwt = (t: string) => {
  const parts = t.split('.');
  return parts.length === 3 && parts.every(p => p.length > 0);
};

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const localeMatch = pathname.match(/^\/(en|ja|es)(\/|$)/);
  const activeLocale = localeMatch ? localeMatch[1] : 'ko';

  const normalizedPath = localeMatch
    ? '/' + pathname.slice(localeMatch[0].length)
    : pathname;

  const protectedPaths = ['/dashboard', '/upload', '/chat/'];
  const isProtected = protectedPaths.some(p =>
    normalizedPath === p.replace(/\/$/, '') || normalizedPath.startsWith(p)
  );

  if (isProtected) {
    const token = req.cookies.get(SESSION_COOKIE)?.value;
    if (!token || !isValidJwt(token)) {
      const prefix = activeLocale !== 'ko' ? `/${activeLocale}` : '';
      const authUrl = new URL(`${prefix}/auth`, req.url);
      authUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(authUrl);
    }
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
