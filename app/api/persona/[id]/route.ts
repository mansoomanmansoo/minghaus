import { NextRequest, NextResponse } from 'next/server';
import { getPersona } from '@/lib/store';
import { getSessionUser } from '@/lib/auth';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });

  const { id } = await params;
  const persona = await getPersona(id);

  if (!persona) return NextResponse.json({ error: '페르소나를 찾을 수 없습니다.' }, { status: 404 });
  if (persona.userId !== user.id) return NextResponse.json({ error: '접근 권한이 없습니다.' }, { status: 403 });

  return NextResponse.json({
    id: persona.id,
    personName: persona.personName,
    messageCount: persona.messageCount,
    coveredCount: persona.coveredCount,
    userInfo: persona.userInfo,
    createdAt: persona.createdAt,
  });
}
