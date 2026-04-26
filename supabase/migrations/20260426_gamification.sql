-- Add XP and lesson count to profiles for gamification
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS xp             int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_lessons  int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS level          int DEFAULT 1;

-- Function to add XP to a user
CREATE OR REPLACE FUNCTION add_user_xp(user_id uuid, amount int)
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET 
    xp = xp + amount,
    total_lessons = total_lessons + 1,
    level = floor(1 + sqrt(xp + amount) / 10) -- Simple level formula
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
