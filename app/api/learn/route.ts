import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getPersona, updateLearnedFacts } from '@/lib/store';
import { getSessionUser } from '@/lib/auth';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ ok: false });

  try {
    const { personaId, messages } = await req.json() as {
      personaId: string;
      messages: ChatMessage[];
    };

    const persona = await getPersona(personaId);
    if (!persona || persona.userId !== user.id) return NextResponse.json({ ok: false });

    const { personName, userInfo } = persona;
    const userName = userInfo.name || '나';

    // AI가 생성한 어시스턴트 메시지는 할루시네이션 가능성이 있으므로
    // 실제 사용자가 말한 내용에서만 사실을 추출
    const userLines = messages
      .filter(m => m.role === 'user')
      .map(m => m.content)
      .join('\n');

    if (!userLines.trim()) return NextResponse.json({ ok: true, learned: [] });

    const res = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content:
            `아래는 ${userName}이 ${personName}에게 한 말들입니다.\n\n` +
            `${userName}이 언급한 실제 사실, 추억, 감정, 관계 정보를 추출하세요.\n` +
            `구체적인 정보만 뽑아주세요 (예: 장소, 사건, 날짜, 감정).\n` +
            `없으면 빈 배열 반환.\n\n` +
            `${userName}의 말:\n${userLines}\n\n` +
            `JSON 배열로만 응답 (설명 없이):\n["사실1", "사실2", ...]`,
        },
      ],
    });

    let learned: string[] = [];
    try {
      const text = res.content[0].type === 'text' ? res.content[0].text.trim() : '[]';
      const match = text.match(/\[[\s\S]*\]/);
      if (match) learned = JSON.parse(match[0]) as string[];
    } catch { /* ignore */ }

    if (learned.length > 0) {
      const combined = [...new Set([...persona.learnedFacts, ...learned])].slice(-50);
      await updateLearnedFacts(personaId, combined);
    }

    return NextResponse.json({ ok: true, learned });
  } catch (err) {
    console.error('learn error:', err);
    return NextResponse.json({ ok: false });
  }
}
