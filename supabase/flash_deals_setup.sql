-- Flash deals columns for properties
ALTER TABLE properties ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS discount_percent integer DEFAULT 0;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS deal_label text;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS deal_expires_at timestamptz;

-- Minimum stay
ALTER TABLE properties ADD COLUMN IF NOT EXISTS min_nights integer DEFAULT 1;
