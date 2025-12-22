import { NextRequest, NextResponse } from "next/server";
import { searchOfficiants } from "@/lib/supabase";
import { geocodeMunicipality } from "@/lib/geocode";
import type { SearchParams } from "@/types/officiant";

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

    // If location is provided, try to geocode it for radius search
    if (params.location) {
      const geocoded = await geocodeMunicipality(params.location);
      if (geocoded) {
        params.lat = geocoded.lat;
        params.lng = geocoded.lng;
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
