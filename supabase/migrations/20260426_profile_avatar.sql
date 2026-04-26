-- Add avatar field to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar text DEFAULT '🎏';
