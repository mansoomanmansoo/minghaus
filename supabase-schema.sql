-- Supabase SQL Editor에서 실행하세요
-- 기존 테이블이 있으면 전부 드롭 후 재생성

drop table if exists messages cascade;
drop table if exists conversations cascade;
drop table if exists vector_chunks cascade;
drop table if exists personas cascade;

create extension if not exists vector;

-- 페르소나 테이블
create table personas (
  id            text primary key,
  user_id       text not null,
  person_name   text not null,
  user_info     jsonb not null default '{}',
  recent_context text not null default '',
  style_note     text not null default '',
  message_count  int not null default 0,
  covered_count  int not null default 0,
  learned_facts  text[] not null default '{}',
  created_at    timestamptz not null default now()
);

-- 벡터 청크 (voyage-3-lite: 512 dim)
create table vector_chunks (
  id           bigserial primary key,
  persona_id   text not null references personas(id) on delete cascade,
  chunk_index  int not null,
  chunk_text   text not null,
  chunk_date   text not null default '',
  embedding    vector(512)
);

-- 대화 세션 (페르소나당 하나)
create table conversations (
  id           uuid primary key default gen_random_uuid(),
  persona_id   text not null references personas(id) on delete cascade,
  user_id      text not null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- 메시지
create table messages (
  id              bigserial primary key,
  conversation_id uuid not null references conversations(id) on delete cascade,
  role            text not null check (role in ('user', 'assistant')),
  content         text not null,
  hidden          boolean not null default false,
  created_at      timestamptz not null default now()
);

-- 인덱스
create index vector_chunks_persona_idx on vector_chunks (persona_id);
create index vector_chunks_embedding_idx on vector_chunks using ivfflat (embedding vector_cosine_ops) with (lists = 100);
create index personas_user_idx on personas (user_id);
create index conversations_persona_idx on conversations (persona_id);
create index messages_conversation_idx on messages (conversation_id);

-- RLS 비활성화 (서버사이드 전용 앱, API 라우트에서 user_id로 직접 필터링)
alter table personas disable row level security;
alter table vector_chunks disable row level security;
alter table conversations disable row level security;
alter table messages disable row level security;

-- 벡터 유사도 검색 함수
create or replace function match_chunks(
  p_persona_id   text,
  query_embedding vector(512),
  match_count    int default 8
)
returns table (chunk_text text, chunk_date text, similarity float)
language sql stable as $$
  select chunk_text, chunk_date,
         1 - (embedding <=> query_embedding) as similarity
  from vector_chunks
  where persona_id = p_persona_id
    and embedding is not null
  order by embedding <=> query_embedding
  limit match_count;
$$;
