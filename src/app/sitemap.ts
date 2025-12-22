import { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

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

  return [...staticPages, ...officiantPages];
}
