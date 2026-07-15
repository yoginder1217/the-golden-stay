-- Bookings table RLS policies
-- Run in Supabase SQL Editor

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Users can read their own bookings
DROP POLICY IF EXISTS "Users read own bookings" ON bookings;
CREATE POLICY "Users read own bookings"
  ON bookings FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own bookings
DROP POLICY IF EXISTS "Users insert own bookings" ON bookings;
CREATE POLICY "Users insert own bookings"
  ON bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own bookings (e.g. cancel)
DROP POLICY IF EXISTS "Users update own bookings" ON bookings;
CREATE POLICY "Users update own bookings"
  ON bookings FOR UPDATE
  USING (auth.uid() = user_id);

-- Admin can read all bookings
DROP POLICY IF EXISTS "Admin reads all bookings" ON bookings;
CREATE POLICY "Admin reads all bookings"
  ON bookings FOR SELECT
  USING ((auth.jwt() ->> 'email') = 'yattisingh123@gmail.com');

-- Admin can update all bookings (status changes)
DROP POLICY IF EXISTS "Admin updates all bookings" ON bookings;
CREATE POLICY "Admin updates all bookings"
  ON bookings FOR UPDATE
  USING ((auth.jwt() ->> 'email') = 'yattisingh123@gmail.com');

GRANT SELECT, INSERT, UPDATE ON bookings TO authenticated;
