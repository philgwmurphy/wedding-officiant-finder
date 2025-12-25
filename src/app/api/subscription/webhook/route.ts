import { NextRequest, NextResponse } from 'next/server';
import { constructWebhookEvent, getPlanFromPriceId } from '@/lib/stripe';
import {
  createOrUpdateSubscription,
  updateSubscriptionByStripeId,
} from '@/lib/monetization-db';
import type Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    const body = await request.text();
    event = constructWebhookEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutComplete(session);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const officiantId = session.metadata?.officiant_id;
  const plan = session.metadata?.plan;

  if (!officiantId || !plan) {
    console.error('Missing metadata in checkout session:', session.id);
    return;
  }

  const subscriptionId = session.subscription as string;
  const customerId = session.customer as string;

  await createOrUpdateSubscription(parseInt(officiantId, 10), {
    plan: plan as 'premium' | 'featured',
    status: 'active',
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId,
  });

  console.log(`Subscription created for officiant ${officiantId}: ${plan}`);
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const priceId = subscription.items.data[0]?.price.id;
  const plan = getPlanFromPriceId(priceId);

  let status: 'active' | 'canceled' | 'past_due' | 'trialing' = 'active';
  if (subscription.status === 'canceled') {
    status = 'canceled';
  } else if (subscription.status === 'past_due') {
    status = 'past_due';
  } else if (subscription.status === 'trialing') {
    status = 'trialing';
  }

  // Access period timestamps from the subscription object
  const subData = subscription as unknown as {
    current_period_start: number;
    current_period_end: number;
    cancel_at_period_end: boolean;
  };

  await updateSubscriptionByStripeId(subscription.id, {
    plan,
    status,
    current_period_start: new Date(subData.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subData.current_period_end * 1000).toISOString(),
    cancel_at_period_end: subData.cancel_at_period_end,
  });

  console.log(`Subscription updated: ${subscription.id} -> ${plan} (${status})`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  await updateSubscriptionByStripeId(subscription.id, {
    plan: 'free',
    status: 'canceled',
  });

  console.log(`Subscription canceled: ${subscription.id}`);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  // Access subscription from invoice object
  const invoiceData = invoice as unknown as { subscription?: string | null };
  const subscriptionId = invoiceData.subscription;

  if (subscriptionId) {
    await updateSubscriptionByStripeId(subscriptionId, {
      status: 'past_due',
    });

    console.log(`Payment failed for subscription: ${subscriptionId}`);
  }
}
