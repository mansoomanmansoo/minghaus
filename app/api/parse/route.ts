import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { parseChat, detectPlatform } from '@/lib/chat-parser';
import type { Platform, ParsedMessage } from '@/lib/chat-parser';
import { savePersona } from '@/lib/store';
import { embedConversation, saveVectorChunks } from '@/lib/embeddings';
import { getSessionUser } from '@/lib/auth';
import { analyzeStyle, buildPersonaPrompt } from '@/lib/style-analyzer';
import type { UserInfo } from '@/lib/store';

const CHAR_BUDGET = 120_000;
const SKIP_RE =
  /\(이모티콘\)|\[이모티콘\]|\(사진\)|\[사진\]|\(파일\)|\[파일\]|\(동영상\)|\[동영상\]|<media omitted>|\[Photo\]|\[Sticker\]|\[File\]|\[Video\]/i;

function buildRecentContext(
  messages: ParsedMessage[],
  personName: string,
  userDisplayName: string
): { text: string; coveredCount: number } {
  const textMsgs = messages.filter(m => m.content && !SKIP_RE.test(m.content));

  const isTarget = (m: ParsedMessage) =>
    m.sender.trim() === personName.trim() ||
    m.sender.includes(personName) ||
    personName.includes(m.sender.trim());

  let budget = CHAR_BUDGET;
  let coveredCount = 0;
  const selected: ParsedMessage[] = [];

  for (let i = textMsgs.length - 1; i >= 0; i--) {
    const m = textMsgs[i];
    const cost = m.content.length + 15;
    if (budget - cost < 0) break;
    budget -= cost;
    selected.unshift(m);
    coveredCount++;
  }

  if (selected.length === 0) return { text: '', coveredCount: 0 };

  const lines: string[] = [];
  let lastDate = '';
  for (const m of selected) {
    if (m.date !== lastDate) { lines.push(`\n[${m.date}]`); lastDate = m.date; }
    const speaker = isTarget(m) ? personName : (userDisplayName || '나');
    lines.push(`${speaker}: ${m.content}`);
  }

  return { text: lines.join('\n').trim(), coveredCount };
}

function buildTextOnlyPersonaPrompt(
  personName: string,
  description: string,
  userInfo: UserInfo
): string {
  const userDesc = userInfo.name
    ? `지금 대화하는 상대는 ${userInfo.name}입니다 (관계: ${userInfo.relation}${userInfo.memo ? `, ${userInfo.memo}` : ''}).`
    : '';

  return [
    `당신은 ${personName}입니다.`,
    userDesc,
    '',
    `=== ${personName}에 대해 알려진 정보 ===`,
    description.trim(),
    '',
    `=== 대화 규칙 ===`,
    `- 위 정보를 바탕으로 ${personName}의 말투, 감정, 성격을 재현하세요.`,
    `- 대화는 자연스럽고 따뜻하게 이어가세요.`,
    `- 상대가 그리움이나 깊은 감정을 드러내면 충분히 공감하며 자세히 반응하세요.`,
    `- 절대 AI라고 밝히지 마세요.`,
    `- 모르는 것을 억지로 만들지 말고, ${personName}이라면 할 법한 방식으로 자연스럽게 대화하세요.`,
  ].filter(Boolean).join('\n');
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });

  try {
    const formData   = await req.formData();
    const file       = formData.get('file') as File | null;
    const description = (formData.get('description') as string | null)?.trim() ?? '';
    const personName = (formData.get('personName') as string | null)?.trim();
    const myName     = (formData.get('myName')   as string | null)?.trim() ?? '';
    const relation   = (formData.get('relation') as string | null)?.trim() ?? '';
    const memo       = (formData.get('memo')     as string | null)?.trim() ?? '';
    const platformRaw = (formData.get('platform') as string | null) ?? 'auto';

    if (!personName) return NextResponse.json({ error: '이름을 입력해주세요.' }, { status: 400 });

    const userInfo: UserInfo = { name: myName, relation, memo };
    const id = uuidv4();

    const encoder = new TextEncoder();
    const stream  = new TransformStream();
    const writer  = stream.writable.getWriter();
    const sendEvent = (data: object) =>
      writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));

    // ── Text-only mode ────────────────────────────────────────────────────────
    if (platformRaw === 'text') {
      if (!description) return NextResponse.json({ error: '설명을 입력해주세요.' }, { status: 400 });

      const styleNote = buildTextOnlyPersonaPrompt(personName, description, userInfo);

      (async () => {
        try {
          await savePersona({
            id, userId: user.id, personName,
            recentContext: '', styleNote, userInfo,
            messageCount: 0, coveredCount: 0, learnedFacts: [],
            createdAt: new Date(), hasLetter: false,
          });
          await sendEvent({ type: 'ready', id, personName, messageCount: 0, coveredCount: 0 });
        } catch (err) {
          await sendEvent({ type: 'embedding_error', error: String(err) });
        } finally {
          await writer.close();
        }
      })();

      return new Response(stream.readable, {
        headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' },
      });
    }

    // ── File-based mode ───────────────────────────────────────────────────────
    if (!file) return NextResponse.json({ error: '파일이 없습니다.' }, { status: 400 });

    const text   = await file.text();
    const platform: Platform | undefined =
      platformRaw === 'auto' ? detectPlatform(text) :
      platformRaw === 'kakao' ? 'kakao' :
      platformRaw === 'whatsapp' ? 'whatsapp' :
      platformRaw === 'line' ? 'line' : undefined;

    const parsed = parseChat(text, personName, platform);

    const { text: recentContext, coveredCount } = buildRecentContext(
      parsed.messages, personName, myName || '나'
    );

    const styleProfile = analyzeStyle(parsed.targetMessages, parsed.messages, personName);
    const styleNote    = buildPersonaPrompt(personName, styleProfile, { name: myName, relation, memo });

    await savePersona({
      id, userId: user.id, personName,
      recentContext, styleNote, userInfo,
      messageCount: parsed.messages.length, coveredCount,
      learnedFacts: [], createdAt: new Date(), hasLetter: false,
    });

    (async () => {
      try {
        await sendEvent({ type: 'ready', id, personName, messageCount: parsed.messages.length, coveredCount });

        const totalChunks = Math.ceil(parsed.messages.length / 6);
        await sendEvent({ type: 'embedding_start', totalChunks });

        const vectorChunks = await embedConversation(
          parsed.messages,
          personName,
          myName || '나',
          async (done, total) => { await sendEvent({ type: 'embedding_progress', done, total }); }
        );

        await saveVectorChunks(id, vectorChunks);
        await sendEvent({ type: 'embedding_done', chunks: vectorChunks.length });
      } catch (err) {
        await sendEvent({ type: 'embedding_error', error: String(err) });
      } finally {
        await writer.close();
      }
    })();

    return new Response(stream.readable, {
      headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' },
    });
  } catch (err) {
    console.error('parse error:', err);
    return NextResponse.json({ error: '파일 파싱 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
