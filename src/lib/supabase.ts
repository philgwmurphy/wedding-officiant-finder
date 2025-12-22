import { createClient } from "@supabase/supabase-js";
import type { Officiant, OfficiantSearchResult, SearchParams } from "@/types/officiant";

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

type SearchOfficiantRpcRow = {
  id: number;
  first_name: string;
  last_name: string;
  municipality: string;
  affiliation: string;
  lat: number | null;
  lng: number | null;
  distance_km: number | null;
};

/**
 * Search officiants with optional location-based filtering
 */
export async function searchOfficiants(
  params: SearchParams
): Promise<OfficiantSearchResult[]> {
  const limit = params.limit || 50;
  const offset = params.offset || 0;

  const { data, error } = await supabase.rpc<SearchOfficiantRpcRow[]>(
    "search_officiants_rpc",
    {
      p_query: params.query ?? null,
      p_affiliation: params.affiliation ?? null,
      p_municipality: params.lat ? null : params.location ?? null,
      p_lat: params.lat ?? null,
      p_lng: params.lng ?? null,
      p_radius: params.radius ?? null,
      p_limit: limit,
      p_offset: offset,
    }
  );

  if (error) {
    console.error("Search error:", error);
    throw new Error(`Search failed: ${error.message}`);
  }

  return (data || []).map((row) => ({
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    municipality: row.municipality,
    affiliation: row.affiliation,
    lat: row.lat ?? undefined,
    lng: row.lng ?? undefined,
    distance: row.distance_km ?? undefined,
  }));
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
  const { data, error } = await supabase
    .from("officiants")
    .select("affiliation")
    .order("affiliation");

  if (error) {
    throw new Error(`Failed to get affiliations: ${error.message}`);
  }

  const unique = Array.from(new Set((data || []).map((d) => d.affiliation)));
  return unique.filter(Boolean);
}

/**
 * Get all unique municipalities for autocomplete
 */
export async function getMunicipalities(): Promise<string[]> {
  const { data, error } = await supabase
    .from("officiants")
    .select("municipality")
    .order("municipality");

  if (error) {
    throw new Error(`Failed to get municipalities: ${error.message}`);
  }

  const unique = Array.from(new Set((data || []).map((d) => d.municipality)));
  return unique.filter(Boolean);
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
