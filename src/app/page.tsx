import SearchForm from "@/components/SearchForm";
import JsonLd from "@/components/JsonLd";
import {
  generateWebsiteSchema,
  generateOrganizationSchema,
  generateFAQSchema,
  HOMEPAGE_FAQS,
} from "@/lib/schema";

export default function Home() {
  const schemas = [
    generateWebsiteSchema(),
    generateOrganizationSchema(),
    generateFAQSchema(HOMEPAGE_FAQS),
  ];
  return (
    <>
      <JsonLd data={schemas} />
      <div className="min-h-screen flex flex-col">
        {/* Hero Section */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 md:py-24">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 text-balance">
            Find your perfect
            <span className="text-violet-600"> wedding officiant</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto text-balance">
            Search over 22,000 registered officiants across Ontario. Find
            someone who matches your ceremony style and location.
          </p>
        </div>

        {/* Search Form */}
        <SearchForm />

        {/* Trust indicators */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
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
      <section className="py-16 px-4 bg-white border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-violet-600"
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
              <h3 className="font-semibold text-gray-900 mb-2">
                Search by Location
              </h3>
              <p className="text-gray-600 text-sm">
                Enter your wedding location and find officiants nearby, sorted
                by distance.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-violet-600"
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
              <h3 className="font-semibold text-gray-900 mb-2">
                Filter by Style
              </h3>
              <p className="text-gray-600 text-sm">
                Looking for a specific denomination or secular ceremony? Filter
                by affiliation.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-violet-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Generate Your Inquiry
              </h3>
              <p className="text-gray-600 text-sm">
                Use our AI to craft a personalized inquiry email that gets
                responses.
              </p>
            </div>
          </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-4 bg-gray-50 border-t border-gray-100">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-12">
              Frequently Asked Questions
            </h2>

            <div className="space-y-6">
              {HOMEPAGE_FAQS.map((faq, index) => (
                <div key={index} className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
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
                className="text-violet-600 hover:underline"
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
