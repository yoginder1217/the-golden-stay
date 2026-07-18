-- ── Add-on Packages ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS addons (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL,
  description text,
  price       numeric(10,2) NOT NULL DEFAULT 0,
  category    text DEFAULT 'experience',
  emoji       text DEFAULT '✨',
  is_active   boolean DEFAULT true,
  sort_order  integer DEFAULT 0,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE addons ENABLE ROW LEVEL SECURITY;

-- Public can read active add-ons
CREATE POLICY "Public read active addons" ON addons
  FOR SELECT USING (is_active = true);

-- Admin full access
CREATE POLICY "Admin full access addons" ON addons
  FOR ALL USING (
    (auth.jwt() ->> 'email') = 'yattisingh123@gmail.com'
  );

GRANT SELECT ON addons TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON addons TO authenticated;

-- Store selected add-ons on each booking
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS addons_data  jsonb          DEFAULT '[]';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS addons_total numeric(10,2)  DEFAULT 0;

-- Seed default add-on catalogue
INSERT INTO addons (title, description, price, category, emoji, sort_order) VALUES
  ('Airport Pickup',      'Comfortable sedan pickup from the nearest airport',          1500, 'transport',  '🚗', 1),
  ('Welcome Hamper',      'Seasonal fruits, artisan snacks & a handwritten welcome note', 800, 'food',     '🧺', 2),
  ('Candlelight Dinner',  'Private rooftop dinner for two — curated 4-course menu',     3500, 'food',      '🕯️', 3),
  ('Yoga Session',        '60-min guided session with a certified instructor',           1200, 'wellness',  '🧘', 4),
  ('Bonfire Night',       'Evening bonfire with s''mores kit and marshmallows',          1000, 'experience','🔥', 5),
  ('Photography Session', '1-hour professional property or couple shoot',                2500, 'experience','📸', 6)
ON CONFLICT DO NOTHING;
