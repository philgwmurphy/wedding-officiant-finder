/**
 * Landing page data for SEO-optimized city and affiliation pages
 */

export interface CityLandingPage {
  slug: string;
  city: string;
  lat: number;
  lng: number;
  description?: string;
}

export interface AffiliationLandingPage {
  slug: string;
  affiliation: string;
  label: string;
  description?: string;
}

/**
 * Popular affiliations for quick filter chips
 */
export const POPULAR_AFFILIATIONS = [
  { label: "Non-denominational", value: "Non-denominational" },
  { label: "Catholic", value: "Catholic" },
  { label: "Anglican", value: "Anglican" },
  { label: "United Church", value: "United Church" },
  { label: "Jewish", value: "Jewish" },
  { label: "Muslim", value: "Muslim" },
  { label: "Hindu", value: "Hindu" },
  { label: "Humanist", value: "Humanist" },
  { label: "Spiritual", value: "Spiritual" },
] as const;

/**
 * Major Ontario cities for landing pages
 * Coordinates are city center approximations
 */
export const CITY_LANDING_PAGES: CityLandingPage[] = [
  { slug: "toronto", city: "Toronto", lat: 43.6532, lng: -79.3832 },
  { slug: "ottawa", city: "Ottawa", lat: 45.4215, lng: -75.6972 },
  { slug: "mississauga", city: "Mississauga", lat: 43.589, lng: -79.6441 },
  { slug: "brampton", city: "Brampton", lat: 43.7315, lng: -79.7624 },
  { slug: "hamilton", city: "Hamilton", lat: 43.2557, lng: -79.8711 },
  { slug: "london", city: "London", lat: 42.9849, lng: -81.2453 },
  { slug: "markham", city: "Markham", lat: 43.8561, lng: -79.337 },
  { slug: "vaughan", city: "Vaughan", lat: 43.8371, lng: -79.5083 },
  { slug: "kitchener", city: "Kitchener", lat: 43.4516, lng: -80.4925 },
  { slug: "windsor", city: "Windsor", lat: 42.3149, lng: -83.0364 },
  { slug: "richmond-hill", city: "Richmond Hill", lat: 43.8828, lng: -79.4403 },
  { slug: "oakville", city: "Oakville", lat: 43.4675, lng: -79.6877 },
  { slug: "burlington", city: "Burlington", lat: 43.3255, lng: -79.799 },
  { slug: "greater-sudbury", city: "Greater Sudbury", lat: 46.4917, lng: -80.993 },
  { slug: "oshawa", city: "Oshawa", lat: 43.8971, lng: -78.8658 },
  { slug: "barrie", city: "Barrie", lat: 44.3894, lng: -79.6903 },
  { slug: "st-catharines", city: "St. Catharines", lat: 43.1594, lng: -79.2469 },
  { slug: "cambridge", city: "Cambridge", lat: 43.3616, lng: -80.3144 },
  { slug: "kingston", city: "Kingston", lat: 44.2312, lng: -76.486 },
  { slug: "guelph", city: "Guelph", lat: 43.5448, lng: -80.2482 },
  { slug: "waterloo", city: "Waterloo", lat: 43.4643, lng: -80.5204 },
  { slug: "thunder-bay", city: "Thunder Bay", lat: 48.3809, lng: -89.2477 },
  { slug: "niagara-falls", city: "Niagara Falls", lat: 43.0896, lng: -79.0849 },
  { slug: "peterborough", city: "Peterborough", lat: 44.3091, lng: -78.3197 },
  { slug: "newmarket", city: "Newmarket", lat: 44.0592, lng: -79.4614 },
];

/**
 * Common affiliations for landing pages
 */
export const AFFILIATION_LANDING_PAGES: AffiliationLandingPage[] = [
  {
    slug: "non-denominational",
    affiliation: "Non-denominational",
    label: "Non-denominational",
    description: "secular and inclusive ceremonies",
  },
  {
    slug: "catholic",
    affiliation: "Catholic",
    label: "Catholic",
    description: "Catholic wedding ceremonies",
  },
  {
    slug: "anglican",
    affiliation: "Anglican",
    label: "Anglican",
    description: "Anglican/Episcopal wedding ceremonies",
  },
  {
    slug: "united-church",
    affiliation: "United Church",
    label: "United Church",
    description: "United Church of Canada ceremonies",
  },
  {
    slug: "jewish",
    affiliation: "Jewish",
    label: "Jewish",
    description: "Jewish wedding ceremonies",
  },
  {
    slug: "muslim",
    affiliation: "Muslim",
    label: "Muslim/Islamic",
    description: "Islamic wedding ceremonies",
  },
  {
    slug: "hindu",
    affiliation: "Hindu",
    label: "Hindu",
    description: "Hindu wedding ceremonies",
  },
  {
    slug: "sikh",
    affiliation: "Sikh",
    label: "Sikh",
    description: "Sikh wedding ceremonies",
  },
  {
    slug: "buddhist",
    affiliation: "Buddhist",
    label: "Buddhist",
    description: "Buddhist wedding ceremonies",
  },
  {
    slug: "baptist",
    affiliation: "Baptist",
    label: "Baptist",
    description: "Baptist wedding ceremonies",
  },
  {
    slug: "presbyterian",
    affiliation: "Presbyterian",
    label: "Presbyterian",
    description: "Presbyterian wedding ceremonies",
  },
  {
    slug: "lutheran",
    affiliation: "Lutheran",
    label: "Lutheran",
    description: "Lutheran wedding ceremonies",
  },
  {
    slug: "orthodox",
    affiliation: "Orthodox",
    label: "Orthodox Christian",
    description: "Orthodox Christian wedding ceremonies",
  },
  {
    slug: "humanist",
    affiliation: "Humanist",
    label: "Humanist",
    description: "secular humanist ceremonies",
  },
  {
    slug: "spiritual",
    affiliation: "Spiritual",
    label: "Spiritual",
    description: "spiritual but non-religious ceremonies",
  },
];

/**
 * Get city landing page by slug
 */
export function getCityBySlug(slug: string): CityLandingPage | undefined {
  return CITY_LANDING_PAGES.find((city) => city.slug === slug);
}

/**
 * Get affiliation landing page by slug
 */
export function getAffiliationBySlug(slug: string): AffiliationLandingPage | undefined {
  return AFFILIATION_LANDING_PAGES.find((aff) => aff.slug === slug);
}
