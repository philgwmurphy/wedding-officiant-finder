import { NextRequest, NextResponse } from "next/server";
import { getOfficiantById } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid officiant ID" },
        { status: 400 }
      );
    }

    const officiant = await getOfficiantById(id);

    if (!officiant) {
      return NextResponse.json(
        { success: false, error: "Officiant not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      officiant,
    });
  } catch (error) {
    console.error("Get officiant error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get officiant",
      },
      { status: 500 }
    );
  }
}
