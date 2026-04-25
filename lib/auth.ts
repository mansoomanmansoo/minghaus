import { cookies } from 'next/headers';
import { db } from './db';

export const SESSION_COOKIE = 'echo_session';

export interface AuthUser {
  id: string;
  email: string;
}

export async function getSessionUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const { data: { user }, error } = await db.auth.getUser(token);
  if (error || !user) return null;

  return { id: user.id, email: user.email! };
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');
  return user;
}
