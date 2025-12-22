import { NextResponse } from "next/server";
import { getMunicipalities } from "@/lib/supabase";

export const revalidate = 60 * 60; // Revalidate cached response every hour

export async function GET() {
  try {
    const municipalities = await getMunicipalities();

    return NextResponse.json(
      {
        success: true,
        municipalities,
        count: municipalities.length,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      }
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
