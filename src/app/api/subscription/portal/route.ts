import { NextRequest, NextResponse } from 'next/server';
import { createPortalSession } from '@/lib/stripe';
import { getSubscription } from '@/lib/monetization-db';

// POST /api/subscription/portal - Create billing portal session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { officiantId } = body as { officiantId: number };

    if (!officiantId) {
      return NextResponse.json(
        { error: 'Missing required field: officiantId' },
        { status: 400 }
      );
    }

    // Get the subscription to find the Stripe customer ID
    const subscription = await getSubscription(officiantId);

    if (!subscription || !subscription.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const returnUrl = `${baseUrl}/dashboard/subscription`;

    const portalUrl = await createPortalSession({
      stripeCustomerId: subscription.stripe_customer_id,
      returnUrl,
    });

    if (!portalUrl) {
      return NextResponse.json(
        { error: 'Failed to create portal session' },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: portalUrl });
  } catch (error) {
    console.error('Portal session error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
