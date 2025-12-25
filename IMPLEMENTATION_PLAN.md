# Implementation Plan: Feature Roadmap

This document outlines the implementation plan for 5 key features requested for the wedding officiant finder.

---

## 1. "Near Me" Button (Browser Geolocation)

### Overview
Add a button next to the location input that uses the browser's Geolocation API to automatically detect the user's location and search for nearby officiants.

### Implementation Steps

#### 1.1 Update SearchForm Component
**File:** `src/components/SearchForm.tsx`

- Add state for geolocation loading: `const [gettingLocation, setGettingLocation] = useState(false)`
- Add a "Near Me" button next to the location input field
- Implement `handleNearMe()` function:
  ```typescript
  const handleNearMe = async () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        // Navigate with lat/lng params
        router.push(`/search?lat=${latitude}&lng=${longitude}&radius=25`);
        setGettingLocation(false);
      },
      (error) => {
        setGettingLocation(false);
        alert("Unable to get your location. Please enter manually.");
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  };
  ```

#### 1.2 Update Search API
**File:** `src/app/api/search/route.ts`

- Already supports `lat`, `lng`, and `radius` query parameters
- No changes needed to API

#### 1.3 Update Search Results Page
**File:** `src/app/search/page.tsx`

- Handle case where `lat`/`lng` are provided instead of `location`
- Display "Near your location" instead of a location name when using geolocation
- Show coordinates in a user-friendly way

#### 1.4 UI Design
- Button placement: Small button with location/crosshair icon to the right of the location input
- Loading state: Show spinner inside button while getting location
- Styling: Secondary button style, matching existing design

### Estimated Complexity: Low
- Mainly frontend changes
- Uses existing search API capabilities

---

## 2. Popular Affiliations Quick Filter

### Overview
Add clickable "chip" buttons for common affiliation types (Non-denominational, Catholic, Anglican, etc.) for one-click filtering.

### Implementation Steps

#### 2.1 Define Popular Affiliations
**File:** `src/lib/constants.ts` (new file)

```typescript
export const POPULAR_AFFILIATIONS = [
  { label: "Non-denominational", value: "Non-denominational" },
  { label: "Catholic", value: "Catholic" },
  { label: "Anglican", value: "Anglican" },
  { label: "United Church", value: "United Church" },
  { label: "Jewish", value: "Jewish" },
  { label: "Muslim", value: "Muslim" },
  { label: "Hindu", value: "Hindu" },
  { label: "Civil", value: "Civil" },
];
```

#### 2.2 Create AffiliationChips Component
**File:** `src/components/AffiliationChips.tsx` (new file)

- Display horizontal scrollable row of clickable chips
- Accept `onSelect(affiliation: string)` prop
- Highlight currently selected chip
- Mobile-friendly with horizontal scroll

#### 2.3 Update SearchForm Component
**File:** `src/components/SearchForm.tsx`

- Add AffiliationChips below the affiliation input field
- When chip is clicked, set the affiliation input value
- Optionally auto-submit the form

#### 2.4 Add to Homepage
**File:** `src/app/page.tsx`

- Add "Popular searches" section below the search form
- Display chips that link directly to search results

### Estimated Complexity: Low
- New component creation
- Minimal integration work

---

## 3. City & Affiliation Landing Pages

### Overview
Create SEO-optimized static pages for major Ontario cities and common affiliations (e.g., `/toronto-wedding-officiants`, `/catholic-wedding-officiants-ontario`).

### Implementation Steps

#### 3.1 Define Landing Page Data
**File:** `src/lib/landing-pages.ts` (new file)

```typescript
export const CITY_LANDING_PAGES = [
  { slug: "toronto-wedding-officiants", city: "Toronto", lat: 43.6532, lng: -79.3832 },
  { slug: "ottawa-wedding-officiants", city: "Ottawa", lat: 45.4215, lng: -75.6972 },
  { slug: "mississauga-wedding-officiants", city: "Mississauga", lat: 43.5890, lng: -79.6441 },
  { slug: "hamilton-wedding-officiants", city: "Hamilton", lat: 43.2557, lng: -79.8711 },
  { slug: "london-wedding-officiants", city: "London", lat: 42.9849, lng: -81.2453 },
  // ... more cities
];

export const AFFILIATION_LANDING_PAGES = [
  { slug: "catholic-wedding-officiants-ontario", affiliation: "Catholic" },
  { slug: "non-denominational-wedding-officiants-ontario", affiliation: "Non-denominational" },
  { slug: "jewish-wedding-officiants-ontario", affiliation: "Jewish" },
  // ... more affiliations
];
```

#### 3.2 Create Dynamic Route for City Pages
**File:** `src/app/[citySlug]/page.tsx` (new file)

- Use `generateStaticParams()` for static generation
- Fetch officiants for that city
- Include city-specific meta tags and JSON-LD
- Display search results with SearchForm pre-filled
- Add local content (FAQs specific to city)

#### 3.3 Create Dynamic Route for Affiliation Pages
**File:** `src/app/affiliation/[affiliationSlug]/page.tsx` (new file)

- Similar structure to city pages
- Filter by affiliation instead of location
- Include affiliation-specific meta tags and JSON-LD

#### 3.4 Update Sitemap
**File:** `src/app/sitemap.ts`

- Add all city landing pages
- Add all affiliation landing pages
- Set appropriate priorities and change frequencies

#### 3.5 Add Internal Links
- Link to landing pages from homepage footer
- Link to landing pages from search results (e.g., "See all Toronto officiants")
- Add breadcrumb navigation

#### 3.6 SEO Optimization
- Unique meta descriptions per page
- H1 tags with city/affiliation names
- LocalBusiness structured data for city pages
- FAQ schema for common questions

### Estimated Complexity: Medium
- Requires careful routing to avoid conflicts with officiant profile pages
- Need to pre-define city coordinates
- SEO optimization is important

---

## 4. Admin & Data Features

### Overview
Expand the admin dashboard with sync status monitoring and basic analytics.

### Implementation Steps

#### 4.1 Create Sync Status Page
**File:** `src/app/admin/sync/page.tsx` (new file)

- Show last sync timestamp from `sync_log` table
- Display total officiant count
- Show count of newly added/updated in last sync
- Button to trigger manual sync (optional)

#### 4.2 Create Analytics Dashboard
**File:** `src/app/admin/analytics/page.tsx` (new file)

- Display search query statistics (if tracked)
- Show popular affiliations searched
- Show popular locations searched
- Display claim submission stats

#### 4.3 Add API Route for Sync Info
**File:** `src/app/api/admin/sync/route.ts` (new file)

- GET: Return last sync info from `sync_log` table
- Protected with admin password

#### 4.4 Track Search Queries (Optional)
**Database:** Add `search_queries` table

```sql
CREATE TABLE search_queries (
  id SERIAL PRIMARY KEY,
  location TEXT,
  affiliation TEXT,
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  result_count INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

- Log searches to analyze user behavior
- Use for analytics dashboard

#### 4.5 Update Admin Navigation
**File:** `src/app/admin/claims/page.tsx`

- Add navigation links to other admin pages
- Create shared admin layout component

#### 4.6 Create Admin Layout
**File:** `src/app/admin/layout.tsx` (new file)

- Shared header with navigation
- Consistent styling across admin pages
- Auth state management

### Estimated Complexity: Medium
- Multiple new pages and API routes
- Optional database changes for tracking
- Reusable admin layout

---

## 5. Dark Mode

### Overview
Add dark mode support with automatic system preference detection and manual toggle.

### Implementation Steps

#### 5.1 Update CSS Variables
**File:** `src/app/globals.css`

```css
:root {
  --background: #fafafa;
  --foreground: #1a1a1a;
  --primary: #7c3aed;
  --primary-dark: #6d28d9;
  --secondary: #f3e8ff;
  --accent: #c084fc;
  --muted: #6b7280;
  --border: #e5e7eb;
  --card-bg: #ffffff;
  --card-border: #f3f4f6;
}

.dark {
  --background: #0f0f0f;
  --foreground: #fafafa;
  --primary: #a78bfa;
  --primary-dark: #8b5cf6;
  --secondary: #1e1033;
  --accent: #c084fc;
  --muted: #9ca3af;
  --border: #374151;
  --card-bg: #1a1a1a;
  --card-border: #2d2d2d;
}
```

#### 5.2 Create Theme Provider
**File:** `src/components/ThemeProvider.tsx` (new file)

```typescript
"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (theme: Theme) => void;
}>({ theme: "system", setTheme: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    const stored = localStorage.getItem("theme") as Theme;
    if (stored) setTheme(stored);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark" ||
        (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
```

#### 5.3 Create Theme Toggle Component
**File:** `src/components/ThemeToggle.tsx` (new file)

- Sun/moon icon toggle button
- Dropdown with light/dark/system options
- Accessible keyboard navigation

#### 5.4 Update Layout
**File:** `src/app/layout.tsx`

- Wrap app with ThemeProvider
- Add ThemeToggle to header/footer

#### 5.5 Update Tailwind Config
**File:** `tailwind.config.ts`

```typescript
module.exports = {
  darkMode: "class",
  // ... rest of config
};
```

#### 5.6 Update Components for Dark Mode
Update existing components to use CSS variables or Tailwind dark: variants:
- `SearchForm.tsx`
- `OfficiantCard.tsx`
- `ClaimProfileForm.tsx`
- Homepage sections
- Admin pages

#### 5.7 Handle Flash of Unstyled Content
**File:** `src/app/layout.tsx`

Add inline script to set theme class before React hydration:
```html
<script>
  (function() {
    const theme = localStorage.getItem('theme') || 'system';
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    }
  })();
</script>
```

### Estimated Complexity: Medium
- Affects all components
- Need to handle SSR hydration carefully
- Consistent styling across all pages

---

## Implementation Priority

Based on complexity and user value:

| Priority | Feature | Complexity | User Value |
|----------|---------|------------|------------|
| 1 | "Near Me" Button | Low | High |
| 2 | Popular Affiliations Filter | Low | Medium |
| 3 | Dark Mode | Medium | Medium |
| 4 | City/Affiliation Landing Pages | Medium | High (SEO) |
| 5 | Admin & Data Features | Medium | Low (internal) |

### Suggested Implementation Order

1. **"Near Me" Button** - Quick win, high value for users
2. **Popular Affiliations Filter** - Simple addition, improves UX
3. **Dark Mode** - Good UX improvement, moderately complex
4. **Landing Pages** - Important for SEO, can be done incrementally
5. **Admin Features** - Internal tooling, lowest priority for users

---

## Technical Considerations

### Routing Conflicts
The city landing pages need careful routing to avoid conflicts:
- Option A: Use prefixed routes like `/city/toronto-wedding-officiants`
- Option B: Use catch-all route with explicit slug matching
- Recommendation: Option B with explicit slug list for better URLs

### Performance
- Landing pages should be statically generated
- Consider ISR (Incremental Static Regeneration) for officiant counts
- Dark mode should not cause layout shift

### Testing
- Test geolocation on mobile devices
- Test dark mode with system preference changes
- Test landing pages for SEO requirements
- Test admin features with proper auth
