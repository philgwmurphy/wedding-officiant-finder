import { Metadata } from "next";
import Link from "next/link";
import { PRICING_TIERS } from "@/types/monetization";

export const metadata: Metadata = {
  title: "Pricing - Officiant Finder",
  description:
    "Choose the right plan for your wedding officiant business. Free, Premium, and Featured tiers available.",
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="bg-[var(--background-card)] border-b border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link
            href="/"
            className="text-xl font-bold text-[var(--primary)]"
          >
            Officiant Finder
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] mb-4">
            Grow Your Officiant Business
          </h1>
          <p className="text-lg text-[var(--muted)] max-w-2xl mx-auto">
            Stand out from over 22,000 registered officiants in Ontario. Choose
            a plan that fits your needs.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {PRICING_TIERS.map((tier) => (
            <div
              key={tier.id}
              className={`card relative ${
                tier.highlighted
                  ? "ring-2 ring-[var(--primary)] scale-105"
                  : ""
              }`}
            >
              {tier.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[var(--primary)] text-white text-sm font-medium px-4 py-1 rounded-full">
                  Most Popular
                </div>
              )}

              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-[var(--foreground)]">
                  {tier.name}
                </h2>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-[var(--foreground)]">
                    ${tier.price}
                  </span>
                  {tier.price > 0 && (
                    <span className="text-[var(--muted)]">/{tier.interval}</span>
                  )}
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {tier.features.map((feature, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm text-[var(--foreground)]"
                  >
                    <svg
                      className="w-5 h-5 text-green-500 shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href={tier.id === "free" ? "/" : "/dashboard/login"}
                className={`block text-center py-3 px-6 rounded-lg font-medium transition-colors ${
                  tier.highlighted
                    ? "bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)]"
                    : "bg-[var(--secondary)] text-[var(--foreground)] hover:bg-[var(--border)]"
                }`}
              >
                {tier.id === "free" ? "Find Your Profile" : "Get Started"}
              </Link>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-[var(--foreground)] text-center mb-8">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <FaqItem
              question="How do I get started?"
              answer="First, find your profile on our site by searching for your name. Once you find it, click 'Claim Profile' and verify your email. After your profile is approved, you can access your dashboard to upgrade to Premium or Featured."
            />
            <FaqItem
              question="Can I cancel anytime?"
              answer="Yes! You can cancel your subscription at any time from your dashboard. Your premium features will remain active until the end of your billing period."
            />
            <FaqItem
              question="What payment methods do you accept?"
              answer="We accept all major credit cards through our secure payment provider, Stripe. Your payment information is never stored on our servers."
            />
            <FaqItem
              question="How does Featured placement work?"
              answer="Featured officiants appear at the top of search results in their local area. This increases your visibility to couples searching for officiants nearby."
            />
            <FaqItem
              question="Do I need to pay to be listed?"
              answer="No! Basic listings are completely free. All registered Ontario officiants are automatically included in our database from the official registry. Premium and Featured plans offer additional features to help you stand out."
            />
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16 p-8 bg-[var(--secondary)] rounded-xl">
          <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">
            Ready to get more bookings?
          </h2>
          <p className="text-[var(--muted)] mb-6">
            Join hundreds of officiants who have grown their business with us.
          </p>
          <Link
            href="/"
            className="inline-block bg-[var(--primary)] text-white px-8 py-3 rounded-lg font-medium hover:bg-[var(--primary-dark)] transition-colors"
          >
            Find Your Profile
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-[var(--border)] mt-16">
        <div className="max-w-6xl mx-auto text-center text-sm text-[var(--muted)]">
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
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="card">
      <h3 className="font-semibold text-[var(--foreground)] mb-2">{question}</h3>
      <p className="text-[var(--muted)] text-sm">{answer}</p>
    </div>
  );
}
