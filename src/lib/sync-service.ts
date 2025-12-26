/**
 * Sync Service
 *
 * Provides functions to sync officiants from Ontario Data Catalogue to Supabase.
 * Can be called from API routes or scripts.
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";

const ONTARIO_API_BASE = "https://data.ontario.ca/api/3/action/datastore_search";
const RESOURCE_ID = "e010f610-c3d6-4f88-849b-6f8c11e98d9c";
const PAGE_SIZE = 1000;
const NOMINATIM_BASE = "https://nominatim.openstreetmap.org/search";

interface OntarioApiRecord {
  _id: number;
  Municipality: string;
  "Last Name": string;
  "First Name": string;
  Affiliation: string;
}

interface Officiant {
  ontario_id: number;
  first_name: string;
  last_name: string;
  municipality: string;
  affiliation: string;
  lat: number | null;
  lng: number | null;
}

interface SyncResult {
  success: boolean;
  totalFetched: number;
  totalInserted: number;
  totalUpdated: number;
  geocodedCount: number;
  error?: string;
  duration: number;
}

// In-memory geocoding cache for the current sync run
const geocodeCache = new Map<string, { lat: number; lng: number } | null>();

function getSupabaseClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Missing Supabase environment variables");
  }

  return createClient(url, key);
}

async function fetchPage(
  offset: number
): Promise<{ records: OntarioApiRecord[]; total: number }> {
  const url = new URL(ONTARIO_API_BASE);
  url.searchParams.set("resource_id", RESOURCE_ID);
  url.searchParams.set("limit", PAGE_SIZE.toString());
  url.searchParams.set("offset", offset.toString());

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Ontario API error: ${response.status}`);
  }

  const data = await response.json();
  return {
    records: data.result.records,
    total: data.result.total,
  };
}

function normalizeRecord(record: OntarioApiRecord): Officiant {
  return {
    ontario_id: record._id,
    first_name: record["First Name"]?.trim() || "",
    last_name: record["Last Name"]?.trim() || "",
    municipality: record.Municipality?.trim() || "",
    affiliation: record.Affiliation?.trim() || "",
    lat: null,
    lng: null,
  };
}

async function fetchAllOfficiants(): Promise<Officiant[]> {
  const allOfficiants: Officiant[] = [];
  let offset = 0;

  // First request to get total count
  const firstPage = await fetchPage(0);
  const total = firstPage.total;
  allOfficiants.push(...firstPage.records.map(normalizeRecord));

  // Fetch remaining pages
  offset = PAGE_SIZE;
  while (offset < total) {
    const page = await fetchPage(offset);
    allOfficiants.push(...page.records.map(normalizeRecord));
    offset += PAGE_SIZE;
  }

  return allOfficiants;
}

async function loadGeocodeCacheFromDb(supabase: SupabaseClient): Promise<void> {
  const { data, error } = await supabase.from("municipalities").select("*");

  if (error) {
    console.warn("Could not load municipalities cache:", error.message);
    return;
  }

  geocodeCache.clear();
  for (const row of data || []) {
    geocodeCache.set(row.name.toLowerCase().trim(), {
      lat: row.lat,
      lng: row.lng,
    });
  }
}

async function geocodeMunicipality(
  municipality: string
): Promise<{ lat: number; lng: number } | null> {
  const searchQuery = `${municipality}, Ontario, Canada`;

  const url = new URL(NOMINATIM_BASE);
  url.searchParams.set("q", searchQuery);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");
  url.searchParams.set("countrycodes", "ca");

  try {
    const response = await fetch(url.toString(), {
      headers: {
        "User-Agent":
          "WeddingOfficiantFinder/1.0 (github.com/wedding-officiant-finder)",
      },
    });

    if (!response.ok) {
      return null;
    }

    const results = await response.json();
    if (results.length === 0) {
      return null;
    }

    return {
      lat: parseFloat(results[0].lat),
      lng: parseFloat(results[0].lon),
    };
  } catch {
    return null;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function geocodeNewMunicipalities(
  municipalities: string[],
  supabase: SupabaseClient
): Promise<void> {
  for (let i = 0; i < municipalities.length; i++) {
    const municipality = municipalities[i];
    const coords = await geocodeMunicipality(municipality);

    if (coords) {
      geocodeCache.set(municipality.toLowerCase().trim(), coords);

      // Save to database for future runs
      await supabase.from("municipalities").upsert({
        name: municipality.toLowerCase().trim(),
        lat: coords.lat,
        lng: coords.lng,
      });
    }

    // Rate limit: 1 request per second for Nominatim
    if (i < municipalities.length - 1) {
      await sleep(1000);
    }
  }
}

async function upsertOfficiants(
  officiants: Officiant[],
  supabase: SupabaseClient
): Promise<{ inserted: number; updated: number }> {
  const chunkSize = 500;
  let totalInserted = 0;
  let totalUpdated = 0;

  // Get existing ontario_ids
  const { data: existingData } = await supabase
    .from("officiants")
    .select("ontario_id");

  const existingIds = new Set((existingData || []).map((r) => r.ontario_id));

  for (let i = 0; i < officiants.length; i += chunkSize) {
    const chunk = officiants.slice(i, i + chunkSize);

    // Count new vs existing
    for (const o of chunk) {
      if (existingIds.has(o.ontario_id)) {
        totalUpdated++;
      } else {
        totalInserted++;
      }
    }

    const { error } = await supabase.from("officiants").upsert(
      chunk.map((o) => ({
        ...o,
        updated_at: new Date().toISOString(),
      })),
      { onConflict: "ontario_id" }
    );

    if (error) {
      throw new Error(`Upsert failed: ${error.message}`);
    }
  }

  return { inserted: totalInserted, updated: totalUpdated };
}

/**
 * Run the full sync process
 */
export async function runSync(): Promise<SyncResult> {
  const startTime = Date.now();
  const supabase = getSupabaseClient();

  // Create sync log entry
  const { data: syncLog, error: syncLogError } = await supabase
    .from("sync_log")
    .insert({ started_at: new Date().toISOString(), status: "running" })
    .select()
    .single();

  if (syncLogError) {
    console.warn("Could not create sync log:", syncLogError.message);
  }

  try {
    // Step 1: Fetch all officiants from Ontario API
    const officiants = await fetchAllOfficiants();

    // Step 2: Get unique municipalities
    const municipalities = Array.from(
      new Set(officiants.map((o) => o.municipality))
    );

    // Step 3: Load existing geocoded municipalities from DB
    await loadGeocodeCacheFromDb(supabase);

    // Step 4: Geocode new municipalities
    const uncached = municipalities.filter(
      (m) => !geocodeCache.has(m.toLowerCase().trim())
    );

    if (uncached.length > 0) {
      await geocodeNewMunicipalities(uncached, supabase);
    }

    // Step 5: Attach coordinates to officiants
    const officiantsWithCoords = officiants.map((o) => {
      const coords = geocodeCache.get(o.municipality.toLowerCase().trim());
      return {
        ...o,
        lat: coords?.lat || null,
        lng: coords?.lng || null,
      };
    });

    const geocodedCount = officiantsWithCoords.filter(
      (o) => o.lat !== null
    ).length;

    // Step 6: Upsert to database
    const { inserted, updated } = await upsertOfficiants(
      officiantsWithCoords,
      supabase
    );

    // Update sync log
    if (syncLog) {
      await supabase
        .from("sync_log")
        .update({
          completed_at: new Date().toISOString(),
          total_fetched: officiants.length,
          total_inserted: inserted,
          total_updated: updated,
          status: "completed",
        })
        .eq("id", syncLog.id);
    }

    // Also update the cached counts
    await updateCachedData(supabase);

    return {
      success: true,
      totalFetched: officiants.length,
      totalInserted: inserted,
      totalUpdated: updated,
      geocodedCount,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (syncLog) {
      await supabase
        .from("sync_log")
        .update({
          completed_at: new Date().toISOString(),
          status: "failed",
          error_message: errorMessage,
        })
        .eq("id", syncLog.id);
    }

    return {
      success: false,
      totalFetched: 0,
      totalInserted: 0,
      totalUpdated: 0,
      geocodedCount: 0,
      error: errorMessage,
      duration: Date.now() - startTime,
    };
  }
}

/**
 * Update cached affiliations and municipalities tables
 */
async function updateCachedData(supabase: SupabaseClient): Promise<void> {
  try {
    // Get unique affiliations
    const { data: affiliations } = await supabase
      .from("officiants")
      .select("affiliation")
      .not("affiliation", "is", null);

    if (affiliations) {
      const uniqueAffiliations = Array.from(
        new Set(affiliations.map((a) => a.affiliation).filter(Boolean))
      );

      // Clear and repopulate cached_affiliations
      await supabase.from("cached_affiliations").delete().neq("id", 0);
      if (uniqueAffiliations.length > 0) {
        await supabase
          .from("cached_affiliations")
          .insert(uniqueAffiliations.map((name) => ({ name })));
      }
    }

    // Get unique municipalities from officiants
    const { data: municipalitiesData } = await supabase
      .from("officiants")
      .select("municipality")
      .not("municipality", "is", null);

    if (municipalitiesData) {
      const uniqueMunicipalities = Array.from(
        new Set(municipalitiesData.map((m) => m.municipality).filter(Boolean))
      );

      // Clear and repopulate cached_municipalities
      await supabase.from("cached_municipalities").delete().neq("id", 0);
      if (uniqueMunicipalities.length > 0) {
        await supabase
          .from("cached_municipalities")
          .insert(uniqueMunicipalities.map((name) => ({ name })));
      }
    }
  } catch (error) {
    console.error("Error updating cached data:", error);
  }
}

/**
 * Check if a sync is currently running
 * Considers syncs running for more than 10 minutes as stale
 */
export async function isSyncRunning(): Promise<boolean> {
  const supabase = getSupabaseClient();
  const STALE_THRESHOLD_MS = 10 * 60 * 1000; // 10 minutes

  const { data } = await supabase
    .from("sync_log")
    .select("id, status, started_at")
    .eq("status", "running")
    .order("started_at", { ascending: false })
    .limit(1);

  if (!data || data.length === 0) {
    return false;
  }

  const runningSync = data[0];
  const startedAt = new Date(runningSync.started_at).getTime();
  const now = Date.now();

  // If sync has been running for more than 10 minutes, mark it as stale/failed
  if (now - startedAt > STALE_THRESHOLD_MS) {
    await supabase
      .from("sync_log")
      .update({
        status: "failed",
        completed_at: new Date().toISOString(),
        error_message: "Sync timed out (exceeded 10 minutes)",
      })
      .eq("id", runningSync.id);

    return false;
  }

  return true;
}
