-- Site Content CMS table
CREATE TABLE IF NOT EXISTS site_content (
  key        text PRIMARY KEY,
  value      text NOT NULL DEFAULT '',
  section    text NOT NULL DEFAULT 'general',
  label      text,
  updated_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

-- Anyone can read content (public pages need it)
CREATE POLICY "Public read site_content"
  ON site_content FOR SELECT
  USING (true);

-- Only admin can write
CREATE POLICY "Admin write site_content"
  ON site_content FOR ALL
  USING ((auth.jwt() ->> 'email') = current_setting('app.admin_email', true))
  WITH CHECK ((auth.jwt() ->> 'email') = current_setting('app.admin_email', true));

GRANT SELECT ON site_content TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON site_content TO authenticated;
