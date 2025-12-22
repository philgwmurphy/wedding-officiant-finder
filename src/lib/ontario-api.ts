import type { OntarioApiResponse, OntarioApiRecord, Officiant } from "@/types/officiant";

const ONTARIO_API_BASE = "https://data.ontario.ca/api/3/action/datastore_search";
const RESOURCE_ID = "e010f610-c3d6-4f88-849b-6f8c11e98d9c";
const PAGE_SIZE = 100;

/**
 * Fetch a single page of officiants from the Ontario Data Catalogue
 */
export async function fetchOfficiantsPage(
  offset: number = 0,
  limit: number = PAGE_SIZE
): Promise<OntarioApiResponse> {
  const url = new URL(ONTARIO_API_BASE);
  url.searchParams.set("resource_id", RESOURCE_ID);
  url.searchParams.set("limit", limit.toString());
  url.searchParams.set("offset", offset.toString());

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`Ontario API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch all officiants from the Ontario Data Catalogue
 * Handles pagination automatically
 */
export async function fetchAllOfficiants(
  onProgress?: (fetched: number, total: number) => void
): Promise<Officiant[]> {
  const allOfficiants: Officiant[] = [];
  let offset = 0;
  let total = 0;

  // First request to get total count
  const firstPage = await fetchOfficiantsPage(0, PAGE_SIZE);
  total = firstPage.result.total;

  const records = firstPage.result.records;
  allOfficiants.push(...records.map(normalizeRecord));

  if (onProgress) {
    onProgress(allOfficiants.length, total);
  }

  // Fetch remaining pages
  offset = PAGE_SIZE;
  while (offset < total) {
    const page = await fetchOfficiantsPage(offset, PAGE_SIZE);
    allOfficiants.push(...page.result.records.map(normalizeRecord));

    if (onProgress) {
      onProgress(allOfficiants.length, total);
    }

    offset += PAGE_SIZE;

    // Small delay to be respectful to the API
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  return allOfficiants;
}

/**
 * Search officiants using the Ontario API's built-in search
 * (Limited - no geospatial, but useful for quick lookups)
 */
export async function searchOntarioApi(
  query?: string,
  filters?: Record<string, string>,
  limit: number = 100
): Promise<Officiant[]> {
  const url = new URL(ONTARIO_API_BASE);
  url.searchParams.set("resource_id", RESOURCE_ID);
  url.searchParams.set("limit", limit.toString());

  if (query) {
    url.searchParams.set("q", query);
  }

  if (filters) {
    url.searchParams.set("filters", JSON.stringify(filters));
  }

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`Ontario API error: ${response.status} ${response.statusText}`);
  }

  const data: OntarioApiResponse = await response.json();
  return data.result.records.map(normalizeRecord);
}

/**
 * Get unique municipalities from the Ontario API
 */
export async function getUniqueMunicipalities(): Promise<string[]> {
  const officiants = await fetchAllOfficiants();
  const municipalities = new Set(officiants.map((o) => o.municipality));
  return Array.from(municipalities).sort();
}

/**
 * Normalize a raw API record to our Officiant type
 */
function normalizeRecord(record: OntarioApiRecord): Officiant {
  return {
    id: record._id,
    firstName: record["First Name"]?.trim() || "",
    lastName: record["Last Name"]?.trim() || "",
    municipality: record.Municipality?.trim() || "",
    affiliation: record.Affiliation?.trim() || "",
  };
}

/**
 * Get the total count of officiants without fetching all data
 */
export async function getOfficiantCount(): Promise<number> {
  const response = await fetchOfficiantsPage(0, 1);
  return response.result.total;
}
