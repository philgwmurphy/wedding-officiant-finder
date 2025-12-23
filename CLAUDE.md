# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server at localhost:3000
npm run build    # Production build
npm run lint     # ESLint check
npm run sync     # Sync officiants from Ontario Data Catalogue to Supabase
```

## Architecture Overview

This is a Next.js 14 App Router application for finding wedding officiants in Ontario. It uses Supabase for the database, Anthropic Claude for AI-powered email generation, and Resend for transactional emails.

### Data Flow

1. **Data Source**: Officiants are synced from the Ontario Data Catalogue API (`scripts/sync-officiants.ts`) into Supabase
2. **Geocoding**: Municipalities are geocoded via Nominatim (OpenStreetMap) during sync for distance-based search
3. **Search**: Users search by location/affiliation → `/api/search` queries Supabase with optional radius filtering
4. **Email Generation**: `/api/generate-email` uses Anthropic Claude to create personalized inquiry emails

### Key Modules

- `src/lib/supabase.ts` - Database queries (search, officiant lookup, affiliations/municipalities with caching)
- `src/lib/ontario-api.ts` - Ontario Data Catalogue API client for fetching officiant registry
- `src/lib/geocode.ts` - Nominatim geocoding and distance calculations
- `src/lib/email.ts` - Resend email sending (lazy-initialized for build compatibility)
- `src/lib/schema.ts` - JSON-LD structured data generators for SEO/AEO

### Profile Claiming System

Officiants can claim their profile to add contact info:
1. Submit claim (`/api/claim`) → sends 6-digit verification code via Resend
2. Verify code (`/api/claim/verify`) → marks claim as `email_verified`
3. Admin approves (`/api/admin/claims`) → claim status becomes `approved`, contact info displays publicly

Admin dashboard at `/admin/claims` uses simple password auth via `ADMIN_PASSWORD` env var.

### Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase connection
- `SUPABASE_SERVICE_ROLE_KEY` - For write operations (sync, claims)
- `ANTHROPIC_API_KEY` - AI email generation
- `RESEND_API_KEY` - Verification emails
- `ADMIN_PASSWORD` - Admin dashboard access
- `NEXT_PUBLIC_SITE_URL` / `NEXT_PUBLIC_BASE_URL` - Full URL with protocol (e.g., `https://example.com`)

## Code Conventions (from AGENTS.md)

- Use App Router patterns; add `"use client"` only when interactivity required
- Prefer server-side data fetching; avoid `fetch` in Client Components
- Use `type` aliases for props/data models; avoid `any`
- Keep metadata in `metadata` exports, not manual `<Head>` manipulation
