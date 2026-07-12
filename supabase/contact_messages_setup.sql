-- Contact messages table
-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS contact_messages (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name       text NOT NULL,
  email      text NOT NULL,
  phone      text DEFAULT '',
  message    text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Anyone (including anonymous visitors) can submit a contact form
DROP POLICY IF EXISTS "Anyone can insert contact messages" ON contact_messages;
CREATE POLICY "Anyone can insert contact messages"
  ON contact_messages FOR INSERT
  WITH CHECK (true);

-- Only authenticated users (admin) can read messages
DROP POLICY IF EXISTS "Authenticated can read contact messages" ON contact_messages;
CREATE POLICY "Authenticated can read contact messages"
  ON contact_messages FOR SELECT
  USING (auth.role() = 'authenticated');

GRANT INSERT ON contact_messages TO anon, authenticated;
GRANT SELECT ON contact_messages TO authenticated;
