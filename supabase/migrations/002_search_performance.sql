-- Enable required extensions for advanced search features
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS cube;
CREATE EXTENSION IF NOT EXISTS earthdistance;

-- Optimized trigram indexes for common text filters
CREATE INDEX IF NOT EXISTS idx_officiants_affiliation_trgm
  ON officiants USING gin (lower(affiliation) gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_officiants_municipality_trgm
  ON officiants USING gin (lower(municipality) gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_officiants_name_trgm
  ON officiants USING gin (lower(first_name || ' ' || last_name) gin_trgm_ops);

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
