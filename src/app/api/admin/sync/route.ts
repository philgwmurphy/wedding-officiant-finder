import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function isAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) return false;

  const password = authHeader.replace("Bearer ", "");
  return password === process.env.ADMIN_PASSWORD;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get total officiant count
    const { count: totalOfficiants } = await supabase
      .from("officiants")
      .select("*", { count: "exact", head: true });

    // Get officiants with coordinates
    const { count: geocodedCount } = await supabase
      .from("officiants")
      .select("*", { count: "exact", head: true })
      .not("lat", "is", null);

    // Get sync history from sync_log table
    const { data: syncHistory, error: syncError } = await supabase
      .from("sync_log")
      .select("*")
      .order("started_at", { ascending: false })
      .limit(10);

    if (syncError) {
      console.error("Error fetching sync log:", syncError);
    }

    // Get claim counts
    const { count: totalClaims } = await supabase
      .from("profile_claims")
      .select("*", { count: "exact", head: true });

    const { count: approvedClaims } = await supabase
      .from("profile_claims")
      .select("*", { count: "exact", head: true })
      .eq("status", "approved");

    const { count: pendingClaims } = await supabase
      .from("profile_claims")
      .select("*", { count: "exact", head: true })
      .eq("status", "email_verified");

    return NextResponse.json({
      stats: {
        totalOfficiants: totalOfficiants || 0,
        geocodedOfficiants: geocodedCount || 0,
        geocodedPercent: totalOfficiants
          ? Math.round(((geocodedCount || 0) / totalOfficiants) * 100)
          : 0,
        totalClaims: totalClaims || 0,
        approvedClaims: approvedClaims || 0,
        pendingClaims: pendingClaims || 0,
      },
      syncHistory: syncHistory || [],
    });
  } catch (error) {
    console.error("Sync status error:", error);
    return NextResponse.json(
      { error: "Failed to fetch sync status" },
      { status: 500 }
    );
  }
}
