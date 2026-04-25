import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { listPersonas } from '@/lib/store';

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const personas = await listPersonas(user.id);
  return NextResponse.json(personas.map(p => ({
    id: p.id,
    personName: p.personName,
    userInfo: p.userInfo,
    messageCount: p.messageCount,
    coveredCount: p.coveredCount,
    createdAt: p.createdAt,
  })));
}
