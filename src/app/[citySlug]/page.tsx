import { Suspense } from "react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SearchForm from "@/components/SearchForm";
import OfficiantCard from "@/components/OfficiantCard";
import JsonLd from "@/components/JsonLd";
import { generateBreadcrumbSchema } from "@/lib/schema";
import { CITY_LANDING_PAGES, getCityBySlug } from "@/lib/landing-pages";
import type { OfficiantSearchResult } from "@/types/officiant";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://onweddingofficiants.ca";

interface CityPageProps {
  params: { citySlug: string };
}

export function generateStaticParams() {
  return CITY_LANDING_PAGES.map((city) => ({
    citySlug: city.slug,
  }));
}

export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  const city = getCityBySlug(params.citySlug);

  if (!city) {
    return { title: "Not Found" };
  }

  const title = `Wedding Officiants in ${city.city}, Ontario`;
  const description = `Find registered wedding officiants in ${city.city}, Ontario. Browse local officiants near you and contact them for your ceremony.`;

  return {
    title: `${title} | Ontario Officiant Finder`,
    description,
    openGraph: {
      title,
      description,
    },
    alternates: {
      canonical: `${SITE_URL}/${city.slug}`,
    },
  };
}

async function getOfficiantsForCity(lat: number, lng: number, radius: number = 25) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  try {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lng: lng.toString(),
      radius: radius.toString(),
    });

    const response = await fetch(`${baseUrl}/api/search?${params}`, {
      next: { revalidate: 3600 }, // Revalidate every hour
    });

    if (!response.ok) {
      throw new Error("Search failed");
    }

    return await response.json();
  } catch (error) {
    console.error("City page search error:", error);
    return { success: false, results: [] };
  }
}

function ResultsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {[...Array(6)].map((_, i) => (
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

async function CityResults({ city }: { city: { city: string; lat: number; lng: number; slug: string } }) {
  const data = await getOfficiantsForCity(city.lat, city.lng);
  const results: OfficiantSearchResult[] = data.results || [];

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">
          No officiants found near {city.city}. Try expanding your search.
        </p>
        <Link href="/" className="btn-primary inline-block">
          Search All Officiants
        </Link>
      </div>
    );
  }

  return (
    <>
      <p className="text-sm text-gray-500 mb-6">
        Found <span className="font-medium">{results.length}</span> officiants
        near <span className="font-medium">{city.city}</span>
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        {results.map((officiant) => (
          <OfficiantCard key={officiant.id} officiant={officiant} />
        ))}
      </div>
    </>
  );
}

export default function CityLandingPage({ params }: CityPageProps) {
  const city = getCityBySlug(params.citySlug);

  if (!city) {
    notFound();
  }

  const breadcrumbs = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: city.city, url: `/${city.slug}` },
  ]);

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: `Wedding Officiants in ${city.city}`,
    description: `Find registered wedding officiants in ${city.city}, Ontario`,
    areaServed: {
      "@type": "City",
      name: city.city,
      containedInPlace: {
        "@type": "AdministrativeArea",
        name: "Ontario",
      },
    },
    url: `${SITE_URL}/${city.slug}`,
  };

  return (
    <>
      <JsonLd data={[breadcrumbs, localBusinessSchema]} />
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between gap-4">
              <Link href="/" className="text-xl font-bold text-[#7D9A82] shrink-0">
                Officiant Finder
              </Link>
              <SearchForm initialLocation={city.city} compact />
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="bg-white border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 py-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Wedding Officiants in {city.city}
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl">
              Find registered wedding officiants near {city.city}, Ontario.
              Browse local officiants and contact them for your ceremony.
            </p>
          </div>
        </section>

        {/* Results */}
        <main className="max-w-6xl mx-auto px-4 py-8">
          <Suspense fallback={<ResultsSkeleton />}>
            <CityResults city={city} />
          </Suspense>
        </main>

        {/* FAQ Section */}
        <section className="bg-white border-t border-gray-100 py-12">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  How do I find a wedding officiant in {city.city}?
                </h3>
                <p className="text-gray-600">
                  Browse our list of registered wedding officiants above, or use the search
                  form to filter by ceremony type. All officiants listed are registered with
                  the Province of Ontario.
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  What types of wedding ceremonies can officiants in {city.city} perform?
                </h3>
                <p className="text-gray-600">
                  Officiants in {city.city} can perform various ceremony types including
                  religious ceremonies (Catholic, Anglican, Jewish, Muslim, Hindu, and more),
                  non-denominational, and secular/civil ceremonies.
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Are these officiants legally authorized to perform marriages?
                </h3>
                <p className="text-gray-600">
                  Yes, all officiants listed on this site are registered with the Province
                  of Ontario and are legally authorized to perform marriages in Ontario.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-4 border-t border-gray-100">
          <div className="max-w-5xl mx-auto text-center text-sm text-gray-500">
            <p>
              Data sourced from the{" "}
              <a
                href="https://data.ontario.ca/dataset/registered-marriage-officiants"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#7D9A82] hover:underline"
              >
                Ontario Data Catalogue
              </a>
              . Updated regularly.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
