-- Table for daily words (Word of the Day)
CREATE TABLE IF NOT EXISTS daily_words (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  jp text NOT NULL,
  kana text NOT NULL,
  romaji text NOT NULL,
  en text NOT NULL,
  es text NOT NULL,
  level text DEFAULT 'N5',
  date date UNIQUE NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- Table for user's personal saved vocabulary
CREATE TABLE IF NOT EXISTS user_saved_words (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  word_id uuid REFERENCES daily_words ON DELETE SET NULL, -- if it's from daily words
  jp text NOT NULL,
  kana text NOT NULL,
  romaji text NOT NULL,
  en text NOT NULL,
  es text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, jp) -- prevent saving the same word twice
);

-- RLS
ALTER TABLE daily_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_saved_words ENABLE ROW LEVEL SECURITY;

CREATE POLICY "daily_words_select" ON daily_words
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "user_saved_words_select" ON user_saved_words
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "user_saved_words_insert" ON user_saved_words
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_saved_words_delete" ON user_saved_words
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Seed some daily words for the next few days
INSERT INTO daily_words (jp, kana, romaji, en, es, level, date) VALUES
('林檎', 'りんご', 'ringo', 'Apple', 'Manzana', 'N5', CURRENT_DATE),
('太陽', 'たいよう', 'taiyou', 'Sun', 'Sol', 'N5', CURRENT_DATE + 1),
('友達', 'ともだち', 'tomodachi', 'Friend', 'Amigo', 'N5', CURRENT_DATE + 2)
ON CONFLICT (date) DO NOTHING;
