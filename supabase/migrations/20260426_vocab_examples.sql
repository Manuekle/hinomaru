-- Add example sentence support to vocabulary tables
ALTER TABLE daily_words
  ADD COLUMN IF NOT EXISTS example     text,
  ADD COLUMN IF NOT EXISTS example_en  text,
  ADD COLUMN IF NOT EXISTS example_es  text;

ALTER TABLE user_saved_words
  ADD COLUMN IF NOT EXISTS example     text,
  ADD COLUMN IF NOT EXISTS example_en  text,
  ADD COLUMN IF NOT EXISTS example_es  text;
