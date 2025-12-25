import Link from "next/link";
import SearchForm from "@/components/SearchForm";
import JsonLd from "@/components/JsonLd";
import ThemeToggle from "@/components/ThemeToggle";
import {
  generateWebsiteSchema,
  generateOrganizationSchema,
  generateFAQSchema,
  HOMEPAGE_FAQS,
} from "@/lib/schema";
import { CITY_LANDING_PAGES, AFFILIATION_LANDING_PAGES } from "@/lib/landing-pages";

export default function Home() {
  const schemas = [
    generateWebsiteSchema(),
    generateOrganizationSchema(),
    generateFAQSchema(HOMEPAGE_FAQS),
  ];
  return (
    <>
      <JsonLd data={schemas} />
      <div className="min-h-screen flex flex-col bg-[var(--background)]">
        {/* Header */}
        <header className="absolute top-0 right-0 p-4">
          <ThemeToggle />
        </header>

        {/* Hero Section */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 md:py-24">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--foreground)] mb-4 text-balance">
            Find your perfect
            <span className="text-[var(--primary)]"> wedding officiant</span>
          </h1>
          <p className="text-lg md:text-xl text-[var(--muted)] max-w-2xl mx-auto text-balance">
            Search over 22,000 registered officiants across Ontario. Find
            someone who matches your ceremony style and location.
          </p>
        </div>

        {/* Search Form */}
        <SearchForm />

        {/* Trust indicators */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-[var(--muted)]">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-green-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>Official Ontario Registry Data</span>
          </div>
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-green-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>22,000+ Registered Officiants</span>
          </div>
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-green-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>Free to Use</span>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="py-16 px-4 bg-[var(--background-card)] border-t border-[var(--border)]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-[var(--foreground)] mb-12">
            How It Works
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-[var(--secondary)] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-[var(--primary)]"
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
              <h3 className="font-semibold text-[var(--foreground)] mb-2">
                Search by Location
              </h3>
              <p className="text-[var(--muted)] text-sm">
                Enter your wedding location and find officiants nearby, sorted
                by distance.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-[var(--secondary)] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-[var(--primary)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-[var(--foreground)] mb-2">
                Filter by Style
              </h3>
              <p className="text-[var(--muted)] text-sm">
                Looking for a specific denomination or secular ceremony? Filter
                by affiliation.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-[var(--secondary)] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-[var(--primary)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-[var(--foreground)] mb-2">
                View Officiant Profiles
              </h3>
              <p className="text-[var(--muted)] text-sm">
                Browse detailed profiles and find the perfect match for your
                ceremony style.
              </p>
            </div>
          </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-4 bg-[var(--secondary)] border-t border-[var(--border)]">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-[var(--foreground)] mb-12">
              Frequently Asked Questions
            </h2>

            <div className="space-y-6">
              {HOMEPAGE_FAQS.map((faq, index) => (
                <div key={index} className="bg-[var(--background-card)] rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-[var(--foreground)] mb-3">
                    {faq.question}
                  </h3>
                  <p className="text-[var(--muted)] leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Popular Searches Section */}
        <section className="py-12 px-4 bg-[var(--background-card)] border-t border-[var(--border)]">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-xl font-bold text-[var(--foreground)] mb-6">
              Popular Searches
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-[var(--foreground)] mb-3">By City</h3>
                <div className="flex flex-wrap gap-2">
                  {CITY_LANDING_PAGES.slice(0, 12).map((city) => (
                    <Link
                      key={city.slug}
                      href={`/${city.slug}`}
                      className="text-sm text-[var(--primary)] hover:text-[var(--primary-dark)] hover:underline"
                    >
                      {city.city}
                    </Link>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-[var(--foreground)] mb-3">By Ceremony Type</h3>
                <div className="flex flex-wrap gap-2">
                  {AFFILIATION_LANDING_PAGES.slice(0, 10).map((aff) => (
                    <Link
                      key={aff.slug}
                      href={`/affiliation/${aff.slug}`}
                      className="text-sm text-[var(--primary)] hover:text-[var(--primary-dark)] hover:underline"
                    >
                      {aff.label}
                    </Link>
                  ))}
                </div>
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
            <p className="mt-2">
              This is an independent project and is not affiliated with the
              Government of Ontario.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
