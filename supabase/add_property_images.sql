-- Add images array column to properties
-- Run in Supabase SQL Editor

ALTER TABLE properties ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}';
