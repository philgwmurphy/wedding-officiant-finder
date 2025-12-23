-- Wedding Officiant Finder Database Schema
-- Run this in your Supabase SQL Editor

-- Enable extensions for similarity search and distance calculations
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS cube;
CREATE EXTENSION IF NOT EXISTS earthdistance;

-- Officiants table
CREATE TABLE IF NOT EXISTS officiants (
  id SERIAL PRIMARY KEY,
  ontario_id INTEGER UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  municipality TEXT NOT NULL,
  affiliation TEXT NOT NULL,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_officiants_municipality ON officiants(municipality);
CREATE INDEX IF NOT EXISTS idx_officiants_affiliation ON officiants(affiliation);
CREATE INDEX IF NOT EXISTS idx_officiants_last_name ON officiants(last_name);
CREATE INDEX IF NOT EXISTS idx_officiants_lat_lng ON officiants(lat, lng) WHERE lat IS NOT NULL AND lng IS NOT NULL;

-- Trigram indexes to speed up text search filters
CREATE INDEX IF NOT EXISTS idx_officiants_affiliation_trgm
  ON officiants USING gin (lower(affiliation) gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_officiants_municipality_trgm
  ON officiants USING gin (lower(municipality) gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_officiants_name_trgm
  ON officiants USING gin (lower(first_name || ' ' || last_name) gin_trgm_ops);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_officiants_search ON officiants
  USING gin(to_tsvector('english', first_name || ' ' || last_name || ' ' || municipality || ' ' || affiliation));

-- Geocoded municipalities cache table
CREATE TABLE IF NOT EXISTS municipalities (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_municipalities_name ON municipalities(name);

-- Sync metadata table (tracks when data was last synced)
CREATE TABLE IF NOT EXISTS sync_log (
  id SERIAL PRIMARY KEY,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  records_synced INTEGER,
  status TEXT NOT NULL DEFAULT 'running',
  error_message TEXT
);

-- Profile claims table (for officiants claiming their profiles)
CREATE TABLE IF NOT EXISTS profile_claims (
  id SERIAL PRIMARY KEY,
  officiant_id INTEGER REFERENCES officiants(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  phone TEXT,
  website TEXT,
  verification_code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verified_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
  status TEXT NOT NULL DEFAULT 'pending' -- pending, email_verified, approved, rejected
);

CREATE INDEX IF NOT EXISTS idx_profile_claims_officiant ON profile_claims(officiant_id);
CREATE INDEX IF NOT EXISTS idx_profile_claims_status ON profile_claims(status);

-- Row Level Security (RLS) Policies
ALTER TABLE officiants ENABLE ROW LEVEL SECURITY;
ALTER TABLE municipalities ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_claims ENABLE ROW LEVEL SECURITY;

-- Allow public read access to officiants
CREATE POLICY "Allow public read access to officiants" ON officiants
  FOR SELECT USING (true);

-- Allow public read access to municipalities
CREATE POLICY "Allow public read access to municipalities" ON municipalities
  FOR SELECT USING (true);

-- Only service role can insert/update officiants (for sync)
CREATE POLICY "Service role can manage officiants" ON officiants
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage municipalities" ON municipalities
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage sync_log" ON sync_log
  FOR ALL USING (auth.role() = 'service_role');

-- Allow public to insert claims (for submitting claim requests)
CREATE POLICY "Public can insert claims" ON profile_claims
  FOR INSERT WITH CHECK (true);

-- Allow public to read their own claim by verification code
CREATE POLICY "Public can read claims" ON profile_claims
  FOR SELECT USING (true);

-- Service role can manage all claims
CREATE POLICY "Service role can manage claims" ON profile_claims
  FOR ALL USING (auth.role() = 'service_role');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_officiants_updated_at
  BEFORE UPDATE ON officiants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION public.search_officiants_rpc(
  p_query text DEFAULT NULL,
  p_affiliation text DEFAULT NULL,
  p_municipality text DEFAULT NULL,
  p_lat double precision DEFAULT NULL,
  p_lng double precision DEFAULT NULL,
  p_radius integer DEFAULT NULL,
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0
)
RETURNS TABLE (
  id integer,
  first_name text,
  last_name text,
  municipality text,
  affiliation text,
  lat double precision,
  lng double precision,
  distance_km double precision
)
LANGUAGE sql
STABLE
AS $$
WITH inputs AS (
  SELECT
    NULLIF(trim(p_query), '') AS query_term,
    NULLIF(trim(p_affiliation), '') AS affiliation_term,
    NULLIF(trim(p_municipality), '') AS municipality_term
),
filtered AS (
  SELECT
    o.id,
    o.first_name,
    o.last_name,
    o.municipality,
    o.affiliation,
    o.lat,
    o.lng,
    CASE
      WHEN p_lat IS NOT NULL AND p_lng IS NOT NULL AND o.lat IS NOT NULL AND o.lng IS NOT NULL
        THEN earth_distance(ll_to_earth(p_lat, p_lng), ll_to_earth(o.lat, o.lng)) / 1000.0
      ELSE NULL
    END AS distance_km
  FROM officiants o
  CROSS JOIN inputs i
  WHERE (i.affiliation_term IS NULL OR lower(o.affiliation) ILIKE '%' || lower(i.affiliation_term) || '%')
    AND (i.municipality_term IS NULL OR lower(o.municipality) ILIKE '%' || lower(i.municipality_term) || '%')
    AND (
      i.query_term IS NULL OR
      lower(o.first_name || ' ' || o.last_name) ILIKE '%' || lower(i.query_term) || '%'
      OR lower(o.municipality) ILIKE '%' || lower(i.query_term) || '%'
    )
), radius_filtered AS (
  SELECT *
  FROM filtered
  WHERE p_radius IS NULL
    OR distance_km IS NULL
    OR distance_km <= p_radius
)
SELECT
  id,
  first_name,
  last_name,
  municipality,
  affiliation,
  lat,
  lng,
  distance_km
FROM radius_filtered
ORDER BY
  CASE WHEN distance_km IS NULL THEN 1 ELSE 0 END,
  distance_km NULLS LAST,
  last_name,
  first_name
LIMIT p_limit OFFSET p_offset;
$$;
