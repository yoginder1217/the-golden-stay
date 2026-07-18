-- ── Guest Reviews ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id    integer NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  user_id        uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reviewer_name  text,
  property_title text,
  rating         integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment        text,
  created_at     timestamptz DEFAULT now(),
  UNIQUE(property_id, user_id)
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can read reviews
CREATE POLICY "Public read reviews" ON reviews
  FOR SELECT USING (true);

-- Authenticated users can insert their own review
CREATE POLICY "Users insert own review" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin can delete any review (replace email if yours differs)
CREATE POLICY "Admin delete reviews" ON reviews
  FOR DELETE USING (
    (auth.jwt() ->> 'email') = 'yattisingh123@gmail.com'
  );

GRANT SELECT ON reviews TO anon, authenticated;
GRANT INSERT, DELETE ON reviews TO authenticated;

-- Allow marking a booking as reviewed after submitting a review
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS reviewed boolean DEFAULT false;
