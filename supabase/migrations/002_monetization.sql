-- Monetization tables for premium profiles, featured listings, and lead generation

-- Subscription tiers and billing
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  officiant_id INTEGER REFERENCES officiants(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'premium', 'featured')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT UNIQUE,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(officiant_id)
);

-- Enhanced profile data (premium feature)
CREATE TABLE IF NOT EXISTS premium_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  officiant_id INTEGER REFERENCES officiants(id) ON DELETE CASCADE UNIQUE,
  bio TEXT,
  photo_url TEXT,
  services TEXT[] DEFAULT '{}',
  languages TEXT[] DEFAULT '{English}',
  price_range TEXT,
  years_experience INTEGER,
  ceremony_types TEXT[] DEFAULT '{}',
  travel_radius INTEGER,
  highlight_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lead tracking
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  officiant_id INTEGER REFERENCES officiants(id) ON DELETE CASCADE,
  couple_name TEXT NOT NULL,
  couple_email TEXT NOT NULL,
  couple_phone TEXT,
  wedding_date DATE,
  wedding_location TEXT,
  message TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'viewed', 'contacted', 'booked', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Featured listing slots
CREATE TABLE IF NOT EXISTS featured_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  officiant_id INTEGER REFERENCES officiants(id) ON DELETE CASCADE,
  slot_type TEXT NOT NULL CHECK (slot_type IN ('search_top', 'homepage', 'category')),
  municipality TEXT,
  affiliation TEXT,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_officiant ON subscriptions(officiant_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_premium_profiles_officiant ON premium_profiles(officiant_id);
CREATE INDEX IF NOT EXISTS idx_leads_officiant ON leads(officiant_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_featured_slots_active ON featured_slots(is_active, ends_at);
CREATE INDEX IF NOT EXISTS idx_featured_slots_municipality ON featured_slots(municipality) WHERE municipality IS NOT NULL;

-- Row Level Security
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE premium_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE featured_slots ENABLE ROW LEVEL SECURITY;

-- Policies for subscriptions (service role can do everything, anon can read active)
CREATE POLICY "Service role full access to subscriptions" ON subscriptions
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Public can read active subscriptions" ON subscriptions
  FOR SELECT USING (status = 'active');

-- Policies for premium_profiles
CREATE POLICY "Service role full access to premium_profiles" ON premium_profiles
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Public can read premium_profiles" ON premium_profiles
  FOR SELECT USING (true);

-- Policies for leads (only service role)
CREATE POLICY "Service role full access to leads" ON leads
  FOR ALL USING (auth.role() = 'service_role');

-- Policies for featured_slots
CREATE POLICY "Service role full access to featured_slots" ON featured_slots
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Public can read active featured_slots" ON featured_slots
  FOR SELECT USING (is_active = true AND ends_at > NOW());

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_premium_profiles_updated_at ON premium_profiles;
CREATE TRIGGER update_premium_profiles_updated_at
  BEFORE UPDATE ON premium_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Dashboard sessions for passwordless login
CREATE TABLE IF NOT EXISTS dashboard_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dashboard_sessions_email ON dashboard_sessions(email);
CREATE INDEX IF NOT EXISTS idx_dashboard_sessions_expires ON dashboard_sessions(expires_at);

ALTER TABLE dashboard_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access to dashboard_sessions" ON dashboard_sessions
  FOR ALL USING (auth.role() = 'service_role');
