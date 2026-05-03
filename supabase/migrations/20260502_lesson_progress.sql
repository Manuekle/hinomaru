-- Lesson progress: persists guided-learning engine state per user/lesson.
-- Lesson IDs come from app/src/lib/data/roadmap.ts (e.g. n5-c2__n5-greetings__learn).

CREATE TABLE IF NOT EXISTS lesson_progress (
  user_id        uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id      text NOT NULL,
  total_steps    int  NOT NULL,
  correct_count  int  NOT NULL DEFAULT 0,
  mistakes_count int  NOT NULL DEFAULT 0,
  state          jsonb NOT NULL,
  completed_at   timestamptz,
  updated_at     timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_lesson_progress_user
  ON lesson_progress (user_id, completed_at);

ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "lesson_progress_own_select" ON lesson_progress;
CREATE POLICY "lesson_progress_own_select" ON lesson_progress
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "lesson_progress_own_insert" ON lesson_progress;
CREATE POLICY "lesson_progress_own_insert" ON lesson_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "lesson_progress_own_update" ON lesson_progress;
CREATE POLICY "lesson_progress_own_update" ON lesson_progress
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "lesson_progress_own_delete" ON lesson_progress;
CREATE POLICY "lesson_progress_own_delete" ON lesson_progress
  FOR DELETE USING (auth.uid() = user_id);
