import { NextRequest, NextResponse } from 'next/server';

const SESSION_COOKIE = 'echo_session';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(SESSION_COOKIE)?.value;

  const isValidJwt = (t: string) => {
    const parts = t.split('.');
    return parts.length === 3 && parts.every(p => p.length > 0);
  };

  if (!token || !isValidJwt(token)) {
    const authUrl = new URL('/auth', req.url);
    authUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(authUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard', '/upload', '/chat/:path*'],
};
