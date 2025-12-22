import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendClaimApprovedEmail } from "@/lib/email";

// Use service role for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Simple password protection for admin
function isAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) return false;

  const password = authHeader.replace("Bearer ", "");
  return password === process.env.ADMIN_PASSWORD;
}

// GET - List all claims with officiant details
export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const status = url.searchParams.get("status") || "email_verified";

    const { data, error } = await supabase
      .from("profile_claims")
      .select(`
        id,
        officiant_id,
        email,
        phone,
        website,
        status,
        created_at,
        verified_at
      `)
      .eq("status", status)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch claims:", error);
      return NextResponse.json(
        { error: "Failed to fetch claims" },
        { status: 500 }
      );
    }

    // Fetch officiant details for each claim
    const claimsWithOfficiants = await Promise.all(
      (data || []).map(async (claim) => {
        const { data: officiant } = await supabase
          .from("officiants")
          .select("first_name, last_name, municipality, affiliation")
          .eq("id", claim.officiant_id)
          .single();

        return {
          ...claim,
          officiant: officiant || null,
        };
      })
    );

    return NextResponse.json({ claims: claimsWithOfficiants });
  } catch (error) {
    console.error("Admin claims error:", error);
    return NextResponse.json(
      { error: "Failed to fetch claims" },
      { status: 500 }
    );
  }
}

// POST - Approve or reject a claim
export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { claimId, action } = body;

    if (!claimId || !action || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid request. Provide claimId and action (approve/reject)" },
        { status: 400 }
      );
    }

    // Get the claim first
    const { data: claim, error: claimError } = await supabase
      .from("profile_claims")
      .select("*, officiants!inner(first_name, last_name)")
      .eq("id", claimId)
      .single();

    if (claimError || !claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    if (action === "approve") {
      // Update claim status to approved
      const { error: updateError } = await supabase
        .from("profile_claims")
        .update({
          status: "approved",
          approved_at: new Date().toISOString(),
        })
        .eq("id", claimId);

      if (updateError) {
        throw updateError;
      }

      // Send approval email
      const officiantName = `${claim.officiants.first_name} ${claim.officiants.last_name}`;
      await sendClaimApprovedEmail(claim.email, officiantName);

      return NextResponse.json({
        success: true,
        message: "Claim approved and officiant notified",
      });
    } else {
      // Reject - just delete the claim
      const { error: deleteError } = await supabase
        .from("profile_claims")
        .delete()
        .eq("id", claimId);

      if (deleteError) {
        throw deleteError;
      }

      return NextResponse.json({
        success: true,
        message: "Claim rejected and removed",
      });
    }
  } catch (error) {
    console.error("Admin action error:", error);
    return NextResponse.json(
      { error: "Failed to process action" },
      { status: 500 }
    );
  }
}
