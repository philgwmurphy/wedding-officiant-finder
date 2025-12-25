# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server at localhost:3000
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint check
npm run sync     # Sync officiants from Ontario Data Catalogue to Supabase
```

## Project Structure

```
wedding-officiant-finder/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/                # API routes
│   │   │   ├── search/         # Officiant search endpoint
│   │   │   ├── claim/          # Profile claim submission + verification
│   │   │   ├── admin/claims/   # Admin claim management
│   │   │   ├── affiliations/   # Unique affiliations list
│   │   │   ├── municipalities/ # Municipality autocomplete list
│   │   │   └── officiants/[id]/ # Single officiant lookup
│   │   ├── admin/claims/       # Admin dashboard page
│   │   ├── officiant/[id]/     # Individual officiant profile page
│   │   ├── search/             # Search results page
│   │   ├── layout.tsx          # Root layout with Vercel Analytics
│   │   ├── page.tsx            # Homepage with search form
│   │   ├── sitemap.ts          # Dynamic sitemap generation
│   │   └── robots.ts           # Robots.txt configuration
│   ├── components/             # React components
│   │   ├── SearchForm.tsx      # Location/affiliation search with autocomplete
│   │   ├── OfficiantCard.tsx   # Officiant result card
│   │   ├── ClaimProfile.tsx    # Profile claim modal trigger
│   │   ├── ClaimProfileForm.tsx # Claim submission form
│   │   ├── ClaimVerifyForm.tsx # Verification code form
│   │   └── JsonLd.tsx          # Structured data component
│   ├── lib/                    # Shared utilities
│   │   ├── supabase.ts         # Database client and queries
│   │   ├── ontario-api.ts      # Ontario Data Catalogue client
│   │   ├── geocode.ts          # Geocoding + distance calculations
│   │   ├── fsa-coordinates.ts  # Ontario FSA postal code lookup table
│   │   ├── email.ts            # Resend email sending
│   │   └── schema.ts           # JSON-LD structured data generators
│   └── types/
│       └── officiant.ts        # TypeScript type definitions
├── scripts/
│   └── sync-officiants.ts      # Data sync script (run with npm run sync)
├── supabase/
│   ├── schema.sql              # Full database schema
│   └── migrations/             # Incremental migrations
└── package.json
```

## Architecture Overview

This is a Next.js 14 App Router application for finding wedding officiants in Ontario. It uses:

- **Supabase** - PostgreSQL database with Row Level Security
- **Resend** - Transactional emails for profile claim verification
- **FSA Lookup** - Static Ontario postal code geocoding (no external API needed)
- **Nominatim (OpenStreetMap)** - Geocoding for municipalities
- **Vercel Analytics & Speed Insights** - Performance monitoring

### Data Flow

1. **Data Source**: Officiants are synced from Ontario Data Catalogue API (`scripts/sync-officiants.ts`) into Supabase
2. **Geocoding**: Municipalities are geocoded via Nominatim during sync, cached in `municipalities` table
3. **Postal Codes**: Ontario postal codes use FSA lookup table for reliable geocoding (Canadian postal codes aren't in OSM)
4. **Search**: Users search by location/affiliation → `/api/search` queries Supabase with distance calculations

### Key Modules

| Module | Purpose |
|--------|---------|
| `src/lib/supabase.ts` | Database queries: search, officiant lookup, affiliations/municipalities with caching fallbacks |
| `src/lib/ontario-api.ts` | Ontario Data Catalogue API client for fetching officiant registry |
| `src/lib/geocode.ts` | Municipality geocoding (Nominatim) and Haversine distance calculations |
| `src/lib/fsa-coordinates.ts` | Static FSA lookup table for Ontario postal code geocoding |
| `src/lib/email.ts` | Resend email sending for profile claim verification |
| `src/lib/schema.ts` | JSON-LD generators for SEO (WebSite, Person, LocalBusiness, BreadcrumbList, FAQ) |

### API Routes

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/search` | GET | Search officiants by location, affiliation, radius |
| `/api/claim` | POST | Submit profile claim request |
| `/api/claim/verify` | POST | Verify 6-digit email code |
| `/api/admin/claims` | GET/PATCH | Admin: list and approve/reject claims |
| `/api/affiliations` | GET | Get unique affiliation list (cached) |
| `/api/municipalities` | GET | Get municipality list for autocomplete (cached) |
| `/api/officiants/[id]` | GET | Get single officiant by ID |

### Profile Claiming System

Officiants can claim their profile to add contact info (email, phone, website):

1. **Submit claim** (`/api/claim`) → generates 6-digit code, sends verification email via Resend
2. **Verify code** (`/api/claim/verify`) → marks claim as `email_verified`
3. **Admin approves** (`/api/admin/claims`) → claim status becomes `approved`, contact info displays publicly

Admin dashboard at `/admin/claims` uses simple password auth via `ADMIN_PASSWORD` env var.

### Database Schema

Main tables in Supabase:

- **`officiants`** - Ontario-registered officiants with geocoded locations
- **`municipalities`** - Cached geocoding results for municipalities
- **`profile_claims`** - Profile claim requests with verification status
- **`sync_log`** - Data sync operation history
- **`cached_affiliations`** / **`cached_municipalities`** - Cached distinct values for faster API responses

### Caching Strategy

- **Server-side**: Municipalities/affiliations cached in dedicated tables, with fallback to live queries
- **Client-side**: SearchForm caches municipalities in sessionStorage (1-hour TTL)
- **Geocoding**: In-memory cache during sync operations; persistent cache in `municipalities` table

## Environment Variables

Required in `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx    # For write operations (sync, claims)

# Resend
RESEND_API_KEY=xxx               # Verification emails for profile claims

# Admin
ADMIN_PASSWORD=xxx               # Admin dashboard access

# Site URLs
NEXT_PUBLIC_SITE_URL=https://onweddingofficiants.ca
NEXT_PUBLIC_BASE_URL=https://onweddingofficiants.ca
```

## Code Conventions

### Next.js Patterns
- Use App Router patterns; add `"use client"` only when interactivity is required
- Prefer server-side data fetching; avoid `fetch` in Client Components
- Use `next/link` for internal navigation, `next/image` for images
- Keep metadata in `metadata` exports, not manual `<Head>` manipulation
- Co-locate route-specific logic inside route folders; shared UI goes in `src/components`

### TypeScript
- Use `type` aliases for props/data models; avoid `any`
- Add explicit return types for exported functions and components
- Enable strict null checks: narrow `undefined`/`null` before use
- Favor immutable patterns using `const` and non-mutating array helpers

### Component Patterns
- Server Components by default for data fetching
- Client Components only for interactive forms, autocomplete, modals
- Use Suspense with skeleton loading states for async content

### SEO/Structured Data
- Generate JSON-LD structured data using helpers in `src/lib/schema.ts`
- Include BreadcrumbList on all pages
- Add FAQ schema on homepage, LocalBusiness schema on claimed profiles

### Testing & Quality
- Run `npm run lint` before committing
- Keep imports ordered: built-ins, external deps, then internal modules
- Remove unused imports
