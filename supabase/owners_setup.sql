-- ── Property Owners ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS property_owners (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name              text NOT NULL,
  email             text UNIQUE NOT NULL,
  phone             text,
  commission_percent numeric(5,2) NOT NULL DEFAULT 10.00,
  bank_name         text,
  account_number    text,
  ifsc_code         text,
  upi_id            text,
  notes             text,
  created_at        timestamptz DEFAULT now()
);

ALTER TABLE property_owners ENABLE ROW LEVEL SECURITY;

-- Admin full access
CREATE POLICY "Admin full access property_owners" ON property_owners
  FOR ALL USING (
    (auth.jwt() ->> 'email') = '178.yogi@gmail.com'
  );

-- Each owner can read their own record (used for role detection on login)
CREATE POLICY "Owner read own record" ON property_owners
  FOR SELECT USING (auth.uid() = user_id);

GRANT SELECT ON property_owners TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON property_owners TO authenticated;


-- ── Link properties to owners ───────────────────────────────────────────────
ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES property_owners(id) ON DELETE SET NULL;


-- ── Payouts ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payouts (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id         uuid NOT NULL REFERENCES property_owners(id) ON DELETE CASCADE,
  period_label     text NOT NULL,          -- e.g. "June 2025"
  period_start     date NOT NULL,
  period_end       date NOT NULL,
  gross_amount     numeric(12,2) NOT NULL DEFAULT 0,
  commission_amount numeric(12,2) NOT NULL DEFAULT 0,
  net_amount       numeric(12,2) NOT NULL DEFAULT 0,
  booking_count    int NOT NULL DEFAULT 0,
  status           text NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending', 'paid')),
  payment_method   text,                   -- 'upi' | 'bank_transfer' | 'cash'
  transaction_ref  text,
  notes            text,
  paid_at          timestamptz,
  created_at       timestamptz DEFAULT now()
);

ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;

-- Admin full access
CREATE POLICY "Admin full access payouts" ON payouts
  FOR ALL USING (
    (auth.jwt() ->> 'email') = '178.yogi@gmail.com'
  );

-- Each owner can read their own payouts
CREATE POLICY "Owner read own payouts" ON payouts
  FOR SELECT USING (
    owner_id IN (
      SELECT id FROM property_owners WHERE user_id = auth.uid()
    )
  );

GRANT SELECT ON payouts TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON payouts TO authenticated;
