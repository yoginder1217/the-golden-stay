-- Promo codes table
-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS promo_codes (
  code          text PRIMARY KEY,
  discount_type text NOT NULL CHECK (discount_type IN ('flat', 'percent')),
  discount_value integer NOT NULL,
  min_booking   integer DEFAULT 0,
  uses_left     integer DEFAULT -1,  -- -1 = unlimited
  expires_at    timestamptz,
  is_active     boolean DEFAULT true,
  created_at    timestamptz DEFAULT now()
);

ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read active codes" ON promo_codes;
CREATE POLICY "Authenticated users can read active codes"
  ON promo_codes FOR SELECT
  USING (is_active = true);

GRANT SELECT ON promo_codes TO authenticated;

-- Seed codes
INSERT INTO promo_codes (code, discount_type, discount_value, min_booking, uses_left, expires_at) VALUES
  ('GOLDEN10',  'percent', 10, 2000, 100, '2026-12-31 23:59:59+05:30'),
  ('WELCOME500','flat',    500, 3000, 200, '2026-12-31 23:59:59+05:30'),
  ('SUMMER20',  'percent', 20, 5000,  50, '2026-09-30 23:59:59+05:30')
ON CONFLICT (code) DO NOTHING;
