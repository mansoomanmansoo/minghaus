import { db } from './db';

export interface UserInfo {
  name: string;
  relation: string;
  memo: string;
}

export interface PersonaStore {
  id: string;
  userId: string;
  personName: string;
  recentContext: string;
  styleNote: string;
  userInfo: UserInfo;
  messageCount: number;
  coveredCount: number;
  learnedFacts: string[];
  createdAt: Date;
}

export async function savePersona(persona: PersonaStore): Promise<void> {
  const { error } = await db.from('personas').upsert({
    id: persona.id,
    user_id: persona.userId,
    person_name: persona.personName,
    user_info: persona.userInfo,
    recent_context: persona.recentContext,
    style_note: persona.styleNote,
    message_count: persona.messageCount,
    covered_count: persona.coveredCount,
    learned_facts: persona.learnedFacts,
  });
  if (error) throw error;
}

export async function getPersona(id: string): Promise<PersonaStore | null> {
  const { data, error } = await db
    .from('personas')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;

  return dbRowToPersona(data);
}

export async function listPersonas(userId: string): Promise<PersonaStore[]> {
  const { data, error } = await db
    .from('personas')
    .select('id, user_id, person_name, user_info, message_count, covered_count, learned_facts, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  return data.map(d => ({ ...dbRowToPersona(d as PersonaRow), recentContext: '', styleNote: '' }));
}

export async function deletePersona(id: string, userId: string): Promise<void> {
  const { error } = await db.from('personas').delete().eq('id', id).eq('user_id', userId);
  if (error) throw error;
}

export async function updateLearnedFacts(id: string, learnedFacts: string[]): Promise<void> {
  const { error } = await db.from('personas').update({ learned_facts: learnedFacts }).eq('id', id);
  if (error) throw error;
}

export async function getLetter(id: string): Promise<string | null> {
  const { data } = await db.from('personas').select('letter').eq('id', id).single();
  return (data as { letter?: string | null } | null)?.letter ?? null;
}

export async function saveLetter(id: string, letter: string): Promise<void> {
  const { error } = await db.from('personas').update({ letter }).eq('id', id);
  if (error) throw error;
}

interface PersonaRow {
  id: string;
  user_id: string;
  person_name: string;
  recent_context: string | null;
  style_note: string | null;
  user_info: UserInfo | null;
  message_count: number | null;
  covered_count: number | null;
  learned_facts: string[] | null;
  created_at: string;
}

function dbRowToPersona(d: PersonaRow): PersonaStore {
  return {
    id: d.id,
    userId: d.user_id,
    personName: d.person_name,
    recentContext: d.recent_context ?? '',
    styleNote: d.style_note ?? '',
    userInfo: (d.user_info ?? {}) as UserInfo,
    messageCount: d.message_count ?? 0,
    coveredCount: d.covered_count ?? 0,
    learnedFacts: d.learned_facts ?? [],
    createdAt: new Date(d.created_at),
  };
}

// Conversation helpers
export async function getOrCreateConversation(personaId: string, userId: string): Promise<string> {
  const { data: existing } = await db
    .from('conversations')
    .select('id')
    .eq('persona_id', personaId)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (existing) return existing.id as string;

  const { data: created, error } = await db
    .from('conversations')
    .insert({ persona_id: personaId, user_id: userId })
    .select('id')
    .single();

  if (error || !created) throw new Error('Failed to create conversation');
  return created.id as string;
}

export interface DbMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  hidden: boolean;
  created_at: string;
}

export async function loadMessages(conversationId: string, limit = 40): Promise<DbMessage[]> {
  const { data, error } = await db
    .from('messages')
    .select('id, role, content, hidden, created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error || !data) return [];
  return data as DbMessage[];
}

export async function saveMessages(
  conversationId: string,
  msgs: Array<{ role: 'user' | 'assistant'; content: string; hidden?: boolean }>
): Promise<void> {
  const rows = msgs.map(m => ({
    conversation_id: conversationId,
    role: m.role,
    content: m.content,
    hidden: m.hidden ?? false,
  }));
  const { error } = await db.from('messages').insert(rows);
  if (error) throw error;

  // bump updated_at
  await db
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', conversationId);
}
