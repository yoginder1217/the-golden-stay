-- Newsletter subscribers
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email         text NOT NULL UNIQUE,
  name          text,
  subscribed_at timestamptz DEFAULT now()
);
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone subscribes" ON newsletter_subscribers;
CREATE POLICY "Anyone subscribes" ON newsletter_subscribers FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Admin reads subscribers" ON newsletter_subscribers;
CREATE POLICY "Admin reads subscribers" ON newsletter_subscribers FOR SELECT
  USING ((auth.jwt() ->> 'email') = 'yattisingh123@gmail.com');
GRANT INSERT ON newsletter_subscribers TO anon, authenticated;
GRANT SELECT ON newsletter_subscribers TO authenticated;

-- Referral codes
CREATE TABLE IF NOT EXISTS referral_codes (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  code         text NOT NULL UNIQUE,
  uses         integer DEFAULT 0,
  bonus_points integer DEFAULT 200,
  created_at   timestamptz DEFAULT now()
);
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users see own referral" ON referral_codes;
CREATE POLICY "Users see own referral" ON referral_codes FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Service inserts referral" ON referral_codes;
CREATE POLICY "Service inserts referral" ON referral_codes FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Service updates referral" ON referral_codes;
CREATE POLICY "Service updates referral" ON referral_codes FOR UPDATE USING (true);
GRANT SELECT, INSERT, UPDATE ON referral_codes TO authenticated;
