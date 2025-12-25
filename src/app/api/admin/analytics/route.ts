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
    // Get top affiliations
    const { data: affiliationsRaw } = await supabase
      .from("officiants")
      .select("affiliation");

    const affiliationCounts: Record<string, number> = {};
    (affiliationsRaw || []).forEach((row) => {
      const aff = row.affiliation || "Unknown";
      affiliationCounts[aff] = (affiliationCounts[aff] || 0) + 1;
    });

    const topAffiliations = Object.entries(affiliationCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([name, count]) => ({ name, count }));

    // Get top municipalities
    const { data: municipalitiesRaw } = await supabase
      .from("officiants")
      .select("municipality");

    const municipalityCounts: Record<string, number> = {};
    (municipalitiesRaw || []).forEach((row) => {
      const muni = row.municipality || "Unknown";
      municipalityCounts[muni] = (municipalityCounts[muni] || 0) + 1;
    });

    const topMunicipalities = Object.entries(municipalityCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([name, count]) => ({ name, count }));

    // Get claims by status
    const { data: claimsRaw } = await supabase
      .from("profile_claims")
      .select("status, created_at");

    const claimsByStatus: Record<string, number> = {
      pending: 0,
      email_verified: 0,
      approved: 0,
      rejected: 0,
    };

    (claimsRaw || []).forEach((claim) => {
      const status = claim.status || "pending";
      claimsByStatus[status] = (claimsByStatus[status] || 0) + 1;
    });

    // Get claims over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: recentClaims } = await supabase
      .from("profile_claims")
      .select("created_at")
      .gte("created_at", thirtyDaysAgo.toISOString())
      .order("created_at", { ascending: true });

    const claimsByDay: Record<string, number> = {};
    (recentClaims || []).forEach((claim) => {
      const date = new Date(claim.created_at).toISOString().split("T")[0];
      claimsByDay[date] = (claimsByDay[date] || 0) + 1;
    });

    const claimsTimeline = Object.entries(claimsByDay).map(([date, count]) => ({
      date,
      count,
    }));

    return NextResponse.json({
      topAffiliations,
      topMunicipalities,
      claimsByStatus,
      claimsTimeline,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
