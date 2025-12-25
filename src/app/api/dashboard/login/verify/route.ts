import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// POST /api/dashboard/login/verify - Verify code and login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, code } = body;

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and code are required' },
        { status: 400 }
      );
    }

    // Get session with code
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('dashboard_sessions')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('code', code)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // Check if code is expired
    if (new Date(session.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Verification code has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Get the approved claim for this email
    const { data: claim, error: claimError } = await supabaseAdmin
      .from('profile_claims')
      .select('officiant_id')
      .eq('email', email.toLowerCase())
      .eq('status', 'approved')
      .single();

    if (claimError || !claim) {
      return NextResponse.json(
        { error: 'Profile claim not found' },
        { status: 404 }
      );
    }

    // Get officiant details
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

    // Delete the used session
    await supabaseAdmin
      .from('dashboard_sessions')
      .delete()
      .eq('email', email.toLowerCase());

    return NextResponse.json({
      success: true,
      officiantId: officiant.id,
      officiantName: `${officiant.first_name} ${officiant.last_name}`,
    });
  } catch (error) {
    console.error('Dashboard verify error:', error);
    return NextResponse.json(
      { error: 'Failed to verify code' },
      { status: 500 }
    );
  }
}
