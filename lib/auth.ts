import { cookies } from 'next/headers';
import { db } from './db';

export const SESSION_COOKIE = 'echo_session';
export const REFRESH_COOKIE = 'echo_refresh';

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 24 * 30,
  path: '/',
};

export interface AuthUser {
  id: string;
  email: string;
}

interface JwtPayload {
  sub: string;
  email: string;
  exp: number;
}

function decodeJwt(token: string): JwtPayload | null {
  try {
    const [, payload] = token.split('.');
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
    if (!decoded.sub || !decoded.exp) return null;
    return decoded as JwtPayload;
  } catch {
    return null;
  }
}

export async function getSessionUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  // Decode JWT locally — no network call needed for valid tokens
  const payload = decodeJwt(token);
  if (!payload) return null;

  const nowSec = Math.floor(Date.now() / 1000);

  // Token still valid (60s buffer)
  if (payload.exp > nowSec + 60) {
    return { id: payload.sub, email: payload.email };
  }

  // Token expired — try refresh
  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;
  if (!refreshToken) return null;

  try {
    const { data, error } = await db.auth.refreshSession({ refresh_token: refreshToken });
    if (error || !data.session || !data.user) return null;

    cookieStore.set(SESSION_COOKIE, data.session.access_token, COOKIE_OPTS);
    cookieStore.set(REFRESH_COOKIE, data.session.refresh_token, COOKIE_OPTS);

    return { id: data.user.id, email: data.user.email! };
  } catch {
    return null;
  }
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');
  return user;
}
