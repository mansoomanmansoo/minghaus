import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { SESSION_COOKIE, getSessionUser } from '@/lib/auth';

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 24 * 30,
  path: '/',
};

// POST /api/auth  body: { action: 'signup'|'signin'|'signout', email?, password? }
export async function POST(req: NextRequest) {
  const { action, email, password } = await req.json() as {
    action: string;
    email?: string;
    password?: string;
  };

  const cookieStore = await cookies();

  if (action === 'signout') {
    cookieStore.delete(SESSION_COOKIE);
    return NextResponse.json({ ok: true });
  }

  if (!email || !password) {
    return NextResponse.json({ error: '이메일과 비밀번호를 입력해주세요.' }, { status: 400 });
  }

  try {
    if (action === 'signup') {
      const { data, error } = await db.auth.signUp({ email, password });
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });

      const token = data.session?.access_token;
      if (token) cookieStore.set(SESSION_COOKIE, token, COOKIE_OPTS);
      return NextResponse.json({ ok: true, needsVerification: !data.session });
    }

    if (action === 'signin') {
      const { data, error } = await db.auth.signInWithPassword({ email, password });
      if (error) return NextResponse.json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' }, { status: 401 });

      cookieStore.set(SESSION_COOKIE, data.session.access_token, COOKIE_OPTS);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 });
  } catch (err) {
    console.error('auth error:', err);
    return NextResponse.json({ error: '인증 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

// GET /api/auth — current user info
export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ user: null });
  return NextResponse.json({ user });
}
