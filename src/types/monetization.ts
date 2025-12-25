// Subscription types
export type SubscriptionPlan = 'free' | 'premium' | 'featured';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing';

export interface Subscription {
  id: string;
  officiant_id: number;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

// Premium profile types
export interface PremiumProfile {
  id: string;
  officiant_id: number;
  bio: string | null;
  photo_url: string | null;
  services: string[];
  languages: string[];
  price_range: string | null;
  years_experience: number | null;
  ceremony_types: string[];
  travel_radius: number | null;
  highlight_text: string | null;
  created_at: string;
  updated_at: string;
}

export interface PremiumProfileInput {
  bio?: string;
  photo_url?: string;
  services?: string[];
  languages?: string[];
  price_range?: string;
  years_experience?: number;
  ceremony_types?: string[];
  travel_radius?: number;
  highlight_text?: string;
}

// Lead types
export type LeadStatus = 'new' | 'viewed' | 'contacted' | 'booked' | 'archived';

export interface Lead {
  id: string;
  officiant_id: number;
  couple_name: string;
  couple_email: string;
  couple_phone: string | null;
  wedding_date: string | null;
  wedding_location: string | null;
  message: string | null;
  status: LeadStatus;
  created_at: string;
  updated_at: string;
}

export interface LeadInput {
  officiant_id: number;
  couple_name: string;
  couple_email: string;
  couple_phone?: string;
  wedding_date?: string;
  wedding_location?: string;
  message?: string;
}

// Featured slot types
export type FeaturedSlotType = 'search_top' | 'homepage' | 'category';

export interface FeaturedSlot {
  id: string;
  officiant_id: number;
  slot_type: FeaturedSlotType;
  municipality: string | null;
  affiliation: string | null;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  created_at: string;
}

// Pricing configuration
export interface PricingTier {
  id: SubscriptionPlan;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  highlighted?: boolean;
  stripePriceId?: string;
}

export const PRICING_TIERS: PricingTier[] = [
  {
    id: 'free',
    name: 'Basic',
    price: 0,
    interval: 'month',
    features: [
      'Basic listing in search results',
      'Name, location & affiliation shown',
      'Receive inquiries via contact form',
      'Ontario registry verification badge',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 19,
    interval: 'month',
    highlighted: true,
    features: [
      'Everything in Basic',
      'Profile photo & bio',
      'Services & pricing displayed',
      'Direct contact info shown',
      'Languages & ceremony types',
      'Profile analytics',
      'Priority email support',
    ],
  },
  {
    id: 'featured',
    name: 'Featured',
    price: 49,
    interval: 'month',
    features: [
      'Everything in Premium',
      'Top placement in local searches',
      'Featured badge on profile',
      'Homepage spotlight rotation',
      'Monthly performance report',
      'Dedicated support',
    ],
  },
];

// Service options for premium profiles
export const SERVICE_OPTIONS = [
  'Religious Ceremonies',
  'Secular Ceremonies',
  'Interfaith Ceremonies',
  'Elopements',
  'Vow Renewals',
  'Same-Sex Weddings',
  'Destination Weddings',
  'Bilingual Ceremonies',
  'Custom Ceremonies',
];

export const CEREMONY_TYPE_OPTIONS = [
  'Traditional',
  'Contemporary',
  'Spiritual',
  'Cultural',
  'Themed',
  'Intimate',
  'Large Gatherings',
  'Outdoor',
  'Indoor',
];

export const LANGUAGE_OPTIONS = [
  'English',
  'French',
  'Spanish',
  'Italian',
  'Portuguese',
  'German',
  'Polish',
  'Mandarin',
  'Cantonese',
  'Hindi',
  'Punjabi',
  'Arabic',
  'Tagalog',
  'Vietnamese',
  'Korean',
  'Japanese',
  'Greek',
  'Russian',
  'Ukrainian',
  'ASL (Sign Language)',
];
