-- Migration: Ensure RLS is properly enabled on monetization tables
-- This migration addresses Supabase security warnings about RLS on:
-- public.subscriptions, public.premium_profiles, public.leads, public.featured_slots

-- ============================================================================
-- SUBSCRIPTIONS TABLE
-- ============================================================================

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access to subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Public can read active subscriptions" ON subscriptions;

CREATE POLICY "subscriptions_service_role_all" ON public.subscriptions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "subscriptions_authenticated_select" ON public.subscriptions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "subscriptions_anon_select" ON public.subscriptions
  FOR SELECT
  TO anon
  USING (status = 'active');

CREATE INDEX IF NOT EXISTS idx_subscriptions_officiant_id ON public.subscriptions(officiant_id);

-- ============================================================================
-- PREMIUM_PROFILES TABLE
-- ============================================================================

ALTER TABLE public.premium_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access to premium_profiles" ON premium_profiles;
DROP POLICY IF EXISTS "Public can read premium_profiles" ON premium_profiles;

CREATE POLICY "premium_profiles_service_role_all" ON public.premium_profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "premium_profiles_authenticated_select" ON public.premium_profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "premium_profiles_anon_select" ON public.premium_profiles
  FOR SELECT
  TO anon
  USING (true);

-- ============================================================================
-- LEADS TABLE
-- ============================================================================

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access to leads" ON leads;

-- Only service role can access leads (sensitive data)
CREATE POLICY "leads_service_role_all" ON public.leads
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- No anon or authenticated access to leads - they contain sensitive contact info
-- All lead operations go through API routes using service role

-- ============================================================================
-- FEATURED_SLOTS TABLE
-- ============================================================================

ALTER TABLE public.featured_slots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access to featured_slots" ON featured_slots;
DROP POLICY IF EXISTS "Public can read active featured_slots" ON featured_slots;
DROP POLICY IF EXISTS "featured_slots_authenticated_select" ON featured_slots;
DROP POLICY IF EXISTS "featured_slots_anon_select" ON featured_slots;

CREATE POLICY "featured_slots_service_role_all" ON public.featured_slots
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "featured_slots_authenticated_select" ON public.featured_slots
  FOR SELECT
  TO authenticated
  USING (ends_at > NOW());

CREATE POLICY "featured_slots_anon_select" ON public.featured_slots
  FOR SELECT
  TO anon
  USING (ends_at > NOW());
