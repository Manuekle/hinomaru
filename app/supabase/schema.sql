-- Hinomaru 日の丸 — Supabase schema v2
-- Run this in the Supabase SQL editor.
-- Content is seeded via: npm run seed

-- ─── Tables ───────────────────────────────────────────────────────────────────

create table if not exists decks (
  id         text primary key,
  level      text not null,                          -- 'N5' | 'N4' | 'N3' | 'N2' | 'N1'
  kind       text not null,                          -- 'Vocabulary' | 'Hiragana' | 'Katakana' | 'Kanji' | 'Grammar'
  kind_es    text,
  title_en   text not null,
  title_es   text,
  desc_en    text,
  desc_es    text,
  card_count int default 0                           -- updated by seed script
);

create table if not exists cards (
  id          uuid primary key default gen_random_uuid(),
  deck_id     text references decks(id) on delete cascade,
  jp          text not null,
  romaji      text,
  en          text,
  es          text,
  example     text,
  example_en  text,
  example_es  text,
  extra       jsonb,                                 -- {onyomi, kunyomi, strokes} for kanji
  sort_order  int default 0
);

create index if not exists idx_cards_deck on cards(deck_id);

create table if not exists grammar_points (
  id          uuid primary key default gen_random_uuid(),
  deck_id     text references decks(id) on delete cascade,
  pattern     text not null,
  meaning_en  text,
  meaning_es  text,
  usage       text,
  examples    jsonb,                                 -- [{jp, en, es}]
  sort_order  int default 0
);

create index if not exists idx_grammar_deck on grammar_points(deck_id);

create table if not exists progress (
  user_id   uuid references auth.users(id) on delete cascade,
  card_id   uuid references cards(id) on delete cascade,
  learned   boolean default false,
  streak    int default 0,
  last_seen timestamptz,
  primary key (user_id, card_id)
);

create table if not exists grammar_progress (
  user_id    uuid references auth.users(id) on delete cascade,
  point_id   uuid references grammar_points(id) on delete cascade,
  learned    boolean default false,
  last_seen  timestamptz,
  primary key (user_id, point_id)
);

create table if not exists sessions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade,
  deck_id    text references decks(id) on delete set null,
  mode       text,                                   -- 'flashcards' | 'quiz' | 'type' | 'grammar'
  correct    int,
  total      int,
  created_at timestamptz default now()
);

-- ─── RLS ──────────────────────────────────────────────────────────────────────

alter table decks            enable row level security;
alter table cards            enable row level security;
alter table grammar_points   enable row level security;
alter table progress         enable row level security;
alter table grammar_progress enable row level security;
alter table sessions         enable row level security;

-- Content: public read
create policy "decks public read"   on decks          for select using (true);
create policy "cards public read"   on cards          for select using (true);
create policy "grammar public read" on grammar_points for select using (true);

-- Progress: user-scoped
create policy "progress user select" on progress for select using (auth.uid() = user_id);
create policy "progress user insert" on progress for insert with check (auth.uid() = user_id);
create policy "progress user update" on progress for update using (auth.uid() = user_id);

create policy "grammar_progress user select" on grammar_progress for select using (auth.uid() = user_id);
create policy "grammar_progress user insert" on grammar_progress for insert with check (auth.uid() = user_id);
create policy "grammar_progress user update" on grammar_progress for update using (auth.uid() = user_id);

-- Sessions: user-scoped
create policy "sessions user select" on sessions for select using (auth.uid() = user_id);
create policy "sessions user insert" on sessions for insert with check (auth.uid() = user_id);
