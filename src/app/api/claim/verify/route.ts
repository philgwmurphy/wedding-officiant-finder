import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { ClaimVerifyRequest } from "@/types/officiant";

// Use service role for write operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body: ClaimVerifyRequest = await request.json();

    // Validate required fields
    if (!body.officiantId || !body.email || !body.code) {
      return NextResponse.json(
        { success: false, error: "Officiant ID, email, and code are required" },
        { status: 400 }
      );
    }

    // Find the pending claim
    const { data: claim, error: claimError } = await supabase
      .from("profile_claims")
      .select("*")
      .eq("officiant_id", body.officiantId)
      .eq("email", body.email)
      .eq("status", "pending")
      .single();

    if (claimError || !claim) {
      return NextResponse.json(
        { success: false, error: "No pending claim found for this email" },
        { status: 404 }
      );
    }

    // Check if expired
    if (new Date(claim.expires_at) < new Date()) {
      // Delete expired claim
      await supabase.from("profile_claims").delete().eq("id", claim.id);

      return NextResponse.json(
        { success: false, error: "Verification code has expired. Please try again." },
        { status: 400 }
      );
    }

    // Verify the code
    if (claim.verification_code !== body.code) {
      return NextResponse.json(
        { success: false, error: "Invalid verification code" },
        { status: 400 }
      );
    }

    // Update claim status to email_verified
    const { error: updateError } = await supabase
      .from("profile_claims")
      .update({
        status: "email_verified",
        verified_at: new Date().toISOString(),
      })
      .eq("id", claim.id);

    if (updateError) {
      console.error("Failed to update claim:", updateError);
      return NextResponse.json(
        { success: false, error: "Failed to verify claim" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "Email verified! Your claim is pending admin approval. You'll receive an email once approved.",
    });
  } catch (error) {
    console.error("Verify error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to verify claim" },
      { status: 500 }
    );
  }
}
