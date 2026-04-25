-- ============================================================
-- Baseline schema: decks, cards, profiles, progress, sessions,
--                  contact_messages
-- Must run BEFORE 20260424_stories.sql
-- ============================================================

-- ─── DECKS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS decks (
  id         text PRIMARY KEY,           -- slug: 'n5-vocab', 'n5-hiragana', etc.
  level      text NOT NULL,              -- 'N5' | 'N4' | 'N3' | 'N2' | 'N1'
  kind       text NOT NULL,              -- 'Vocabulary' | 'Hiragana' | 'Katakana' | 'Kanji' | 'Grammar'
  kind_es    text NOT NULL,
  title_en   text NOT NULL,
  title_es   text NOT NULL,
  desc_en    text NOT NULL DEFAULT '',
  desc_es    text NOT NULL DEFAULT '',
  card_count int  NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE decks ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read decks (public curriculum)
CREATE POLICY "decks_select" ON decks
  FOR SELECT TO authenticated USING (true);

-- ─── CARDS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cards (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id         text NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
  jp              text NOT NULL,
  romaji          text NOT NULL DEFAULT '',
  en              text NOT NULL,
  es              text NOT NULL,
  example         text NOT NULL DEFAULT '',
  example_romaji  text NOT NULL DEFAULT '',
  example_en      text NOT NULL DEFAULT '',
  example_es      text NOT NULL DEFAULT '',
  extra           jsonb,
  sort_order      int  NOT NULL DEFAULT 0,
  created_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cards_deck_sort ON cards (deck_id, sort_order);

ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cards_select" ON cards
  FOR SELECT TO authenticated USING (true);

-- ─── PROFILES ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id                    uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  onboarding_completed  boolean NOT NULL DEFAULT false,
  motivation            text,
  experience            text,
  srs_enabled           boolean NOT NULL DEFAULT true,
  voice                 text    NOT NULL DEFAULT 'standard',
  daily_goal            int     NOT NULL DEFAULT 5,
  updated_at            timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select" ON profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "profiles_insert" ON profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update" ON profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Auto-create profile row on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ─── PROGRESS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS progress (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  card_id     uuid NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  learned     boolean NOT NULL DEFAULT false,
  easiness    numeric(4,2) NOT NULL DEFAULT 2.5,  -- SM-2 EF, floor 1.3
  interval    int NOT NULL DEFAULT 0,              -- days until next review
  repetitions int NOT NULL DEFAULT 0,
  next_review timestamptz,
  last_seen   timestamptz,
  UNIQUE(user_id, card_id)
);

CREATE INDEX IF NOT EXISTS idx_progress_user_id      ON progress (user_id);
CREATE INDEX IF NOT EXISTS idx_progress_user_learned  ON progress (user_id, learned) WHERE learned = true;
CREATE INDEX IF NOT EXISTS idx_progress_next_review   ON progress (user_id, next_review) WHERE learned = true;
CREATE INDEX IF NOT EXISTS idx_progress_user_card     ON progress (user_id, card_id);

ALTER TABLE progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "progress_select" ON progress
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "progress_insert" ON progress
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "progress_update" ON progress
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- ─── SESSIONS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sessions (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  deck_id    text NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
  mode       text NOT NULL,   -- 'flashcards' | 'quiz' | 'type' | 'write' | 'match'
  correct    int  NOT NULL DEFAULT 0,
  total      int  NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_created ON sessions (user_id, created_at DESC);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sessions_select" ON sessions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "sessions_insert" ON sessions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- ─── CONTACT MESSAGES ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS contact_messages (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
  email      text NOT NULL CHECK (email ~* '^[^@]+@[^@]+\.[^@]+$'),
  message    text NOT NULL CHECK (char_length(message) BETWEEN 1 AND 5000),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Anyone (including anonymous) can submit contact messages; no read-back
CREATE POLICY "contact_insert" ON contact_messages
  FOR INSERT TO anon, authenticated WITH CHECK (true);
