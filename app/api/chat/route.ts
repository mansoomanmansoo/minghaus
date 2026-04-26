import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import type { TextBlockParam } from '@anthropic-ai/sdk/resources/messages/messages';
import { getPersona } from '@/lib/store';
import { searchVectorsByPersonaId } from '@/lib/embeddings';
import { getSessionUser } from '@/lib/auth';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const HISTORY_WINDOW = 20;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

type MsgShape = { ai_prompt: Record<string, string> };

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

    const locale = req.headers.get('x-locale') ?? 'ko';
    const msgs = (await import(`@/messages/${locale}.json`)) as { default: MsgShape };
    const pt = (key: string, vars?: Record<string, string | number>) => {
      let str: string = msgs.default.ai_prompt[key] ?? '';
      if (vars) Object.entries(vars).forEach(([k, v]) => { str = str.replaceAll(`{${k}}`, String(v)); });
      return str;
    };

    const { personName, recentContext, styleNote, userInfo } = persona;

    const userCtx = [
      userInfo?.name     ? `지금 대화하는 상대는 ${userInfo.name}입니다.` : '',
      userInfo?.relation ? `관계: ${userInfo.relation}.` : '',
      userInfo?.memo     ? `메모: ${userInfo.memo}.` : '',
    ].filter(Boolean).join(' ');

    const basePrompt = styleNote || pt('base', { personName }) + (userCtx ? ' ' + userCtx : '');

    const contextBlock =
      pt('context_header', { count: persona.coveredCount.toLocaleString() }) + '\n\n' +
      recentContext;

    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
    const relevantOldMemories = lastUserMsg
      ? await searchVectorsByPersonaId(personaId, lastUserMsg.content, 15).catch(() => [])
      : [];

    const learnedBlock = persona.learnedFacts.length > 0
      ? pt('learned_header') + '\n' +
        persona.learnedFacts.map(f => `- ${f}`).join('\n')
      : '';

    const memoryBlock = relevantOldMemories.length > 0
      ? pt('memory_header', { total: persona.messageCount.toLocaleString() }) + '\n\n' +
        relevantOldMemories.map(c => `[${c.date}]\n${c.text}`).join('\n\n')
      : '';

    // styleNote가 있어도 관계/메모는 항상 별도 블록으로 포함 (매 대화 참고)
    const userContextBlock = userCtx
      ? `=== 대화 상대 정보 ===\n${userCtx}\n이 정보를 대화 전반에 걸쳐 자연스럽게 반영하세요.`
      : '';

    const systemBlocks: TextBlockParam[] = [
      { type: 'text', text: basePrompt, cache_control: { type: 'ephemeral' } },
      { type: 'text', text: contextBlock, cache_control: { type: 'ephemeral' } },
      ...(userContextBlock ? [{ type: 'text' as const, text: userContextBlock }] : []),
      ...(learnedBlock     ? [{ type: 'text' as const, text: learnedBlock }]     : []),
      ...(memoryBlock      ? [{ type: 'text' as const, text: memoryBlock  }]     : []),
    ];

    const recentMessages = messages.slice(-HISTORY_WINDOW);

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      stream: true,
      system: systemBlocks,
      messages: recentMessages.map(m => ({ role: m.role, content: m.content })),
    }, {
      headers: { 'anthropic-beta': 'prompt-caching-2024-07-31' },
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
              controller.enqueue(encoder.encode(chunk.delta.text));
            }
          }
          controller.close();
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          console.error('chat stream error:', msg, err);
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
