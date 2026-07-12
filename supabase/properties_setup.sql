-- ============================================================
-- Properties table setup for The Golden Stay
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- IMPORTANT: Replace '178.yogi@gmail.com' with your actual admin email
-- ============================================================

-- 1. Create table
CREATE TABLE IF NOT EXISTS properties (
  id          serial PRIMARY KEY,
  title       text NOT NULL,
  type        text NOT NULL CHECK (type IN ('2BHK', '3BHK', 'Villa')),
  city        text NOT NULL,
  location    text NOT NULL,
  price       integer NOT NULL,
  rating      numeric(3,1) DEFAULT 4.5,
  description text,
  image       text,
  amenities   text[] DEFAULT '{}',
  links       jsonb DEFAULT '{}',
  is_active   boolean DEFAULT true,
  created_at  timestamptz DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- 3. Policies
DROP POLICY IF EXISTS "Public can read active properties" ON properties;
DROP POLICY IF EXISTS "Admin can insert properties" ON properties;
DROP POLICY IF EXISTS "Admin can update properties" ON properties;
DROP POLICY IF EXISTS "Admin can delete properties" ON properties;

CREATE POLICY "Public can read active properties"
  ON properties FOR SELECT
  USING (is_active = true);

-- Replace with your actual admin email:
CREATE POLICY "Admin can insert properties"
  ON properties FOR INSERT
  WITH CHECK ((auth.jwt() ->> 'email') = '178.yogi@gmail.com');

CREATE POLICY "Admin can update properties"
  ON properties FOR UPDATE
  USING ((auth.jwt() ->> 'email') = '178.yogi@gmail.com');

CREATE POLICY "Admin can delete properties"
  ON properties FOR DELETE
  USING ((auth.jwt() ->> 'email') = '178.yogi@gmail.com');

-- 4. Grants
GRANT SELECT ON properties TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON properties TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE properties_id_seq TO authenticated;

-- 5. Seed existing 9 properties
INSERT INTO properties (id, title, type, city, location, price, rating, image, amenities, description, links) VALUES
(1,
  'Golden Heights 3BHK Family Suite',
  '3BHK', 'Noida', 'Sector 62, Noida', 4500, 4.8,
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=800',
  ARRAY['WiFi', 'Kitchen', 'AC', 'Parking', 'TV'],
  'Experience luxury in this fully furnished 3BHK family suite. Perfect for long stays and large groups.',
  '{"airbnb":"https://www.airbnb.com","mmt":"https://www.makemytrip.com","goibibo":"https://www.goibibo.com","direct":"/checkout"}'::jsonb
),
(2,
  'Cozy 2BHK Homestay',
  '2BHK', 'Ghaziabad', 'Indirapuram, Ghaziabad', 2800, 4.5,
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800',
  ARRAY['WiFi', 'AC', 'Geyser', 'Power Backup'],
  'A compact and cozy 2BHK homestay situated right next to the metro. Ideal for small families.',
  '{"airbnb":"https://www.airbnb.com","mmt":"https://www.makemytrip.com"}'::jsonb
),
(3,
  'Royal Golden Villa',
  'Villa', 'Greater Noida', 'Greater Noida', 8500, 5.0,
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=800',
  ARRAY['Pool', 'Garden', 'Full Kitchen', 'Caretaker'],
  'A premium standalone villa for those who want privacy and luxury. Features a private garden.',
  '{"airbnb":"https://www.airbnb.com","direct":"/checkout"}'::jsonb
),
(4,
  'Delhi Central 2BHK',
  '2BHK', 'Delhi', 'Connaught Place, Delhi', 3500, 4.6,
  'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&q=80&w=800',
  ARRAY['WiFi', 'AC', 'Smart TV', 'Metro Access'],
  'Modern 2BHK in the heart of Delhi, steps from Connaught Place. Perfect for business travellers and families exploring the capital.',
  '{"airbnb":"https://www.airbnb.com","mmt":"https://www.makemytrip.com","direct":"/checkout"}'::jsonb
),
(5,
  'Cyber Hub Executive Suite',
  '3BHK', 'Gurugram', 'Sector 29, Gurugram', 5500, 4.7,
  'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&q=80&w=800',
  ARRAY['WiFi', 'Workspace', 'AC', 'Gym Access', 'Parking'],
  'Premium 3BHK executive suite near Cyber Hub. Ideal for corporate families and extended work-from-home stays.',
  '{"airbnb":"https://www.airbnb.com","mmt":"https://www.makemytrip.com","goibibo":"https://www.goibibo.com","direct":"/checkout"}'::jsonb
),
(6,
  'Bandra Luxury Apartment',
  '2BHK', 'Mumbai', 'Bandra West, Mumbai', 6500, 4.9,
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=800',
  ARRAY['WiFi', 'Sea View', 'AC', 'Concierge', 'Parking'],
  'Stunning 2BHK with partial sea view in the vibrant Bandra neighbourhood. Walking distance to cafés, galleries, and the Bandra-Worli Sea Link.',
  '{"airbnb":"https://www.airbnb.com","mmt":"https://www.makemytrip.com","direct":"/checkout"}'::jsonb
),
(7,
  'Pink City Heritage Villa',
  'Villa', 'Jaipur', 'Civil Lines, Jaipur', 7000, 4.8,
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80&w=800',
  ARRAY['Pool', 'Courtyard', 'Full Kitchen', 'Caretaker', 'AC'],
  'A regal heritage villa in Civil Lines blending Rajasthani architecture with modern comforts. Your base to explore palaces, bazaars, and forts.',
  '{"airbnb":"https://www.airbnb.com","mmt":"https://www.makemytrip.com","direct":"/checkout"}'::jsonb
),
(8,
  'Calangute Beachside Villa',
  'Villa', 'Goa', 'Calangute, Goa', 9500, 4.9,
  'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&q=80&w=800',
  ARRAY['Pool', 'Beach Access', 'BBQ', 'Garden', 'WiFi'],
  'Exclusive beachside villa 200m from Calangute beach. Private pool, lush garden, and sunset views — the ultimate Goa escape.',
  '{"airbnb":"https://www.airbnb.com","mmt":"https://www.makemytrip.com","goibibo":"https://www.goibibo.com","direct":"/checkout"}'::jsonb
),
(9,
  'Chandigarh Sector 17 Suite',
  '3BHK', 'Chandigarh', 'Sector 17, Chandigarh', 3800, 4.6,
  'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=80&w=800',
  ARRAY['WiFi', 'Kitchen', 'AC', 'Parking', 'Garden View'],
  'Spacious 3BHK in the planned beauty of Chandigarh''s Sector 17. Clean air, wide roads, and proximity to Sukhna Lake make it a perfect family retreat.',
  '{"airbnb":"https://www.airbnb.com","mmt":"https://www.makemytrip.com","direct":"/checkout"}'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- 6. Advance the sequence so new inserts start at 10
SELECT setval('properties_id_seq', 10);
