-- Blocked dates table (owner-controlled date blocks per property)
-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS blocked_dates (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id bigint REFERENCES properties(id) ON DELETE CASCADE,
  start_date  date NOT NULL,
  end_date    date NOT NULL,
  reason      text DEFAULT '',
  created_at  timestamptz DEFAULT now(),
  CONSTRAINT valid_range CHECK (end_date > start_date)
);

ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read blocked dates" ON blocked_dates;
CREATE POLICY "Anyone can read blocked dates"
  ON blocked_dates FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated can manage blocked dates" ON blocked_dates;
CREATE POLICY "Authenticated can manage blocked dates"
  ON blocked_dates FOR ALL USING (auth.role() = 'authenticated');

GRANT SELECT ON blocked_dates TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON blocked_dates TO authenticated;
