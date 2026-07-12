-- Property Images Storage Bucket
-- Run in Supabase SQL Editor

INSERT INTO storage.buckets (id, name, public)
VALUES ('property-images', 'property-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload images
DROP POLICY IF EXISTS "Authenticated can upload property images" ON storage.objects;
CREATE POLICY "Authenticated can upload property images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'property-images' AND auth.role() = 'authenticated');

-- Allow anyone to read images (public bucket)
DROP POLICY IF EXISTS "Public can read property images" ON storage.objects;
CREATE POLICY "Public can read property images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'property-images');

-- Allow authenticated users to delete their uploads
DROP POLICY IF EXISTS "Authenticated can delete property images" ON storage.objects;
CREATE POLICY "Authenticated can delete property images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'property-images' AND auth.role() = 'authenticated');
