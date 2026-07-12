-- Add weekend_premium column to properties table
-- Run in Supabase SQL Editor (Dashboard → SQL Editor → New query)
ALTER TABLE properties ADD COLUMN IF NOT EXISTS weekend_premium integer DEFAULT 0;
