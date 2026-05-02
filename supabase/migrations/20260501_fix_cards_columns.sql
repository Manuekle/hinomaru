-- Ensure all necessary columns exist on cards table for seeding
ALTER TABLE cards 
  ADD COLUMN IF NOT EXISTS example_romaji  text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS example_en      text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS example_es      text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS category        text,
  ADD COLUMN IF NOT EXISTS category_es     text,
  ADD COLUMN IF NOT EXISTS pos             text,
  ADD COLUMN IF NOT EXISTS pos_es          text,
  ADD COLUMN IF NOT EXISTS definitions_en  text[],
  ADD COLUMN IF NOT EXISTS definitions_es  text[];
