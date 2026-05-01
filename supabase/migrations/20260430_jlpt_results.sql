-- JLPT practice results per user/level/section
-- Only keeps the latest result per combination (UPSERT by unique constraint)
CREATE TABLE IF NOT EXISTS jlpt_results (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid        NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  level        text        NOT NULL,  -- 'N1' | 'N2' | 'N3' | 'N4' | 'N5'
  section      text        NOT NULL,  -- 'vocabulary' | 'grammar' | 'listening'
  score        int         NOT NULL DEFAULT 0,
  total        int         NOT NULL DEFAULT 0,
  pct          int         NOT NULL DEFAULT 0,
  completed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, level, section)
);

CREATE INDEX IF NOT EXISTS idx_jlpt_results_user ON jlpt_results (user_id);

ALTER TABLE jlpt_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "jlpt_results_select" ON jlpt_results
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "jlpt_results_insert" ON jlpt_results
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "jlpt_results_update" ON jlpt_results
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
