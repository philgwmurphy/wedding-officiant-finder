import { Suspense } from "react";
import { Metadata } from "next";
import Link from "next/link";
import SearchForm from "@/components/SearchForm";
import OfficiantCard from "@/components/OfficiantCard";
import JsonLd from "@/components/JsonLd";
import { generateBreadcrumbSchema } from "@/lib/schema";
import type { OfficiantSearchResult } from "@/types/officiant";

interface SearchPageProps {
  searchParams: {
    location?: string;
    affiliation?: string;
    q?: string;
    radius?: string;
  };
}

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const location = searchParams.location;
  const affiliation = searchParams.affiliation;

  let title = "Search Wedding Officiants";
  let description = "Search registered wedding officiants across Ontario, Canada.";

  if (location && affiliation) {
    title = `${affiliation} Wedding Officiants near ${location}`;
    description = `Find ${affiliation} wedding officiants near ${location}, Ontario. Browse registered officiants and contact them for your ceremony.`;
  } else if (location) {
    title = `Wedding Officiants near ${location}`;
    description = `Find registered wedding officiants near ${location}, Ontario. Browse local officiants and contact them for your ceremony.`;
  } else if (affiliation) {
    title = `${affiliation} Wedding Officiants in Ontario`;
    description = `Find ${affiliation} wedding officiants in Ontario. Browse registered officiants and contact them for your ceremony.`;
  }

  return {
    title: `${title} | Ontario Officiant Finder`,
    description,
    openGraph: {
      title,
      description,
    },
  };
}

async function getSearchResults(params: SearchPageProps["searchParams"]) {
  const searchParams = new URLSearchParams();

  if (params.location) searchParams.set("location", params.location);
  if (params.affiliation) searchParams.set("affiliation", params.affiliation);
  if (params.q) searchParams.set("q", params.q);
  if (params.radius) searchParams.set("radius", params.radius);

  // Use absolute URL for server-side fetch
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  try {
    const response = await fetch(
      `${baseUrl}/api/search?${searchParams.toString()}`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      throw new Error("Search failed");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Search error:", error);
    return { success: false, results: [], error: "Search failed" };
  }
}

function SearchResultsSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="card animate-pulse">
          <div className="flex gap-4">
            <div className="w-14 h-14 bg-gray-200 rounded-full" />
            <div className="flex-1">
              <div className="h-5 bg-gray-200 rounded w-1/3 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-3" />
              <div className="h-6 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

async function SearchResults({
  searchParams,
  breadcrumbs,
}: {
  searchParams: SearchPageProps["searchParams"];
  breadcrumbs: object;
}) {
  const data = await getSearchResults(searchParams);

  if (!data.success) {
    return (
      <div className="text-center py-12">
        <JsonLd data={breadcrumbs} />
        <p className="text-gray-500">
          Something went wrong. Please try again.
        </p>
      </div>
    );
  }

  const results: OfficiantSearchResult[] = data.results;

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <JsonLd data={breadcrumbs} />
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No officiants found
        </h3>
        <p className="text-gray-500 mb-6">
          Try adjusting your search criteria or expanding your radius.
        </p>
        <Link href="/" className="btn-primary inline-block">
          Start New Search
        </Link>
      </div>
    );
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://onweddingofficiants.ca";

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: results.map((officiant, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${siteUrl}/officiant/${officiant.id}`,
      name: `${officiant.firstName} ${officiant.lastName}`,
      item: {
        "@type": "Person",
        name: `${officiant.firstName} ${officiant.lastName}`,
        affiliation: officiant.affiliation,
        address: {
          "@type": "PostalAddress",
          addressLocality: officiant.municipality,
          addressRegion: "Ontario",
          addressCountry: "CA",
        },
      },
    })),
  };

  return (
    <>
      <JsonLd data={[breadcrumbs, itemListSchema]} />
      <p className="text-sm text-gray-500 mb-6">
        Found <span className="font-medium">{results.length}</span> officiants
        {searchParams.location && (
          <>
            {" "}
            near <span className="font-medium">{searchParams.location}</span>
          </>
        )}
        {searchParams.affiliation && (
          <>
            {" "}
            matching &quot;
            <span className="font-medium">{searchParams.affiliation}</span>
            &quot;
          </>
        )}
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        {results.map((officiant) => (
          <OfficiantCard key={officiant.id} officiant={officiant} />
        ))}
      </div>
    </>
  );
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  const breadcrumbs = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Search", url: "/search" },
  ]);

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between gap-4">
              <Link
                href="/"
                className="text-xl font-bold text-violet-600 shrink-0"
              >
                Officiant Finder
              </Link>
              <SearchForm
                initialLocation={searchParams.location}
                initialAffiliation={searchParams.affiliation}
                compact
              />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-4 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {searchParams.location
                ? `Officiants near ${searchParams.location}`
                : "Search Results"}
            </h1>
          </div>

          <Suspense fallback={<SearchResultsSkeleton />}>
            <SearchResults breadcrumbs={breadcrumbs} searchParams={searchParams} />
          </Suspense>
        </main>
      </div>
    </>
  );
}
