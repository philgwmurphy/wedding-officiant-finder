import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/stripe';
import { getSubscription } from '@/lib/monetization-db';
import { SubscriptionPlan } from '@/types/monetization';

// POST /api/subscription - Create a checkout session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { officiantId, email, plan } = body as {
      officiantId: number;
      email: string;
      plan: SubscriptionPlan;
    };

    if (!officiantId || !email || !plan) {
      return NextResponse.json(
        { error: 'Missing required fields: officiantId, email, plan' },
        { status: 400 }
      );
    }

    if (plan === 'free') {
      return NextResponse.json(
        { error: 'Cannot create checkout for free plan' },
        { status: 400 }
      );
    }

    if (plan !== 'premium' && plan !== 'featured') {
      return NextResponse.json(
        { error: 'Invalid plan. Must be "premium" or "featured"' },
        { status: 400 }
      );
    }

    // Check if already has active subscription
    const existingSubscription = await getSubscription(officiantId);
    if (existingSubscription && existingSubscription.status === 'active') {
      return NextResponse.json(
        { error: 'Already has an active subscription. Use the billing portal to change plans.' },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const successUrl = `${baseUrl}/dashboard?subscription=success`;
    const cancelUrl = `${baseUrl}/pricing?subscription=canceled`;

    const checkoutUrl = await createCheckoutSession({
      officiantId,
      officiantEmail: email,
      plan,
      successUrl,
      cancelUrl,
    });

    if (!checkoutUrl) {
      return NextResponse.json(
        { error: 'Failed to create checkout session' },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: checkoutUrl });
  } catch (error) {
    console.error('Subscription creation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/subscription?officiantId=123 - Get subscription status
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const officiantId = searchParams.get('officiantId');

  if (!officiantId) {
    return NextResponse.json(
      { error: 'Missing officiantId parameter' },
      { status: 400 }
    );
  }

  try {
    const subscription = await getSubscription(parseInt(officiantId, 10));

    if (!subscription) {
      return NextResponse.json({
        plan: 'free',
        status: 'active',
        hasSubscription: false,
      });
    }

    return NextResponse.json({
      plan: subscription.plan,
      status: subscription.status,
      hasSubscription: true,
      currentPeriodEnd: subscription.current_period_end,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
}
