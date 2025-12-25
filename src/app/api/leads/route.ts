import { NextRequest, NextResponse } from 'next/server';
import { createLead, getLeadsForOfficiant, getLeadCount } from '@/lib/monetization-db';
import { getOfficiantById } from '@/lib/supabase';
import { LeadInput, LeadStatus } from '@/types/monetization';

// POST /api/leads - Create a new lead (inquiry from couple)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      officiantId,
      coupleName,
      coupleEmail,
      couplePhone,
      weddingDate,
      weddingLocation,
      message,
    } = body;

    // Validate required fields
    if (!officiantId || !coupleName || !coupleEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: officiantId, coupleName, coupleEmail' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(coupleEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if officiant exists
    const officiant = await getOfficiantById(officiantId);
    if (!officiant) {
      return NextResponse.json(
        { error: 'Officiant not found' },
        { status: 404 }
      );
    }

    // Create the lead
    const leadInput: LeadInput = {
      officiant_id: officiantId,
      couple_name: coupleName.slice(0, 200),
      couple_email: coupleEmail.slice(0, 200),
      couple_phone: couplePhone?.slice(0, 30),
      wedding_date: weddingDate,
      wedding_location: weddingLocation?.slice(0, 200),
      message: message?.slice(0, 2000),
    };

    await createLead(leadInput);

    // TODO: Send notification email to officiant if they have email set up
    // This would require getting the officiant's email from profile_claims

    return NextResponse.json({
      success: true,
      message: 'Your inquiry has been sent to the officiant',
    });
  } catch (error) {
    console.error('Error creating lead:', error);
    return NextResponse.json(
      { error: 'Failed to submit inquiry' },
      { status: 500 }
    );
  }
}

// GET /api/leads?officiantId=123&status=new&limit=20&offset=0
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const officiantId = searchParams.get('officiantId');
  const status = searchParams.get('status') as LeadStatus | null;
  const limit = parseInt(searchParams.get('limit') || '20', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);

  if (!officiantId) {
    return NextResponse.json(
      { error: 'Missing officiantId parameter' },
      { status: 400 }
    );
  }

  try {
    // Get leads
    const { leads, total } = await getLeadsForOfficiant(
      parseInt(officiantId, 10),
      { status: status || undefined, limit, offset }
    );

    // Get counts by status
    const newCount = await getLeadCount(parseInt(officiantId, 10), 'new');
    const viewedCount = await getLeadCount(parseInt(officiantId, 10), 'viewed');
    const contactedCount = await getLeadCount(parseInt(officiantId, 10), 'contacted');
    const bookedCount = await getLeadCount(parseInt(officiantId, 10), 'booked');

    return NextResponse.json({
      leads,
      total,
      counts: {
        new: newCount,
        viewed: viewedCount,
        contacted: contactedCount,
        booked: bookedCount,
      },
    });
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}
