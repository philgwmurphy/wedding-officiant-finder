import { createClient } from "@supabase/supabase-js";
import type { Officiant, OfficiantSearchResult, SearchParams } from "@/types/officiant";
import { calculateDistance } from "./geocode";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables:");
  console.error("  NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? "set" : "MISSING");
  console.error("  NEXT_PUBLIC_SUPABASE_ANON_KEY:", supabaseAnonKey ? "set" : "MISSING");
}

export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "");

// Database types matching our Supabase schema
export interface DbOfficiant {
  id: number;
  ontario_id: number;
  first_name: string;
  last_name: string;
  municipality: string;
  affiliation: string;
  lat: number | null;
  lng: number | null;
  created_at: string;
  updated_at: string;
}

export interface SearchResult {
  results: OfficiantSearchResult[];
  total: number;
}

/**
 * Search officiants with optional location-based filtering
 */
export async function searchOfficiants(
  params: SearchParams
): Promise<SearchResult> {
  const isRadiusSearch = params.lat && params.lng && params.radius;

  let query = supabase
    .from("officiants")
    .select("*", { count: "exact" })
    .order("last_name", { ascending: true });

  // Filter by affiliation if provided
  if (params.affiliation) {
    query = query.ilike("affiliation", `%${params.affiliation}%`);
  }

  // Full-text search on name
  if (params.query) {
    query = query.or(
      `first_name.ilike.%${params.query}%,last_name.ilike.%${params.query}%,municipality.ilike.%${params.query}%`
    );
  }

  // Filter by municipality if location is a direct match (and not doing radius search)
  if (params.location && !params.lat) {
    query = query.ilike("municipality", `%${params.location}%`);
  }

  // For radius-based searches, we need to fetch all results first,
  // then filter by distance. For non-radius searches, apply pagination.
  if (!isRadiusSearch) {
    const limit = params.limit || 50;
    const offset = params.offset || 0;
    query = query.range(offset, offset + limit - 1);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("Search error:", error);
    throw new Error(`Search failed: ${error.message}`);
  }

  let results: OfficiantSearchResult[] = (data || []).map(dbToOfficiant);
  let total = count || 0;

  // If we have coordinates, calculate distances and filter by radius
  if (params.lat && params.lng) {
    results = results
      .map((officiant) => {
        if (officiant.lat && officiant.lng) {
          return {
            ...officiant,
            distance: calculateDistance(
              params.lat!,
              params.lng!,
              officiant.lat,
              officiant.lng
            ),
          };
        }
        return officiant;
      })
      .filter((officiant) => {
        // For radius searches, only include officiants with valid coordinates
        // that are within the specified radius
        if (params.radius) {
          return officiant.distance !== undefined && officiant.distance <= params.radius;
        }
        return true;
      })
      .sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));

    // For radius searches, the total is the filtered count
    if (isRadiusSearch) {
      total = results.length;
      const limit = params.limit || 50;
      const offset = params.offset || 0;
      results = results.slice(offset, offset + limit);
    }
  }

  return { results, total };
}

/**
 * Get a single officiant by ID
 */
export async function getOfficiantById(id: number): Promise<Officiant | null> {
  const { data, error } = await supabase
    .from("officiants")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null; // Not found
    }
    throw new Error(`Failed to get officiant: ${error.message}`);
  }

  return dbToOfficiant(data);
}

/**
 * Get all unique affiliations for filter UI
 */
export async function getAffiliations(): Promise<string[]> {
  return getCachedList({
    cacheTable: "cached_affiliations",
    column: "affiliation",
    fallback: getAffiliationsFromOfficiants,
  });
}

/**
 * Get all unique municipalities for autocomplete
 */
export async function getMunicipalities(): Promise<string[]> {
  return getCachedList({
    cacheTable: "cached_municipalities",
    column: "municipality",
    fallback: getMunicipalitiesFromOfficiants,
  });
}

/**
 * Upsert officiants (for sync operations)
 */
export async function upsertOfficiants(
  officiants: Officiant[]
): Promise<{ inserted: number; updated: number }> {
  const records = officiants.map((o) => ({
    ontario_id: o.id,
    first_name: o.firstName,
    last_name: o.lastName,
    municipality: o.municipality,
    affiliation: o.affiliation,
    lat: o.lat || null,
    lng: o.lng || null,
    updated_at: new Date().toISOString(),
  }));

  // Batch upsert in chunks
  const chunkSize = 500;
  let totalInserted = 0;

  for (let i = 0; i < records.length; i += chunkSize) {
    const chunk = records.slice(i, i + chunkSize);
    const { error } = await supabase
      .from("officiants")
      .upsert(chunk, { onConflict: "ontario_id" });

    if (error) {
      throw new Error(`Upsert failed: ${error.message}`);
    }
    totalInserted += chunk.length;
  }

  return { inserted: totalInserted, updated: 0 };
}

/**
 * Get total officiant count
 */
export async function getOfficiantCount(): Promise<number> {
  const { count, error } = await supabase
    .from("officiants")
    .select("*", { count: "exact", head: true });

  if (error) {
    throw new Error(`Count failed: ${error.message}`);
  }

  return count || 0;
}

/**
 * Get approved claim for an officiant (includes contact info)
 */
export async function getApprovedClaim(officiantId: number): Promise<{
  email: string;
  phone?: string;
  website?: string;
} | null> {
  const { data, error } = await supabase
    .from("profile_claims")
    .select("email, phone, website")
    .eq("officiant_id", officiantId)
    .eq("status", "approved")
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null; // Not found
    }
    // Log but don't throw - treat as not found
    console.error("Error fetching claim:", error);
    return null;
  }

  return {
    email: data.email,
    phone: data.phone || undefined,
    website: data.website || undefined,
  };
}

/**
 * Convert database record to Officiant type
 */
function dbToOfficiant(record: DbOfficiant): Officiant {
  return {
    id: record.id,
    firstName: record.first_name,
    lastName: record.last_name,
    municipality: record.municipality,
    affiliation: record.affiliation,
    lat: record.lat || undefined,
    lng: record.lng || undefined,
  };
}

interface CachedListConfig {
  cacheTable: string;
  column: string;
  fallback: () => Promise<string[]>;
}

async function getCachedList({
  cacheTable,
  column,
  fallback,
}: CachedListConfig): Promise<string[]> {
  const { data, error } = await supabase
    .from(cacheTable)
    .select(column)
    .order(column);

  if (error) {
    console.warn(`Falling back to live ${column} query:`, error.message);
    return fallback();
  }

  if (!Array.isArray(data)) {
    return fallback();
  }

  const rows = data as Array<Record<string, string | null> | { error: true }>;

  const cachedRecords = rows.filter(
    (record): record is Record<string, string | null> =>
      record !== null && typeof record === "object" && !("error" in record)
  );

  const cachedValues = cachedRecords
    .map((record) => record[column])
    .filter((value): value is string => Boolean(value));

  if (cachedValues.length === 0) {
    return fallback();
  }

  return cachedValues;
}

async function getAffiliationsFromOfficiants(): Promise<string[]> {
  const { data, error } = await supabase
    .from("officiants")
    .select("affiliation")
    .order("affiliation");

  if (error) {
    throw new Error(`Failed to get affiliations: ${error.message}`);
  }

  return getUniqueStrings(data, "affiliation");
}

async function getMunicipalitiesFromOfficiants(): Promise<string[]> {
  const { data, error } = await supabase
    .from("officiants")
    .select("municipality")
    .order("municipality");

  if (error) {
    throw new Error(`Failed to get municipalities: ${error.message}`);
  }

  return getUniqueStrings(data, "municipality");
}

function getUniqueStrings(
  records: { [key: string]: string | null }[] | null,
  column: string
): string[] {
  const unique = new Set<string>();

  (records || []).forEach((record) => {
    const value = record[column];
    if (value) {
      unique.add(value);
    }
  });

  return Array.from(unique);
}
