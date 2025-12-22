import { NextResponse } from "next/server";
import { getAffiliations } from "@/lib/supabase";

const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
};

export async function GET() {
  try {
    const affiliations = await getAffiliations();

    return NextResponse.json(
      {
        success: true,
        affiliations,
        count: affiliations.length,
      },
      { headers: CACHE_HEADERS }
    );
  } catch (error) {
    console.error("Get affiliations error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get affiliations",
      },
      { status: 500 }
    );
  }
}
