-- Align lesson_progress schema with UnifiedSession engine output.
-- Safe: only adds optional columns, drops nothing, touches no user/vocab/profile data.

-- Allow state to be null for incremental saves (completion always provides it)
ALTER TABLE lesson_progress
  ALTER COLUMN state DROP NOT NULL;

-- Allow total_steps to be null for incremental saves
ALTER TABLE lesson_progress
  ALTER COLUMN total_steps DROP NOT NULL;

-- Add mistakes tracking if missing (already exists in baseline but guard with IF NOT EXISTS)
ALTER TABLE lesson_progress
  ADD COLUMN IF NOT EXISTS mistakes_count int NOT NULL DEFAULT 0;

-- updated_at auto-refresh trigger
CREATE OR REPLACE FUNCTION update_lesson_progress_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS lesson_progress_updated_at ON lesson_progress;
CREATE TRIGGER lesson_progress_updated_at
  BEFORE UPDATE ON lesson_progress
  FOR EACH ROW EXECUTE FUNCTION update_lesson_progress_updated_at();
