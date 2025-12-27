-- Migration: Fix RLS policy performance warnings
-- This migration addresses:
-- 1. auth_rls_initplan - Replace auth.role() with explicit TO <role> targeting
-- 2. multiple_permissive_policies - Remove overlapping policies

-- ============================================================================
-- OFFICIANTS TABLE
-- ============================================================================

-- Drop old policies
DROP POLICY IF EXISTS "Allow public read access to officiants" ON officiants;
DROP POLICY IF EXISTS "Allow public read" ON officiants;
DROP POLICY IF EXISTS "Service role can manage officiants" ON officiants;
DROP POLICY IF EXISTS "Service write" ON officiants;

-- New policies with explicit role targeting
CREATE POLICY "officiants_anon_select" ON public.officiants
  FOR SELECT TO anon USING (true);

CREATE POLICY "officiants_authenticated_select" ON public.officiants
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "officiants_service_role_all" ON public.officiants
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ============================================================================
-- MUNICIPALITIES TABLE
-- ============================================================================

-- Drop old policies
DROP POLICY IF EXISTS "Allow public read access to municipalities" ON municipalities;
DROP POLICY IF EXISTS "Allow public read" ON municipalities;
DROP POLICY IF EXISTS "Service role can manage municipalities" ON municipalities;
DROP POLICY IF EXISTS "Service write" ON municipalities;

-- New policies with explicit role targeting
CREATE POLICY "municipalities_anon_select" ON public.municipalities
  FOR SELECT TO anon USING (true);

CREATE POLICY "municipalities_authenticated_select" ON public.municipalities
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "municipalities_service_role_all" ON public.municipalities
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ============================================================================
-- SYNC_LOG TABLE
-- ============================================================================

-- Drop old policies
DROP POLICY IF EXISTS "Service role can manage sync_log" ON sync_log;
DROP POLICY IF EXISTS "Service write" ON sync_log;

-- New policy with explicit role targeting (only service role needs access)
CREATE POLICY "sync_log_service_role_all" ON public.sync_log
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ============================================================================
-- PROFILE_CLAIMS TABLE
-- ============================================================================

-- Drop old policies
DROP POLICY IF EXISTS "Public can insert claims" ON profile_claims;
DROP POLICY IF EXISTS "Public can read claims" ON profile_claims;
DROP POLICY IF EXISTS "Service role can manage claims" ON profile_claims;

-- New policies with explicit role targeting
CREATE POLICY "profile_claims_anon_select" ON public.profile_claims
  FOR SELECT TO anon USING (true);

CREATE POLICY "profile_claims_anon_insert" ON public.profile_claims
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "profile_claims_authenticated_select" ON public.profile_claims
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "profile_claims_authenticated_insert" ON public.profile_claims
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "profile_claims_service_role_all" ON public.profile_claims
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ============================================================================
-- CACHED_AFFILIATIONS TABLE
-- ============================================================================

-- Drop old policies
DROP POLICY IF EXISTS "Public can read cached_affiliations" ON cached_affiliations;
DROP POLICY IF EXISTS "Service role can manage cached_affiliations" ON cached_affiliations;

-- New policies with explicit role targeting
CREATE POLICY "cached_affiliations_anon_select" ON public.cached_affiliations
  FOR SELECT TO anon USING (true);

CREATE POLICY "cached_affiliations_authenticated_select" ON public.cached_affiliations
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "cached_affiliations_service_role_all" ON public.cached_affiliations
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ============================================================================
-- CACHED_MUNICIPALITIES TABLE
-- ============================================================================

-- Drop old policies
DROP POLICY IF EXISTS "Public can read cached_municipalities" ON cached_municipalities;
DROP POLICY IF EXISTS "Service role can manage cached_municipalities" ON cached_municipalities;

-- New policies with explicit role targeting
CREATE POLICY "cached_municipalities_anon_select" ON public.cached_municipalities
  FOR SELECT TO anon USING (true);

CREATE POLICY "cached_municipalities_authenticated_select" ON public.cached_municipalities
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "cached_municipalities_service_role_all" ON public.cached_municipalities
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);
