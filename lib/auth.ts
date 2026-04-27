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

export async function getSessionUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  // Try access token first
  const { data: { user }, error } = await db.auth.getUser(token);
  if (!error && user) return { id: user.id, email: user.email! };

  // Access token expired — try to refresh
  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;
  if (!refreshToken) return null;

  const { data, error: refreshError } = await db.auth.refreshSession({ refresh_token: refreshToken });
  if (refreshError || !data.session || !data.user) return null;

  // Update cookies with new tokens
  cookieStore.set(SESSION_COOKIE, data.session.access_token, COOKIE_OPTS);
  cookieStore.set(REFRESH_COOKIE, data.session.refresh_token, COOKIE_OPTS);

  return { id: data.user.id, email: data.user.email! };
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');
  return user;
}
