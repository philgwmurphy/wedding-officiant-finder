import { Suspense } from "react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SearchForm from "@/components/SearchForm";
import OfficiantCard from "@/components/OfficiantCard";
import JsonLd from "@/components/JsonLd";
import { generateBreadcrumbSchema } from "@/lib/schema";
import { AFFILIATION_LANDING_PAGES, getAffiliationBySlug } from "@/lib/landing-pages";
import type { OfficiantSearchResult } from "@/types/officiant";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://onweddingofficiants.ca";

interface AffiliationPageProps {
  params: { affiliationSlug: string };
}

export function generateStaticParams() {
  return AFFILIATION_LANDING_PAGES.map((aff) => ({
    affiliationSlug: aff.slug,
  }));
}

export async function generateMetadata({ params }: AffiliationPageProps): Promise<Metadata> {
  const affiliation = getAffiliationBySlug(params.affiliationSlug);

  if (!affiliation) {
    return { title: "Not Found" };
  }

  const title = `${affiliation.label} Wedding Officiants in Ontario`;
  const description = `Find ${affiliation.label} wedding officiants across Ontario, Canada. Browse registered officiants for ${affiliation.description || affiliation.label.toLowerCase() + " ceremonies"}.`;

  return {
    title: `${title} | Ontario Officiant Finder`,
    description,
    openGraph: {
      title,
      description,
    },
    alternates: {
      canonical: `${SITE_URL}/affiliation/${affiliation.slug}`,
    },
  };
}

async function getOfficiantsByAffiliation(affiliation: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  try {
    const params = new URLSearchParams({
      affiliation,
    });

    const response = await fetch(`${baseUrl}/api/search?${params}`, {
      next: { revalidate: 3600 }, // Revalidate every hour
    });

    if (!response.ok) {
      throw new Error("Search failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Affiliation page search error:", error);
    return { success: false, results: [] };
  }
}

function ResultsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="card animate-pulse">
          <div className="flex gap-4">
            <div className="w-14 h-14 bg-[var(--secondary)] rounded-full" />
            <div className="flex-1">
              <div className="h-5 bg-[var(--secondary)] rounded w-1/3 mb-2" />
              <div className="h-4 bg-[var(--secondary)] rounded w-1/4 mb-3" />
              <div className="h-6 bg-[var(--secondary)] rounded w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

async function AffiliationResults({ affiliation }: { affiliation: { affiliation: string; label: string; slug: string } }) {
  const data = await getOfficiantsByAffiliation(affiliation.affiliation);
  const results: OfficiantSearchResult[] = data.results || [];

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--muted)] mb-4">
          No {affiliation.label} officiants found. Try a different search.
        </p>
        <Link href="/" className="btn-primary inline-block">
          Search All Officiants
        </Link>
      </div>
    );
  }

  return (
    <>
      <p className="text-sm text-[var(--muted)] mb-6">
        Found <span className="font-medium">{results.length}</span>{" "}
        <span className="font-medium">{affiliation.label}</span> officiants in Ontario
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        {results.map((officiant) => (
          <OfficiantCard key={officiant.id} officiant={officiant} />
        ))}
      </div>
    </>
  );
}

export default function AffiliationLandingPage({ params }: AffiliationPageProps) {
  const affiliation = getAffiliationBySlug(params.affiliationSlug);

  if (!affiliation) {
    notFound();
  }

  const breadcrumbs = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: affiliation.label, url: `/affiliation/${affiliation.slug}` },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbs} />
      <div className="min-h-screen bg-[var(--background)]">
        {/* Header */}
        <header className="bg-[var(--background-card)] border-b border-[var(--border)]">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between gap-4">
              <Link href="/" className="text-xl font-bold text-[var(--primary)] shrink-0">
                Officiant Finder
              </Link>
              <SearchForm initialAffiliation={affiliation.affiliation} compact />
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="bg-[var(--background-card)] border-b border-[var(--border)]">
          <div className="max-w-6xl mx-auto px-4 py-12">
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] mb-4">
              {affiliation.label} Wedding Officiants in Ontario
            </h1>
            <p className="text-lg text-[var(--muted)] max-w-2xl">
              Find registered {affiliation.label} wedding officiants across Ontario.
              {affiliation.description && ` Browse officiants for ${affiliation.description}.`}
            </p>
          </div>
        </section>

        {/* Results */}
        <main className="max-w-6xl mx-auto px-4 py-8">
          <Suspense fallback={<ResultsSkeleton />}>
            <AffiliationResults affiliation={affiliation} />
          </Suspense>
        </main>

        {/* FAQ Section */}
        <section className="bg-[var(--background-card)] border-t border-[var(--border)] py-12">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-[var(--foreground)] mb-8">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              <div className="bg-[var(--secondary)] rounded-xl p-6">
                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                  What is a {affiliation.label} wedding ceremony?
                </h3>
                <p className="text-[var(--muted)]">
                  A {affiliation.label} wedding ceremony is performed by an officiant
                  affiliated with {affiliation.label} traditions. These officiants can
                  incorporate specific religious or cultural elements into your ceremony.
                </p>
              </div>
              <div className="bg-[var(--secondary)] rounded-xl p-6">
                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                  Can a {affiliation.label} officiant perform my wedding anywhere in Ontario?
                </h3>
                <p className="text-[var(--muted)]">
                  Yes, all officiants listed on this site are registered with the Province
                  of Ontario and can legally perform marriages anywhere in the province.
                </p>
              </div>
              <div className="bg-[var(--secondary)] rounded-xl p-6">
                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                  How do I contact a {affiliation.label} officiant?
                </h3>
                <p className="text-[var(--muted)]">
                  Browse the officiants listed above and click on their profile to view
                  more details. Some officiants have claimed their profile and added
                  contact information.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-4 border-t border-[var(--border)]">
          <div className="max-w-5xl mx-auto text-center text-sm text-[var(--muted)]">
            <p>
              Data sourced from the{" "}
              <a
                href="https://data.ontario.ca/dataset/registered-marriage-officiants"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--primary)] hover:underline"
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
