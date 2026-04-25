-- Add unique constraint to story titles to allow upserting by title
ALTER TABLE stories ADD CONSTRAINT stories_title_en_key UNIQUE (title_en);
