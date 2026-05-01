-- Rename date → publish_date if it exists
DO $$ 
BEGIN 
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='daily_words' AND column_name='date') THEN
    ALTER TABLE daily_words RENAME COLUMN date TO publish_date;
  END IF;
END $$;

-- Ensure other columns exist
ALTER TABLE daily_words
  ADD COLUMN IF NOT EXISTS romaji text,
  ADD COLUMN IF NOT EXISTS level text,
  ADD COLUMN IF NOT EXISTS example text,
  ADD COLUMN IF NOT EXISTS example_en text,
  ADD COLUMN IF NOT EXISTS example_es text;

-- Drop the old unique constraint (named after original column) if it exists
ALTER TABLE daily_words DROP CONSTRAINT IF EXISTS daily_words_date_key;

-- Add the new unique constraint if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'daily_words_publish_date_key') THEN
    ALTER TABLE daily_words ADD CONSTRAINT daily_words_publish_date_key UNIQUE (publish_date);
  END IF;
END $$;
