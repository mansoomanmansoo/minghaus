import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import type { BetaTextBlockParam } from '@anthropic-ai/sdk/resources/beta/messages/messages';
import { getPersona } from '@/lib/store';
import { searchVectorsByPersonaId } from '@/lib/embeddings';
import { getSessionUser } from '@/lib/auth';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const HISTORY_WINDOW = 20;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return new Response(JSON.stringify({ error: '로그인이 필요합니다.' }), { status: 401 });

  try {
    const body = await req.json() as { personaId: string; messages: ChatMessage[] };
    const { personaId, messages } = body;

    if (!personaId) return new Response(JSON.stringify({ error: 'personaId가 없습니다.' }), { status: 400 });

    const persona = await getPersona(personaId);
    if (!persona) return new Response(JSON.stringify({ error: '페르소나를 찾을 수 없습니다.' }), { status: 404 });
    if (persona.userId !== user.id) return new Response(JSON.stringify({ error: '접근 권한이 없습니다.' }), { status: 403 });

    const { personName, recentContext, styleNote } = persona;

    const basePrompt = styleNote ||
      `당신은 ${personName}입니다. 아래 실제 카카오톡 대화 기록을 완전히 숙지하고, 그 말투·기억·관계를 그대로 재현하세요. 절대 AI라고 밝히지 마세요.\n여러 메시지를 보내고 싶을 때는 빈 줄(\\n\\n)로 구분하세요. 예: "오늘 어땠어\\n\\n나도 보고싶었어"`;

    const contextBlock =
      `=== 실제 대화 기록 (최근 ${persona.coveredCount.toLocaleString()}개 메시지) ===\n` +
      `(이 대화를 기억하고 자연스럽게 활용하세요)\n\n` +
      recentContext;

    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
    const relevantOldMemories = lastUserMsg
      ? await searchVectorsByPersonaId(personaId, lastUserMsg.content, 15).catch(() => [])
      : [];

    const learnedBlock = persona.learnedFacts.length > 0
      ? `=== 이 대화에서 새로 알게 된 것들 ===\n` +
        persona.learnedFacts.map(f => `- ${f}`).join('\n')
      : '';

    const memoryBlock = relevantOldMemories.length > 0
      ? `=== 지금 대화와 관련된 과거 기억 ===\n` +
        `(전체 ${persona.messageCount.toLocaleString()}개 대화에서 찾은 관련 기록)\n\n` +
        relevantOldMemories.map(c => `[${c.date}]\n${c.text}`).join('\n\n')
      : '';

    const systemBlocks: BetaTextBlockParam[] = [
      { type: 'text', text: basePrompt, cache_control: { type: 'ephemeral' } },
      { type: 'text', text: contextBlock, cache_control: { type: 'ephemeral' } },
      ...(learnedBlock ? [{ type: 'text' as const, text: learnedBlock }] : []),
      ...(memoryBlock   ? [{ type: 'text' as const, text: memoryBlock  }] : []),
    ];

    const recentMessages = messages.slice(-HISTORY_WINDOW);

    const stream = client.beta.messages.stream({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      betas: ['prompt-caching-2024-07-31'],
      system: systemBlocks,
      messages: recentMessages.map(m => ({ role: m.role, content: m.content })),
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
              controller.enqueue(encoder.encode(chunk.delta.text));
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('chat error:', msg, err);
    return new Response(JSON.stringify({ error: msg }), { status: 500 });
  }
}
