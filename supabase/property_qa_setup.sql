CREATE TABLE IF NOT EXISTS property_qa (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id integer REFERENCES properties(id) ON DELETE CASCADE,
  user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  asker_name  text,
  question    text NOT NULL,
  answer      text,
  answered_at timestamptz,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE property_qa ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone reads QA" ON property_qa;
CREATE POLICY "Anyone reads QA" ON property_qa FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users ask" ON property_qa;
CREATE POLICY "Authenticated users ask" ON property_qa FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin answers" ON property_qa;
CREATE POLICY "Admin answers" ON property_qa FOR UPDATE
  USING ((auth.jwt() ->> 'email') = 'yattisingh123@gmail.com');

GRANT SELECT, INSERT ON property_qa TO authenticated;
GRANT SELECT ON property_qa TO anon;
GRANT UPDATE ON property_qa TO authenticated;
