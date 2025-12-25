import { NextRequest, NextResponse } from "next/server";
import { searchOfficiants } from "@/lib/supabase";
import { geocodeMunicipality, geocodePostalCode } from "@/lib/geocode";
import type { SearchParams } from "@/types/officiant";

const POSTAL_CODE_REGEX = /^[A-Za-z]\d[A-Za-z][ ]?\d[A-Za-z]\d$/i;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const params: SearchParams = {
      location: searchParams.get("location") || undefined,
      affiliation: searchParams.get("affiliation") || undefined,
      query: searchParams.get("q") || undefined,
      radius: searchParams.get("radius")
        ? parseInt(searchParams.get("radius")!)
        : 50, // Default 50km
      limit: searchParams.get("limit")
        ? parseInt(searchParams.get("limit")!)
        : 50,
      offset: searchParams.get("offset")
        ? parseInt(searchParams.get("offset")!)
        : 0,
    };

    // Check for direct lat/lng parameters (from geolocation)
    const directLat = searchParams.get("lat");
    const directLng = searchParams.get("lng");

    if (directLat && directLng) {
      params.lat = parseFloat(directLat);
      params.lng = parseFloat(directLng);
    }

    // If location is provided and no direct coords, try to geocode it
    const rawLocation = params.location?.trim();
    params.location = rawLocation;

    if (rawLocation && !params.lat && !params.lng) {
      if (POSTAL_CODE_REGEX.test(rawLocation)) {
        const geocodedPostal = await geocodePostalCode(rawLocation);
        if (geocodedPostal) {
          params.lat = geocodedPostal.lat;
          params.lng = geocodedPostal.lng;
        }
      } else {
        const geocodedMunicipality = await geocodeMunicipality(rawLocation);
        if (geocodedMunicipality) {
          params.lat = geocodedMunicipality.lat;
          params.lng = geocodedMunicipality.lng;
        }
      }
    }

    const results = await searchOfficiants(params);

    return NextResponse.json({
      success: true,
      results,
      count: results.length,
      params: {
        location: params.location,
        lat: params.lat,
        lng: params.lng,
        radius: params.radius,
        affiliation: params.affiliation,
      },
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Search failed",
      },
      { status: 500 }
    );
  }
}
