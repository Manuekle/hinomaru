-- SRS Refactor: Rename interval, add SRS to saved words, and add streak caching to profiles

-- 1. Rename interval to interval_days in progress table
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'progress' AND column_name = 'interval') THEN
    ALTER TABLE progress RENAME COLUMN "interval" TO "interval_days";
  END IF;
END $$;

-- 2. Add SRS columns to user_saved_words
ALTER TABLE user_saved_words 
  ADD COLUMN IF NOT EXISTS easiness      numeric(4,2) NOT NULL DEFAULT 2.5,
  ADD COLUMN IF NOT EXISTS interval_days  int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS repetitions   int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS next_review   timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS last_seen     timestamptz;

CREATE INDEX IF NOT EXISTS idx_user_saved_words_next_review ON user_saved_words (user_id, next_review);

-- 3. Add streak caching to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS current_streak  int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_study_date date;

-- 4. Update get_user_streak to check cached value or calculate
-- (We keep the dynamic calculation but could optimize later)
