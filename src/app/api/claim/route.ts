import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendVerificationEmail, generateVerificationCode } from "@/lib/email";
import type { ClaimRequest } from "@/types/officiant";

// Use service role for write operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body: ClaimRequest = await request.json();

    // Validate required fields
    if (!body.officiantId || !body.email) {
      return NextResponse.json(
        { success: false, error: "Officiant ID and email are required" },
        { status: 400 }
      );
    }

    // Get the officiant to verify it exists
    const { data: officiant, error: officiantError } = await supabase
      .from("officiants")
      .select("id, first_name, last_name")
      .eq("id", body.officiantId)
      .single();

    if (officiantError || !officiant) {
      return NextResponse.json(
        { success: false, error: "Officiant not found" },
        { status: 404 }
      );
    }

    // Check if there's already an approved claim for this officiant
    const { data: existingApproved } = await supabase
      .from("profile_claims")
      .select("id")
      .eq("officiant_id", body.officiantId)
      .eq("status", "approved")
      .single();

    if (existingApproved) {
      return NextResponse.json(
        { success: false, error: "This profile has already been claimed" },
        { status: 400 }
      );
    }

    // Check if there's a pending claim with the same email
    const { data: existingPending } = await supabase
      .from("profile_claims")
      .select("id, created_at")
      .eq("officiant_id", body.officiantId)
      .eq("email", body.email)
      .in("status", ["pending", "email_verified"])
      .single();

    if (existingPending) {
      // Check if it was created less than 5 minutes ago (prevent spam)
      const createdAt = new Date(existingPending.created_at);
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

      if (createdAt > fiveMinutesAgo) {
        return NextResponse.json(
          {
            success: false,
            error:
              "A verification code was recently sent. Please check your email or wait a few minutes.",
          },
          { status: 429 }
        );
      }

      // Delete old pending claim
      await supabase
        .from("profile_claims")
        .delete()
        .eq("id", existingPending.id);
    }

    // Generate verification code
    const code = generateVerificationCode();

    // Create claim record
    const { error: insertError } = await supabase.from("profile_claims").insert({
      officiant_id: body.officiantId,
      email: body.email,
      phone: body.phone || null,
      website: body.website || null,
      verification_code: code,
      status: "pending",
    });

    if (insertError) {
      console.error("Failed to create claim:", insertError);
      return NextResponse.json(
        { success: false, error: "Failed to create claim" },
        { status: 500 }
      );
    }

    // Send verification email
    const officiantName = `${officiant.first_name} ${officiant.last_name}`;
    const emailResult = await sendVerificationEmail(body.email, officiantName, code);

    if (!emailResult.success) {
      // Clean up the claim if email fails
      await supabase
        .from("profile_claims")
        .delete()
        .eq("officiant_id", body.officiantId)
        .eq("email", body.email)
        .eq("status", "pending");

      return NextResponse.json(
        { success: false, error: "Failed to send verification email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Verification code sent to your email",
    });
  } catch (error) {
    console.error("Claim error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process claim" },
      { status: 500 }
    );
  }
}
