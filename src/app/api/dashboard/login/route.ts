import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/email';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// POST /api/dashboard/login - Send verification code
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find approved claim with this email
    const { data: claim, error: claimError } = await supabaseAdmin
      .from('profile_claims')
      .select('officiant_id, email')
      .eq('email', email.toLowerCase())
      .eq('status', 'approved')
      .single();

    if (claimError || !claim) {
      return NextResponse.json(
        { error: 'No approved profile found with this email. Please claim your profile first.' },
        { status: 404 }
      );
    }

    // Get officiant name
    const { data: officiant, error: officiantError } = await supabaseAdmin
      .from('officiants')
      .select('id, first_name, last_name')
      .eq('id', claim.officiant_id)
      .single();

    if (officiantError || !officiant) {
      return NextResponse.json(
        { error: 'Officiant not found' },
        { status: 404 }
      );
    }

    // Generate 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15); // 15 minute expiry

    // Store code in database (we'll use profile_claims table with a login_code field)
    // For simplicity, we'll store it in a separate dashboard_sessions table
    await supabaseAdmin.from('dashboard_sessions').upsert({
      email: email.toLowerCase(),
      code,
      expires_at: expiresAt.toISOString(),
      created_at: new Date().toISOString(),
    }, { onConflict: 'email' });

    // Send verification email
    await sendEmail({
      to: email,
      subject: 'Your Officiant Dashboard Login Code',
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
          <h1 style="color: #7D9A82; font-size: 24px;">Dashboard Login</h1>
          <p>Hi ${officiant.first_name},</p>
          <p>Use this code to sign in to your Officiant Dashboard:</p>
          <div style="background: #E8F0E9; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #3A4239;">${code}</span>
          </div>
          <p style="color: #666; font-size: 14px;">This code expires in 15 minutes.</p>
          <p style="color: #666; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      officiantId: officiant.id,
      officiantName: `${officiant.first_name} ${officiant.last_name}`,
    });
  } catch (error) {
    console.error('Dashboard login error:', error);
    return NextResponse.json(
      { error: 'Failed to send verification code' },
      { status: 500 }
    );
  }
}
