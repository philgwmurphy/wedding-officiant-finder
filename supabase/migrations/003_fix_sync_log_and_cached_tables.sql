-- Migration: Fix sync_log columns and add cached tables
-- This migration fixes the mismatch between sync-service.ts and the database schema

-- Add missing columns to sync_log table for detailed sync tracking
ALTER TABLE sync_log ADD COLUMN IF NOT EXISTS total_fetched INTEGER;
ALTER TABLE sync_log ADD COLUMN IF NOT EXISTS total_inserted INTEGER;
ALTER TABLE sync_log ADD COLUMN IF NOT EXISTS total_updated INTEGER;

-- Create cached_affiliations table for faster API responses
CREATE TABLE IF NOT EXISTS cached_affiliations (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cached_affiliations_name ON cached_affiliations(name);

-- Create cached_municipalities table for faster API responses
CREATE TABLE IF NOT EXISTS cached_municipalities (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cached_municipalities_name ON cached_municipalities(name);

-- Enable RLS on cached tables
ALTER TABLE cached_affiliations ENABLE ROW LEVEL SECURITY;
ALTER TABLE cached_municipalities ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public can read cached_affiliations" ON cached_affiliations
  FOR SELECT USING (true);

CREATE POLICY "Public can read cached_municipalities" ON cached_municipalities
  FOR SELECT USING (true);

-- Service role can manage cached tables
CREATE POLICY "Service role can manage cached_affiliations" ON cached_affiliations
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage cached_municipalities" ON cached_municipalities
  FOR ALL USING (auth.role() = 'service_role');
