import { NextRequest, NextResponse } from 'next/server';
import {
  getPremiumProfile,
  createOrUpdatePremiumProfile,
  hasActivePremium,
} from '@/lib/monetization-db';
import { PremiumProfileInput } from '@/types/monetization';

// GET /api/premium/profile?officiantId=123
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
    const profile = await getPremiumProfile(parseInt(officiantId, 10));

    if (!profile) {
      return NextResponse.json({ profile: null });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Error fetching premium profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch premium profile' },
      { status: 500 }
    );
  }
}

// POST /api/premium/profile - Create or update premium profile
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { officiantId, ...profileData } = body as {
      officiantId: number;
    } & PremiumProfileInput;

    if (!officiantId) {
      return NextResponse.json(
        { error: 'Missing required field: officiantId' },
        { status: 400 }
      );
    }

    // Check if officiant has active premium subscription
    const hasPremium = await hasActivePremium(officiantId);
    if (!hasPremium) {
      return NextResponse.json(
        { error: 'Premium subscription required to update profile' },
        { status: 403 }
      );
    }

    // Validate and sanitize input
    const sanitizedData: PremiumProfileInput = {};

    if (profileData.bio !== undefined) {
      sanitizedData.bio = profileData.bio.slice(0, 2000); // Max 2000 chars
    }

    if (profileData.photo_url !== undefined) {
      sanitizedData.photo_url = profileData.photo_url;
    }

    if (profileData.services !== undefined && Array.isArray(profileData.services)) {
      sanitizedData.services = profileData.services.slice(0, 15); // Max 15 services
    }

    if (profileData.languages !== undefined && Array.isArray(profileData.languages)) {
      sanitizedData.languages = profileData.languages.slice(0, 10); // Max 10 languages
    }

    if (profileData.price_range !== undefined) {
      sanitizedData.price_range = profileData.price_range.slice(0, 50);
    }

    if (profileData.years_experience !== undefined) {
      sanitizedData.years_experience = Math.min(Math.max(0, profileData.years_experience), 100);
    }

    if (profileData.ceremony_types !== undefined && Array.isArray(profileData.ceremony_types)) {
      sanitizedData.ceremony_types = profileData.ceremony_types.slice(0, 15);
    }

    if (profileData.travel_radius !== undefined) {
      sanitizedData.travel_radius = Math.min(Math.max(0, profileData.travel_radius), 500);
    }

    if (profileData.highlight_text !== undefined) {
      sanitizedData.highlight_text = profileData.highlight_text.slice(0, 200);
    }

    const profile = await createOrUpdatePremiumProfile(officiantId, sanitizedData);

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Error updating premium profile:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update profile' },
      { status: 500 }
    );
  }
}
