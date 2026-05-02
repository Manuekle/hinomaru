-- Ensure all word fields exist on user_saved_words.
-- Some deployments are missing romaji entirely; others have it NOT NULL.
-- Make schema permissive so saves from songs/stories never fail on missing optional fields.

ALTER TABLE user_saved_words
  ADD COLUMN IF NOT EXISTS romaji         text,
  ADD COLUMN IF NOT EXISTS example_kana   text,
  ADD COLUMN IF NOT EXISTS example_romaji text,
  ADD COLUMN IF NOT EXISTS category       text,
  ADD COLUMN IF NOT EXISTS category_es    text;

-- Drop NOT NULL on romaji if present (no-op if already nullable).
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_saved_words'
      AND column_name = 'romaji'
      AND is_nullable = 'NO'
  ) THEN
    EXECUTE 'ALTER TABLE user_saved_words ALTER COLUMN romaji DROP NOT NULL';
  END IF;
END $$;
