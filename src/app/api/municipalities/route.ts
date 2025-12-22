import { NextResponse } from "next/server";
import { getMunicipalities } from "@/lib/supabase";

export async function GET() {
  try {
    const municipalities = await getMunicipalities();

    return NextResponse.json({
      success: true,
      municipalities,
      count: municipalities.length,
    });
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
