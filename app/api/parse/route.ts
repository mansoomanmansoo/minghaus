import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { parseKakaoExport } from '@/lib/kakao-parser';
import { savePersona } from '@/lib/store';
import { embedConversation, saveVectorChunks } from '@/lib/embeddings';
import { getSessionUser } from '@/lib/auth';
import { analyzeStyle, buildPersonaPrompt } from '@/lib/style-analyzer';
import type { ParsedMessage } from '@/lib/kakao-parser';

const CHAR_BUDGET = 120_000;
const SKIP_RE = /\(이모티콘\)|\[이모티콘\]|\(사진\)|\[사진\]|\(파일\)|\[파일\]|\(동영상\)|\[동영상\]/;

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

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });

  try {
    const formData  = await req.formData();
    const file      = formData.get('file') as File | null;
    const personName = (formData.get('personName') as string | null)?.trim();
    const myName    = (formData.get('myName')   as string | null)?.trim() ?? '';
    const relation  = (formData.get('relation') as string | null)?.trim() ?? '';
    const memo      = (formData.get('memo')     as string | null)?.trim() ?? '';

    if (!file)       return NextResponse.json({ error: '파일이 없습니다.' }, { status: 400 });
    if (!personName) return NextResponse.json({ error: '이름을 입력해주세요.' }, { status: 400 });

    const text   = await file.text();
    const parsed = parseKakaoExport(text, personName);

    const { text: recentContext, coveredCount } = buildRecentContext(
      parsed.messages, personName, myName || '나'
    );

    const styleProfile = analyzeStyle(parsed.targetMessages, parsed.messages, personName);
    const styleNote = buildPersonaPrompt(personName, styleProfile, { name: myName, relation, memo });

    const id = uuidv4();

    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    const sendEvent = (data: object) =>
      writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));

    // 먼저 페르소나 저장 (빈 벡터) → 채팅 바로 시작 가능
    await savePersona({
      id,
      userId: user.id,
      personName,
      recentContext,
      styleNote,
      userInfo: { name: myName, relation, memo },
      messageCount: parsed.messages.length,
      coveredCount,
      learnedFacts: [],
      createdAt: new Date(),
    });

    // 백그라운드 임베딩
    (async () => {
      try {
        await sendEvent({ type: 'ready', id, personName, messageCount: parsed.messages.length, coveredCount });

        const totalChunks = Math.ceil(parsed.messages.length / 6);
        await sendEvent({ type: 'embedding_start', totalChunks });

        const vectorChunks = await embedConversation(
          parsed.messages,
          personName,
          myName || '나',
          async (done, total) => {
            await sendEvent({ type: 'embedding_progress', done, total });
          }
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
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (err) {
    console.error('parse error:', err);
    return NextResponse.json({ error: '파일 파싱 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
