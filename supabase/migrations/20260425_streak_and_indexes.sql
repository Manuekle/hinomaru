-- ============================================================
-- Streak RPC + additional indexes + stories seed fixes
-- ============================================================

-- ─── STREAK FUNCTION ────────────────────────────────────────
-- Returns the current consecutive-day streak for the calling user.
-- Counts distinct calendar dates (in UTC) with at least one session,
-- working backwards from today until a gap is found.
CREATE OR REPLACE FUNCTION public.get_user_streak()
RETURNS int LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  streak int := 0;
  check_date date := CURRENT_DATE;
  has_session bool;
BEGIN
  LOOP
    SELECT EXISTS (
      SELECT 1 FROM sessions
      WHERE user_id = auth.uid()
        AND created_at::date = check_date
    ) INTO has_session;

    EXIT WHEN NOT has_session;

    streak := streak + 1;
    check_date := check_date - 1;
  END LOOP;

  RETURN streak;
END;
$$;

-- ─── STORIES INDEXES ────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_stories_publish_date
  ON stories (publish_date DESC);

CREATE INDEX IF NOT EXISTS idx_user_story_reads_user_id
  ON user_story_reads (user_id);

-- ─── quiz_score constraint ───────────────────────────────────
ALTER TABLE user_story_reads
  ADD CONSTRAINT quiz_score_range
  CHECK (quiz_score IS NULL OR quiz_score BETWEEN 0 AND 100);

-- ─── STORIES seed guard ─────────────────────────────────────
-- Prevent duplicate stories if migration is re-run
-- (The original seed in 20260424_stories.sql lacks ON CONFLICT,
--  so we add a unique constraint here to prevent silent duplication)
ALTER TABLE stories
  ADD CONSTRAINT stories_title_en_unique UNIQUE (title_en);
