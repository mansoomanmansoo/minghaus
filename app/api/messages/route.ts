import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import {
  getOrCreateConversation,
  loadMessages,
  saveMessages,
} from '@/lib/store';

// GET /api/messages?personaId=xxx — load conversation history
export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const personaId = req.nextUrl.searchParams.get('personaId');
  if (!personaId) return NextResponse.json({ messages: [] });

  const conversationId = await getOrCreateConversation(personaId, user.id);
  const msgs = await loadMessages(conversationId);
  return NextResponse.json({ conversationId, messages: msgs });
}

// POST /api/messages — save messages
export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { personaId, messages } = await req.json() as {
    personaId: string;
    messages: Array<{ role: 'user' | 'assistant'; content: string; hidden?: boolean }>;
  };

  const conversationId = await getOrCreateConversation(personaId, user.id);
  await saveMessages(conversationId, messages);
  return NextResponse.json({ ok: true, conversationId });
}
