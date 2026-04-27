import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getPersona, getLetter, saveLetter } from '@/lib/store';
import { getSessionUser } from '@/lib/auth';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) return new Response(JSON.stringify({ error: '로그인이 필요합니다.' }), { status: 401 });

  const { id } = await params;
  const persona = await getPersona(id);
  if (!persona) return new Response(JSON.stringify({ error: '페르소나를 찾을 수 없습니다.' }), { status: 404 });
  if (persona.userId !== user.id) return new Response(JSON.stringify({ error: '접근 권한이 없습니다.' }), { status: 403 });

  // Return cached letter if exists
  const cached = await getLetter(id);
  if (cached) {
    return new Response(JSON.stringify({ letter: cached, cached: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { personName, recentContext, styleNote, userInfo, learnedFacts } = persona;

  const recipient = userInfo?.name || '당신';
  const relationLine = userInfo?.relation ? `관계: ${userInfo.relation}` : '';
  const memoLine = userInfo?.memo ? `참고: ${userInfo.memo}` : '';
  const factsBlock = learnedFacts.length > 0
    ? `=== 내가 기억하는 것들 ===\n${learnedFacts.map(f => `- ${f}`).join('\n')}`
    : '';

  const systemPrompt = `당신은 ${personName}입니다. 지금 ${recipient}에게 오랫동안 마음속에 담아뒀던 말들을 담아 손편지를 씁니다.
${relationLine}
${memoLine}

아래 함께했던 기억과 대화들을 바탕으로 편지를 쓰세요:

=== 우리가 함께했던 기억 ===
${recentContext || '(기억이 많지 않지만 진심을 담아 씁니다)'}

${factsBlock}

=== 편지를 쓸 때 반드시 지킬 것 ===
- ${personName}의 실제 말투 그대로 씁니다${styleNote ? ` (아래 말투 분석 참고)` : ''}
- 구체적인 기억을 최소 2개 언급하세요 — 날짜, 장소, 상황, 대화 내용 등 ${recipient}만 알 것 같은 디테일로
- 살아있을 때 쑥스러워서, 바빠서, 당연하다 생각해서 못 다 했던 진심을 꺼내세요
- 고마움, 미안함, 자랑스러움 중 진심으로 느꼈던 것을 솔직하게 써주세요
- ${recipient}가 지금 잘 지내고 있는지 걱정하고 응원하는 마음을 담으세요
- 읽는 사람이 눈물을 흘릴 만큼 따뜻하고 진심어리게 — 하지만 인위적으로 감동을 쥐어짜지 마세요
- 5~7 단락, 충분히 길게. 하고 싶은 말을 다 하세요
- 편지 형식으로: [인사말로 시작] → [구체적인 추억] → [못 다한 말] → [지금의 ${recipient}에게] → [마무리]
- AI가 쓴 것처럼 절대 느껴지면 안 됩니다. ${personName}이 진짜로 쓴 편지입니다

${styleNote ? `=== ${personName}의 말투 ===\n${styleNote}` : ''}`;

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: `${recipient}에게 쓰는 편지를 써주세요. 형식 없이 편지 본문만 써주세요. 절대 중간에 끊지 말고 마무리 인사까지 완성해주세요.`,
      }],
    });

    const letter = response.content[0].type === 'text' ? response.content[0].text : '';
    await saveLetter(id, letter);
    return new Response(JSON.stringify({ letter, cached: false }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: msg }), { status: 500 });
  }
}
