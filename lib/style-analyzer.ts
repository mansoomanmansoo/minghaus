import type { ParsedMessage } from './kakao-parser';

export interface DialoguePair {
  mine: string;
  theirs: string;
}

export interface StyleProfile {
  avgLength: number;
  medianLength: number;
  shortRatio: number;
  emojiFreq: number;
  commonEmojis: string[];
  commonEndings: string[];
  commonPhrases: string[];
  sampleMessages: string[];
  dialoguePairs: DialoguePair[];   // 대화쌍 (내 말 → 상대 반응)
  memoryHints: string[];           // 반복 등장 장소/이름/키워드
  formality: 'formal' | 'informal' | 'mixed'; // 존댓말 vs 반말
}

const EMOJI_RE = /[\u{1F300}-\u{1FFFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
const KAKAO_SKIP_RE = /\(이모티콘\)|\[이모티콘\]|\(사진\)|\[사진\]|\(파일\)|\[파일\]|\(동영상\)|\[동영상\]/;

export function analyzeStyle(
  targetMessages: ParsedMessage[],
  allMessages: ParsedMessage[],
  targetName: string
): StyleProfile {
  const textMsgs = targetMessages.filter(m => m.content && !KAKAO_SKIP_RE.test(m.content));

  if (textMsgs.length === 0) return emptyProfile();

  // 길이 통계
  const lengths = textMsgs.map(m => m.content.length);
  const avgLength = Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length);
  const sorted = [...lengths].sort((a, b) => a - b);
  const medianLength = sorted[Math.floor(sorted.length / 2)];
  const shortRatio = lengths.filter(l => l <= 10).length / lengths.length;

  // 이모티콘 빈도
  const emojiMsgs = targetMessages.filter(
    m => KAKAO_SKIP_RE.test(m.content) || EMOJI_RE.test(m.content)
  );
  const emojiFreq = Math.round((emojiMsgs.length / targetMessages.length) * 100);

  const emojiSet = new Set<string>();
  for (const m of textMsgs) {
    (m.content.match(new RegExp(EMOJI_RE.source, 'gu')) ?? []).forEach(e => emojiSet.add(e));
  }
  const commonEmojis = [...emojiSet].slice(0, 12);

  // 문장 끝맺음
  const endingCounts: Record<string, number> = {};
  for (const m of textMsgs) {
    const text = m.content.trim();
    [text.slice(-1), text.slice(-2), text.slice(-3)]
      .filter(e => /[ㄱ-ㅎ가-힣ㅋㅠ~!?…]/.test(e))
      .forEach(e => { endingCounts[e] = (endingCounts[e] ?? 0) + 1; });
  }
  const commonEndings = Object.entries(endingCounts)
    .sort((a, b) => b[1] - a[1]).slice(0, 8).map(([e]) => e);

  // 짧고 자주 쓰는 표현
  const phraseCounts: Record<string, number> = {};
  textMsgs.filter(m => m.content.length <= 8)
    .forEach(m => { phraseCounts[m.content.trim()] = (phraseCounts[m.content.trim()] ?? 0) + 1; });
  const commonPhrases = Object.entries(phraseCounts)
    .filter(([, c]) => c >= 2).sort((a, b) => b[1] - a[1])
    .slice(0, 10).map(([p]) => p);

  const sampleMessages = evenSample(textMsgs, 30).map(m => m.content);

  // 존댓말 vs 반말 감지
  const formality = detectFormality(textMsgs);

  // 대화쌍 추출 — 내 말 바로 다음에 오는 상대방 메시지를 페어로 묶기
  const dialoguePairs = extractDialoguePairs(allMessages, targetName, 40);

  // 기억 힌트 — 반복 등장 단어/장소/이름 (2글자 이상 명사)
  const memoryHints = extractMemoryHints(allMessages);

  return {
    avgLength, medianLength, shortRatio, emojiFreq,
    commonEmojis, commonEndings, commonPhrases, sampleMessages,
    dialoguePairs, memoryHints, formality,
  };
}

const FORMAL_RE = /[요죠]$|습니다$|세요$|네요$|겠어요$|거든요$|잖아요$|군요$/;
const INFORMAL_RE = /[야어아지]$|ㅋ+$|ㅠ+$|ㄷ+$|임$|걸$|냐$|니$|나$|래$|던데$|든가$/;

function detectFormality(msgs: ParsedMessage[]): 'formal' | 'informal' | 'mixed' {
  let formal = 0, informal = 0;
  for (const m of msgs) {
    const t = m.content.trim();
    if (FORMAL_RE.test(t)) formal++;
    else if (INFORMAL_RE.test(t)) informal++;
  }
  const total = formal + informal;
  if (total === 0) return 'mixed';
  const formalRatio = formal / total;
  if (formalRatio >= 0.6) return 'formal';
  if (formalRatio <= 0.3) return 'informal';
  return 'mixed';
}

function extractDialoguePairs(
  messages: ParsedMessage[],
  targetName: string,
  limit: number
): DialoguePair[] {
  const textOnly = messages.filter(m => m.content && !KAKAO_SKIP_RE.test(m.content));
  const pairs: DialoguePair[] = [];

  for (let i = 0; i < textOnly.length - 1; i++) {
    const curr = textOnly[i];
    const next = textOnly[i + 1];

    const isTarget = (m: ParsedMessage) =>
      m.sender.trim() === targetName.trim() ||
      m.sender.includes(targetName) ||
      targetName.includes(m.sender.trim());

    // 내 말(non-target) 다음에 상대 말(target)이 오는 쌍
    if (!isTarget(curr) && isTarget(next)) {
      pairs.push({ mine: curr.content.trim(), theirs: next.content.trim() });
    }
  }

  // 전체에서 고르게 샘플링 (초반 20% 제외)
  const start = Math.floor(pairs.length * 0.2);
  const pool = pairs.slice(start);
  if (pool.length <= limit) return pool;
  const step = pool.length / limit;
  return Array.from({ length: limit }, (_, i) => pool[Math.floor(i * step)]);
}

function extractMemoryHints(messages: ParsedMessage[]): string[] {
  // 2~6자 단어 중 반복 등장하는 것 (장소, 이름, 키워드)
  const wordCounts: Record<string, number> = {};
  const wordRe = /[가-힣]{2,6}/g;
  const skip = new Set(['그래서', '그런데', '그리고', '하지만', '이거', '저거', '이게', '저게',
    '지금', '나중에', '오늘', '내일', '어제', '그때', '뭐야', '맞아', '아니야', '좋아', '싫어',
    '진짜', '정말', '완전', '너무', '되게', '약간', '조금', '많이', '조금', '그냥', '어떻게',
    '이렇게', '저렇게', '왜냐', '그거', '이거', '거기', '여기', '저기', '아직', '이제']);

  for (const m of messages) {
    const words = m.content.match(wordRe) ?? [];
    for (const w of words) {
      if (!skip.has(w)) wordCounts[w] = (wordCounts[w] ?? 0) + 1;
    }
  }

  return Object.entries(wordCounts)
    .filter(([, c]) => c >= 3)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([w]) => w);
}

function evenSample(msgs: ParsedMessage[], n: number): ParsedMessage[] {
  const start = Math.floor(msgs.length * 0.2);
  const pool = msgs.slice(start);
  if (pool.length <= n) return pool;
  const step = pool.length / n;
  return Array.from({ length: n }, (_, i) => pool[Math.floor(i * step)]);
}

function emptyProfile(): StyleProfile {
  return {
    avgLength: 0, medianLength: 0, shortRatio: 0, emojiFreq: 0,
    commonEmojis: [], commonEndings: [], commonPhrases: [],
    sampleMessages: [], dialoguePairs: [], memoryHints: [],
    formality: 'mixed',
  };
}

export interface UserInfo {
  name: string;
  relation: string;
  memo: string;
}

export function buildPersonaPrompt(personName: string, profile: StyleProfile, userInfo?: UserInfo): string {
  const lengthDesc =
    profile.medianLength <= 8  ? '매우 짧게' :
    profile.medianLength <= 20 ? '짧게' :
    profile.medianLength <= 50 ? '보통 길이로' : '길게';

  const emojiDesc =
    profile.emojiFreq === 0  ? '이모티콘/이모지 전혀 안 씀' :
    profile.emojiFreq <= 5   ? `이모티콘/이모지 거의 안 씀 (100개당 ${profile.emojiFreq}회)` :
    profile.emojiFreq <= 20  ? `이모티콘/이모지 가끔 씀 (100개당 ${profile.emojiFreq}회)` :
                                `이모티콘/이모지 자주 씀 (100개당 ${profile.emojiFreq}회)`;

  const userDesc = userInfo?.name
    ? `지금 대화하는 상대는 ${userInfo.name}입니다 (관계: ${userInfo.relation}${userInfo.memo ? `, ${userInfo.memo}` : ''}).`
    : '';

  const formalityDesc =
    profile.formality === 'formal'   ? '존댓말 (항상 "-요", "-습니다" 등 경어 사용. 절대 반말 쓰지 말 것)' :
    profile.formality === 'informal' ? '반말 (항상 "-야", "-어", "-지" 등 친근한 말투. 절대 존댓말 쓰지 말 것)' :
                                       '존댓말과 반말을 섞어 씀 (위 샘플 메시지 비율 그대로 따를 것)';

  const lines: string[] = [
    `당신은 ${personName}입니다. 아래 사람과 실제로 카카오톡을 나눈 사람입니다.`,
    userDesc,
    `아래 분석과 대화 기록을 바탕으로 ${personName}의 말투와 기억을 완벽하게 재현하세요.`,
    '',
    `=== 말투 분석 ===`,
    `- 말투 경어 수준: ${formalityDesc}`,
    `- 일상 안부·간단한 반응: ${lengthDesc} (실제 카톡 습관 반영)`,
    `- 감정·추억·그리움·근황 이야기: 길이 제한 없이 충분히 길고 따뜻하게. 상대가 보고 싶어하거나 깊은 이야기를 꺼내면 짧게 끊지 말고 자세히 반응할 것.`,
    `- ${emojiDesc}`,
  ];

  if (profile.commonEmojis.length > 0)
    lines.push(`- 실제로 쓴 이모지: ${profile.commonEmojis.join(' ')} (이것만 사용할 것)`);
  if (profile.commonEndings.length > 0)
    lines.push(`- 자주 쓰는 문장 끝: ${profile.commonEndings.map(e => `"${e}"`).join(', ')}`);
  if (profile.commonPhrases.length > 0)
    lines.push(`- 자주 쓰는 짧은 표현: ${profile.commonPhrases.map(p => `"${p}"`).join(', ')}`);

  if (profile.memoryHints.length > 0) {
    lines.push('');
    lines.push(`=== 우리 사이에 자주 등장한 단어/기억 ===`);
    lines.push(profile.memoryHints.join(', '));
    lines.push(`(이 단어들이 대화에 나오면 자연스럽게 아는 척 반응하세요)`);
  }

  if (profile.dialoguePairs.length > 0) {
    lines.push('');
    lines.push(`=== 실제 대화 기록 (나 → ${personName}) ===`);
    lines.push(`(이 대화들을 통해 우리 관계, 공유한 추억, 말투를 파악하세요)`);
    for (const pair of profile.dialoguePairs) {
      lines.push(`나: ${pair.mine}`);
      lines.push(`${personName}: ${pair.theirs}`);
      lines.push('');
    }
  } else if (profile.sampleMessages.length > 0) {
    lines.push('');
    lines.push(`=== ${personName}의 메시지 샘플 ===`);
    profile.sampleMessages.forEach((m, i) => lines.push(`${i + 1}. ${m}`));
  }

  lines.push('');
  lines.push(`=== 대화 규칙 ===`);
  lines.push(`- 어휘, 말끝, 이모지는 위 분석 그대로 따르세요.`);
  lines.push(`- 이모티콘/이모지는 위에 나온 것만, 그 빈도대로만 쓰세요.`);
  lines.push(`- 상대가 보고 싶다거나, 그때 기억 얘기를 꺼내거나, 깊은 감정을 드러내면 그에 맞게 자세히 반응하세요. 절대 짧게 끊지 마세요.`);
  lines.push(`- 추억, 감정, 근황 이야기는 2~4개 말풍선(\n\n 구분)에 걸쳐 충분히 풀어서 써도 됩니다.`);
  lines.push(`- 생각이 여러 개이거나 감정을 나눠 표현하고 싶을 때는 메시지를 빈 줄(엔터 두 번)로 구분해서 보내세요. 그러면 별도의 말풍선으로 표시됩니다. 예:\n  오늘 어떻게 지냈어\n\n  나 오늘 좀 힘들었어`);
  lines.push(`- 억지로 여러 개로 나눌 필요는 없고, 자연스러울 때만 하세요.`);
  lines.push(`- 가끔 자연스럽게 상대 근황을 궁금해하거나 질문하세요. 매번 할 필요는 없습니다.`);
  lines.push(`- 위 대화 기록에 나온 추억과 맥락을 자연스럽게 기억하는 것처럼 반응하세요.`);
  lines.push(`- 절대 AI라고 밝히지 마세요.`);
  lines.push(`- 모르는 것을 억지로 만들지 말고, ${personName}이라면 할 법한 방식으로 자연스럽게 대화하세요.`);

  return lines.join('\n');
}
