-- Migration: Add Profile Claims
-- Run this in Supabase SQL Editor to add claiming functionality

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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_profile_claims_officiant ON profile_claims(officiant_id);
CREATE INDEX IF NOT EXISTS idx_profile_claims_status ON profile_claims(status);

-- Enable RLS
ALTER TABLE profile_claims ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public can insert claims" ON profile_claims
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can read claims" ON profile_claims
  FOR SELECT USING (true);

CREATE POLICY "Service role can manage claims" ON profile_claims
  FOR ALL USING (auth.role() = 'service_role');
