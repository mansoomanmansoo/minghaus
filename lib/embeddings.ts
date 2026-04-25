import type { ParsedMessage } from './kakao-parser';

const VOYAGE_API_URL = 'https://api.voyageai.com/v1/embeddings';
const MODEL = 'voyage-3-lite';
const SKIP_RE = /\(이모티콘\)|\[이모티콘\]|\(사진\)|\[사진\]|\(파일\)|\[파일\]|\(동영상\)/;
const CHUNK_SIZE = 6;
const BATCH_SIZE = 128;
const DB_BATCH_SIZE = 500;

export interface VectorChunk {
  id: number;
  text: string;
  date: string;
  vector: number[];
}

async function fetchEmbeddings(texts: string[]): Promise<number[][]> {
  const res = await fetch(VOYAGE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.VOYAGE_API_KEY}`,
    },
    body: JSON.stringify({ model: MODEL, input: texts }),
  });
  if (!res.ok) throw new Error(`Voyage API error: ${res.status} ${await res.text()}`);
  const json = await res.json() as { data: Array<{ embedding: number[] }> };
  return json.data.map(d => d.embedding);
}

export async function embedConversation(
  messages: ParsedMessage[],
  personName: string,
  userDisplayName: string,
  onProgress?: (done: number, total: number) => void
): Promise<VectorChunk[]> {
  const textMsgs = messages.filter(m => m.content && !SKIP_RE.test(m.content));

  const isTarget = (m: ParsedMessage) =>
    m.sender.trim() === personName.trim() ||
    m.sender.includes(personName) ||
    personName.includes(m.sender.trim());

  const chunks: Omit<VectorChunk, 'vector'>[] = [];
  for (let i = 0; i < textMsgs.length; i += CHUNK_SIZE) {
    const slice = textMsgs.slice(i, i + CHUNK_SIZE);
    const lines = slice.map(m => {
      const speaker = isTarget(m) ? personName : (userDisplayName || '나');
      return `${speaker}: ${m.content}`;
    });
    chunks.push({ id: i, text: lines.join('\n'), date: slice[0].date });
  }

  const results: VectorChunk[] = [];
  const total = chunks.length;

  for (let b = 0; b < chunks.length; b += BATCH_SIZE) {
    const batch = chunks.slice(b, b + BATCH_SIZE);
    const vectors = await fetchEmbeddings(batch.map(c => c.text));
    for (let j = 0; j < batch.length; j++) {
      results.push({ ...batch[j], vector: vectors[j] });
    }
    onProgress?.(Math.min(b + BATCH_SIZE, total), total);
  }

  return results;
}

export async function saveVectorChunks(personaId: string, chunks: VectorChunk[]): Promise<void> {
  const { db } = await import('./db');

  const rows = chunks.map((c, i) => ({
    persona_id: personaId,
    chunk_index: i,
    chunk_text: c.text,
    chunk_date: c.date,
    embedding: `[${c.vector.join(',')}]`,
  }));

  for (let i = 0; i < rows.length; i += DB_BATCH_SIZE) {
    const { error } = await db.from('vector_chunks').insert(rows.slice(i, i + DB_BATCH_SIZE));
    if (error) throw error;
  }
}

export async function searchVectorsByPersonaId(
  personaId: string,
  query: string,
  topK = 8
): Promise<Array<{ text: string; date: string }>> {
  const { db } = await import('./db');
  const [qVec] = await fetchEmbeddings([query]);

  const { data, error } = await db.rpc('match_chunks', {
    p_persona_id: personaId,
    query_embedding: `[${qVec.join(',')}]`,
    match_count: topK,
  });

  if (error) throw error;
  return (data ?? []).map((r: { chunk_text: string; chunk_date: string }) => ({
    text: r.chunk_text,
    date: r.chunk_date,
  }));
}

function cosine(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-9);
}

export async function searchVectors(
  query: string,
  chunks: VectorChunk[],
  topK = 8
): Promise<VectorChunk[]> {
  if (chunks.length === 0) return [];
  const [qVec] = await fetchEmbeddings([query]);
  return chunks
    .map(c => ({ chunk: c, score: cosine(qVec, c.vector) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(s => s.chunk);
}
