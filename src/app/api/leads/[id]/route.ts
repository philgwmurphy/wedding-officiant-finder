import { NextRequest, NextResponse } from 'next/server';
import { updateLeadStatus } from '@/lib/monetization-db';
import { LeadStatus } from '@/types/monetization';

// PATCH /api/leads/[id] - Update lead status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { status } = body as { status: LeadStatus };

    if (!status) {
      return NextResponse.json(
        { error: 'Missing required field: status' },
        { status: 400 }
      );
    }

    const validStatuses: LeadStatus[] = ['new', 'viewed', 'contacted', 'booked', 'archived'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    const lead = await updateLeadStatus(id, status);

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead not found or update failed' },
        { status: 404 }
      );
    }

    return NextResponse.json({ lead });
  } catch (error) {
    console.error('Error updating lead:', error);
    return NextResponse.json(
      { error: 'Failed to update lead' },
      { status: 500 }
    );
  }
}
