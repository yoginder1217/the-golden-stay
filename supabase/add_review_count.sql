-- Add review_count to properties for display on listing cards
ALTER TABLE properties ADD COLUMN IF NOT EXISTS review_count integer DEFAULT 0;
