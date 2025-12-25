import Stripe from 'stripe';
import { SubscriptionPlan } from '@/types/monetization';

// Initialize Stripe with secret key
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  console.warn('STRIPE_SECRET_KEY is not set - Stripe features will be disabled');
}

export const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, { apiVersion: '2024-12-18.acacia' })
  : null;

// Price IDs from Stripe Dashboard (set in environment variables)
export const STRIPE_PRICE_IDS: Record<Exclude<SubscriptionPlan, 'free'>, string> = {
  premium: process.env.STRIPE_PREMIUM_PRICE_ID || '',
  featured: process.env.STRIPE_FEATURED_PRICE_ID || '',
};

// Create a Stripe Checkout session for subscription
export async function createCheckoutSession({
  officiantId,
  officiantEmail,
  plan,
  successUrl,
  cancelUrl,
}: {
  officiantId: number;
  officiantEmail: string;
  plan: Exclude<SubscriptionPlan, 'free'>;
  successUrl: string;
  cancelUrl: string;
}): Promise<string | null> {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  const priceId = STRIPE_PRICE_IDS[plan];
  if (!priceId) {
    throw new Error(`Price ID not configured for plan: ${plan}`);
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_email: officiantEmail,
    metadata: {
      officiant_id: officiantId.toString(),
      plan,
    },
    subscription_data: {
      metadata: {
        officiant_id: officiantId.toString(),
        plan,
      },
    },
    allow_promotion_codes: true,
  });

  return session.url;
}

// Create a Stripe Customer Portal session for managing subscription
export async function createPortalSession({
  stripeCustomerId,
  returnUrl,
}: {
  stripeCustomerId: string;
  returnUrl: string;
}): Promise<string | null> {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: returnUrl,
  });

  return session.url;
}

// Get subscription details from Stripe
export async function getStripeSubscription(subscriptionId: string): Promise<Stripe.Subscription | null> {
  if (!stripe) return null;

  try {
    return await stripe.subscriptions.retrieve(subscriptionId);
  } catch {
    return null;
  }
}

// Cancel subscription at period end
export async function cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription | null> {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  return await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
}

// Resume a cancelled subscription
export async function resumeSubscription(subscriptionId: string): Promise<Stripe.Subscription | null> {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  return await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  });
}

// Verify webhook signature
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string,
  webhookSecret: string
): Stripe.Event {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}

// Helper to get plan from Stripe price ID
export function getPlanFromPriceId(priceId: string): SubscriptionPlan {
  if (priceId === STRIPE_PRICE_IDS.featured) return 'featured';
  if (priceId === STRIPE_PRICE_IDS.premium) return 'premium';
  return 'free';
}
