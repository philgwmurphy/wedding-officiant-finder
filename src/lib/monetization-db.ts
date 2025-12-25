import { createClient } from '@supabase/supabase-js';
import type {
  Subscription,
  SubscriptionPlan,
  SubscriptionStatus,
  PremiumProfile,
  PremiumProfileInput,
  Lead,
  LeadInput,
  LeadStatus,
  FeaturedSlot,
} from '@/types/monetization';

// Use service role client for write operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// ============================================
// SUBSCRIPTION FUNCTIONS
// ============================================

export async function getSubscription(officiantId: number): Promise<Subscription | null> {
  const { data, error } = await supabaseAdmin
    .from('subscriptions')
    .select('*')
    .eq('officiant_id', officiantId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    console.error('Error fetching subscription:', error);
    return null;
  }

  return data as Subscription;
}

export async function getSubscriptionByStripeId(stripeSubscriptionId: string): Promise<Subscription | null> {
  const { data, error } = await supabaseAdmin
    .from('subscriptions')
    .select('*')
    .eq('stripe_subscription_id', stripeSubscriptionId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Failed to get subscription: ${error.message}`);
  }

  return data as Subscription;
}

export async function createOrUpdateSubscription(
  officiantId: number,
  data: {
    plan: SubscriptionPlan;
    status: SubscriptionStatus;
    stripe_customer_id?: string;
    stripe_subscription_id?: string;
    current_period_start?: string;
    current_period_end?: string;
    cancel_at_period_end?: boolean;
  }
): Promise<Subscription> {
  const { data: subscription, error } = await supabaseAdmin
    .from('subscriptions')
    .upsert(
      {
        officiant_id: officiantId,
        ...data,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'officiant_id' }
    )
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create/update subscription: ${error.message}`);
  }

  return subscription as Subscription;
}

export async function updateSubscriptionByStripeId(
  stripeSubscriptionId: string,
  data: Partial<{
    plan: SubscriptionPlan;
    status: SubscriptionStatus;
    current_period_start: string;
    current_period_end: string;
    cancel_at_period_end: boolean;
  }>
): Promise<Subscription | null> {
  const { data: subscription, error } = await supabaseAdmin
    .from('subscriptions')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', stripeSubscriptionId)
    .select()
    .single();

  if (error) {
    console.error('Error updating subscription:', error);
    return null;
  }

  return subscription as Subscription;
}

// ============================================
// PREMIUM PROFILE FUNCTIONS
// ============================================

export async function getPremiumProfile(officiantId: number): Promise<PremiumProfile | null> {
  const { data, error } = await supabaseAdmin
    .from('premium_profiles')
    .select('*')
    .eq('officiant_id', officiantId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    console.error('Error fetching premium profile:', error);
    return null;
  }

  return data as PremiumProfile;
}

export async function createOrUpdatePremiumProfile(
  officiantId: number,
  input: PremiumProfileInput
): Promise<PremiumProfile> {
  const { data, error } = await supabaseAdmin
    .from('premium_profiles')
    .upsert(
      {
        officiant_id: officiantId,
        ...input,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'officiant_id' }
    )
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update premium profile: ${error.message}`);
  }

  return data as PremiumProfile;
}

// ============================================
// LEAD FUNCTIONS
// ============================================

export async function createLead(input: LeadInput): Promise<Lead> {
  const { data, error } = await supabaseAdmin
    .from('leads')
    .insert({
      officiant_id: input.officiant_id,
      couple_name: input.couple_name,
      couple_email: input.couple_email,
      couple_phone: input.couple_phone || null,
      wedding_date: input.wedding_date || null,
      wedding_location: input.wedding_location || null,
      message: input.message || null,
      status: 'new',
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create lead: ${error.message}`);
  }

  return data as Lead;
}

export async function getLeadsForOfficiant(
  officiantId: number,
  options?: { status?: LeadStatus; limit?: number; offset?: number }
): Promise<{ leads: Lead[]; total: number }> {
  let query = supabaseAdmin
    .from('leads')
    .select('*', { count: 'exact' })
    .eq('officiant_id', officiantId)
    .order('created_at', { ascending: false });

  if (options?.status) {
    query = query.eq('status', options.status);
  }

  const limit = options?.limit || 20;
  const offset = options?.offset || 0;
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Failed to get leads: ${error.message}`);
  }

  return {
    leads: (data || []) as Lead[],
    total: count || 0,
  };
}

export async function updateLeadStatus(leadId: string, status: LeadStatus): Promise<Lead | null> {
  const { data, error } = await supabaseAdmin
    .from('leads')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', leadId)
    .select()
    .single();

  if (error) {
    console.error('Error updating lead:', error);
    return null;
  }

  return data as Lead;
}

export async function getLeadCount(officiantId: number, status?: LeadStatus): Promise<number> {
  let query = supabaseAdmin
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .eq('officiant_id', officiantId);

  if (status) {
    query = query.eq('status', status);
  }

  const { count, error } = await query;

  if (error) {
    console.error('Error counting leads:', error);
    return 0;
  }

  return count || 0;
}

// ============================================
// FEATURED SLOTS FUNCTIONS
// ============================================

export async function getActiveFeaturedOfficiants(options?: {
  municipality?: string;
  affiliation?: string;
  slotType?: 'search_top' | 'homepage' | 'category';
}): Promise<number[]> {
  const now = new Date().toISOString();

  let query = supabaseAdmin
    .from('featured_slots')
    .select('officiant_id')
    .eq('is_active', true)
    .lte('starts_at', now)
    .gte('ends_at', now);

  if (options?.slotType) {
    query = query.eq('slot_type', options.slotType);
  }

  if (options?.municipality) {
    query = query.or(`municipality.is.null,municipality.eq.${options.municipality}`);
  }

  if (options?.affiliation) {
    query = query.or(`affiliation.is.null,affiliation.eq.${options.affiliation}`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error getting featured slots:', error);
    return [];
  }

  return (data || []).map((row) => row.officiant_id);
}

export async function createFeaturedSlot(
  officiantId: number,
  slotType: 'search_top' | 'homepage' | 'category',
  durationDays: number,
  options?: { municipality?: string; affiliation?: string }
): Promise<FeaturedSlot> {
  const startsAt = new Date();
  const endsAt = new Date();
  endsAt.setDate(endsAt.getDate() + durationDays);

  const { data, error } = await supabaseAdmin
    .from('featured_slots')
    .insert({
      officiant_id: officiantId,
      slot_type: slotType,
      municipality: options?.municipality || null,
      affiliation: options?.affiliation || null,
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create featured slot: ${error.message}`);
  }

  return data as FeaturedSlot;
}

export async function getFeaturedSlotsForOfficiant(officiantId: number): Promise<FeaturedSlot[]> {
  const { data, error } = await supabaseAdmin
    .from('featured_slots')
    .select('*')
    .eq('officiant_id', officiantId)
    .eq('is_active', true)
    .gte('ends_at', new Date().toISOString())
    .order('ends_at', { ascending: true });

  if (error) {
    console.error('Error getting featured slots:', error);
    return [];
  }

  return (data || []) as FeaturedSlot[];
}

// ============================================
// HELPER: Check if officiant has active premium subscription
// ============================================

export async function hasActivePremium(officiantId: number): Promise<boolean> {
  const subscription = await getSubscription(officiantId);
  return subscription !== null &&
    subscription.status === 'active' &&
    (subscription.plan === 'premium' || subscription.plan === 'featured');
}

export async function hasFeaturedSubscription(officiantId: number): Promise<boolean> {
  const subscription = await getSubscription(officiantId);
  return subscription !== null &&
    subscription.status === 'active' &&
    subscription.plan === 'featured';
}
