import { NextResponse } from "next/server";
import { getMunicipalities } from "@/lib/supabase";

export const revalidate = 3600;

const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
};

export async function GET() {
  try {
    const municipalities = await getMunicipalities();

    return NextResponse.json(
      {
        success: true,
        municipalities,
        count: municipalities.length,
      },
      { headers: CACHE_HEADERS }
    );
  } catch (error) {
    console.error("Get municipalities error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get municipalities",
      },
      { status: 500 }
    );
  }
}
