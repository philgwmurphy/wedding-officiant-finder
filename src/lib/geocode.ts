import type { GeocodedMunicipality } from "@/types/officiant";

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org/search";

// In-memory cache for geocoding results during sync operations
const geocodeCache = new Map<string, GeocodedMunicipality | null>();

/**
 * Geocode a municipality name to lat/lng using Nominatim (OpenStreetMap)
 * Adds ", Ontario, Canada" to improve accuracy
 */
export async function geocodeMunicipality(
  municipality: string
): Promise<GeocodedMunicipality | null> {
  // Check cache first
  const cacheKey = municipality.toLowerCase().trim();
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey) || null;
  }

  // Add Ontario context for better results
  const searchQuery = `${municipality}, Ontario, Canada`;

  const url = new URL(NOMINATIM_BASE);
  url.searchParams.set("q", searchQuery);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");
  url.searchParams.set("countrycodes", "ca");

  try {
    const response = await fetch(url.toString(), {
      headers: {
        // Nominatim requires a valid User-Agent
        "User-Agent": "WeddingOfficiantFinder/1.0 (contact@example.com)",
      },
    });

    if (!response.ok) {
      console.error(`Geocoding failed for ${municipality}: ${response.status}`);
      geocodeCache.set(cacheKey, null);
      return null;
    }

    const results = await response.json();

    if (results.length === 0) {
      console.warn(`No geocoding results for: ${municipality}`);
      geocodeCache.set(cacheKey, null);
      return null;
    }

    const result: GeocodedMunicipality = {
      name: municipality,
      lat: parseFloat(results[0].lat),
      lng: parseFloat(results[0].lon),
    };

    geocodeCache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error(`Geocoding error for ${municipality}:`, error);
    geocodeCache.set(cacheKey, null);
    return null;
  }
}

/**
 * Geocode multiple municipalities with rate limiting
 * Nominatim requires max 1 request per second
 */
export async function geocodeMunicipalities(
  municipalities: string[],
  onProgress?: (completed: number, total: number) => void
): Promise<Map<string, GeocodedMunicipality>> {
  const results = new Map<string, GeocodedMunicipality>();
  const uniqueMunicipalities = Array.from(new Set(municipalities));

  for (let i = 0; i < uniqueMunicipalities.length; i++) {
    const municipality = uniqueMunicipalities[i];
    const result = await geocodeMunicipality(municipality);

    if (result) {
      results.set(municipality.toLowerCase().trim(), result);
    }

    if (onProgress) {
      onProgress(i + 1, uniqueMunicipalities.length);
    }

    // Nominatim rate limit: 1 request per second
    if (i < uniqueMunicipalities.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1100));
    }
  }

  return results;
}

/**
 * Calculate distance between two points using Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Clear the geocoding cache
 */
export function clearGeocodeCache(): void {
  geocodeCache.clear();
}

/**
 * Get cache statistics
 */
export function getGeocodeStats(): { size: number; hits: number } {
  return {
    size: geocodeCache.size,
    hits: geocodeCache.size, // Simplified - actual hits would need counter
  };
}
