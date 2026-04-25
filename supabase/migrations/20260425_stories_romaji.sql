-- Add body_romaji column to stories table
ALTER TABLE stories ADD COLUMN IF NOT EXISTS body_romaji text;
