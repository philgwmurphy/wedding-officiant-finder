/**
 * Sync Officiants Script
 *
 * Fetches all officiants from Ontario Data Catalogue,
 * geocodes municipalities, and stores in Supabase.
 *
 * Usage: npx tsx scripts/sync-officiants.ts
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";

const ONTARIO_API_BASE = "https://data.ontario.ca/api/3/action/datastore_search";
const RESOURCE_ID = "e010f610-c3d6-4f88-849b-6f8c11e98d9c";
const PAGE_SIZE = 1000; // Fetch 1000 records per request
const NOMINATIM_BASE = "https://nominatim.openstreetmap.org/search";

// Types
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

// Initialize Supabase with service role key for write access
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase environment variables");
  console.error("Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Geocoding cache
const geocodeCache = new Map<string, { lat: number; lng: number } | null>();

async function main() {
  console.log("🚀 Starting officiant sync...\n");

  // Log sync start
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
    console.log("📥 Fetching officiants from Ontario Data Catalogue...");
    const officiants = await fetchAllOfficiants();
    console.log(`   Found ${officiants.length} officiants\n`);

    // Step 2: Get unique municipalities
    const municipalities = Array.from(new Set(officiants.map((o) => o.municipality)));
    console.log(`📍 Found ${municipalities.length} unique municipalities\n`);

    // Step 3: Load existing geocoded municipalities from DB
    console.log("🗺️  Loading cached geocoding data...");
    await loadGeocodeCacheFromDb();
    console.log(`   Loaded ${geocodeCache.size} cached municipalities\n`);

    // Step 4: Geocode new municipalities
    const uncached = municipalities.filter(
      (m) => !geocodeCache.has(m.toLowerCase().trim())
    );

    if (uncached.length > 0) {
      console.log(`🌐 Geocoding ${uncached.length} new municipalities...`);
      console.log("   (Rate limited to 1 request/second for Nominatim)\n");
      await geocodeNewMunicipalities(uncached);
    } else {
      console.log("✅ All municipalities already geocoded\n");
    }

    // Step 5: Attach coordinates to officiants
    console.log("📌 Attaching coordinates to officiants...");
    const officiantsWithCoords = officiants.map((o) => {
      const coords = geocodeCache.get(o.municipality.toLowerCase().trim());
      return {
        ...o,
        lat: coords?.lat || null,
        lng: coords?.lng || null,
      };
    });

    const withCoords = officiantsWithCoords.filter((o) => o.lat !== null).length;
    console.log(`   ${withCoords}/${officiants.length} have coordinates\n`);

    // Step 6: Upsert to database
    console.log("💾 Saving to database...");
    await upsertOfficiants(officiantsWithCoords);
    console.log("   Done!\n");

    // Update sync log
    if (syncLog) {
      await supabase
        .from("sync_log")
        .update({
          completed_at: new Date().toISOString(),
          records_synced: officiants.length,
          status: "completed",
        })
        .eq("id", syncLog.id);
    }

    console.log("✅ Sync completed successfully!");
    console.log(`   Total officiants: ${officiants.length}`);
    console.log(`   Geocoded: ${withCoords}`);

  } catch (error) {
    console.error("❌ Sync failed:", error);

    if (syncLog) {
      await supabase
        .from("sync_log")
        .update({
          completed_at: new Date().toISOString(),
          status: "failed",
          error_message: error instanceof Error ? error.message : String(error),
        })
        .eq("id", syncLog.id);
    }

    process.exit(1);
  }
}

async function fetchAllOfficiants(): Promise<Officiant[]> {
  const allOfficiants: Officiant[] = [];
  let offset = 0;
  let total = 0;

  // First request to get total count
  const firstPage = await fetchPage(0);
  total = firstPage.total;
  allOfficiants.push(...firstPage.records.map(normalizeRecord));

  process.stdout.write(`   Progress: ${allOfficiants.length}/${total}`);

  // Fetch remaining pages
  offset = PAGE_SIZE;
  while (offset < total) {
    const page = await fetchPage(offset);
    allOfficiants.push(...page.records.map(normalizeRecord));

    process.stdout.write(`\r   Progress: ${allOfficiants.length}/${total}`);

    offset += PAGE_SIZE;
  }

  process.stdout.write("\n");
  return allOfficiants;
}

async function fetchPage(offset: number): Promise<{ records: OntarioApiRecord[]; total: number }> {
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

async function loadGeocodeCacheFromDb(): Promise<void> {
  const { data, error } = await supabase.from("municipalities").select("*");

  if (error) {
    console.warn("   Could not load municipalities cache:", error.message);
    return;
  }

  for (const row of data || []) {
    geocodeCache.set(row.name.toLowerCase().trim(), {
      lat: row.lat,
      lng: row.lng,
    });
  }
}

async function geocodeNewMunicipalities(municipalities: string[]): Promise<void> {
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

    process.stdout.write(
      `\r   Progress: ${i + 1}/${municipalities.length} (${municipality})`
    );

    // Rate limit: 1 request per second for Nominatim (their minimum requirement)
    if (i < municipalities.length - 1) {
      await sleep(1000);
    }
  }
  process.stdout.write("\n");
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
        "User-Agent": "WeddingOfficiantFinder/1.0 (github.com/wedding-officiant-finder)",
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

async function upsertOfficiants(officiants: Officiant[]): Promise<void> {
  const chunkSize = 500;

  for (let i = 0; i < officiants.length; i += chunkSize) {
    const chunk = officiants.slice(i, i + chunkSize);

    const { error } = await supabase
      .from("officiants")
      .upsert(
        chunk.map((o) => ({
          ...o,
          updated_at: new Date().toISOString(),
        })),
        { onConflict: "ontario_id" }
      );

    if (error) {
      throw new Error(`Upsert failed: ${error.message}`);
    }

    process.stdout.write(`\r   Progress: ${Math.min(i + chunkSize, officiants.length)}/${officiants.length}`);
  }
  process.stdout.write("\n");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Run
main();
