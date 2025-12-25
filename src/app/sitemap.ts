import { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { CITY_LANDING_PAGES, AFFILIATION_LANDING_PAGES } from "@/lib/landing-pages";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://onweddingofficiants.ca";

// Use anon key for read operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

async function getAllOfficiantIds(): Promise<number[]> {
  const { data, error } = await supabase
    .from("officiants")
    .select("id")
    .order("id");

  if (error) {
    console.error("Failed to fetch officiant IDs for sitemap:", error);
    return [];
  }

  return (data || []).map((row) => row.id);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const officiantIds = await getAllOfficiantIds();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/search`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  const officiantPages: MetadataRoute.Sitemap = officiantIds.map((id) => ({
    url: `${SITE_URL}/officiant/${id}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const cityPages: MetadataRoute.Sitemap = CITY_LANDING_PAGES.map((city) => ({
    url: `${SITE_URL}/${city.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const affiliationPages: MetadataRoute.Sitemap = AFFILIATION_LANDING_PAGES.map((aff) => ({
    url: `${SITE_URL}/affiliation/${aff.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...cityPages, ...affiliationPages, ...officiantPages];
}
