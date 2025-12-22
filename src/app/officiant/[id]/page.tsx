import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getOfficiantById, getApprovedClaim } from "@/lib/supabase";
import EmailGenerator from "@/components/EmailGenerator";
import ClaimProfile from "@/components/ClaimProfile";
import JsonLd from "@/components/JsonLd";
import {
  generatePersonSchema,
  generateBreadcrumbSchema,
  generateLocalBusinessSchema,
} from "@/lib/schema";

interface OfficiantPageProps {
  params: { id: string };
}

export async function generateMetadata({
  params,
}: OfficiantPageProps): Promise<Metadata> {
  const id = parseInt(params.id);
  if (isNaN(id)) {
    return { title: "Officiant Not Found" };
  }

  const officiant = await getOfficiantById(id);
  if (!officiant) {
    return { title: "Officiant Not Found" };
  }

  const title = `${officiant.firstName} ${officiant.lastName} - Wedding Officiant in ${officiant.municipality}`;
  const description = `Book ${officiant.firstName} ${officiant.lastName}, a registered wedding officiant in ${officiant.municipality}, Ontario. Affiliated with ${officiant.affiliation}.`;

  return {
    title: `${title} | Ontario Officiant Finder`,
    description,
    openGraph: {
      title,
      description,
    },
  };
}

export default async function OfficiantPage({ params }: OfficiantPageProps) {
  const id = parseInt(params.id);

  if (isNaN(id)) {
    notFound();
  }

  const officiant = await getOfficiantById(id);

  if (!officiant) {
    notFound();
  }

  // Check if profile is claimed and approved
  const approvedClaim = await getApprovedClaim(id);

  // Generate initials for avatar
  const initials =
    `${officiant.firstName.charAt(0)}${officiant.lastName.charAt(0)}`.toUpperCase();

  // Build structured data schemas
  const schemas: object[] = [
    generatePersonSchema(officiant, !!approvedClaim),
    generateBreadcrumbSchema([
      { name: "Home", url: "/" },
      { name: "Search", url: "/search" },
      { name: `${officiant.firstName} ${officiant.lastName}`, url: `/officiant/${officiant.id}` },
    ]),
  ];

  // Add LocalBusiness schema if profile is claimed
  if (approvedClaim) {
    schemas.push(
      generateLocalBusinessSchema(officiant, {
        email: approvedClaim.email,
        phone: approvedClaim.phone,
        website: approvedClaim.website,
      })
    );
  }

  return (
    <>
      <JsonLd data={schemas} />
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to search
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="md:col-span-1">
            <div className="card sticky top-8">
              {/* Avatar */}
              <div className="w-20 h-20 bg-violet-100 rounded-full flex items-center justify-center text-2xl font-bold text-violet-700 mx-auto mb-4">
                {initials}
              </div>

              {/* Name */}
              <h1 className="text-xl font-bold text-gray-900 text-center mb-1">
                {officiant.firstName} {officiant.lastName}
              </h1>

              {/* Location */}
              <p className="text-gray-600 text-center mb-4 flex items-center justify-center gap-1">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {officiant.municipality}
              </p>

              {/* Affiliation */}
              <div className="border-t border-gray-100 pt-4 mt-4">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Affiliation
                </h3>
                <p className="text-gray-900">{officiant.affiliation}</p>
              </div>

              {/* Contact Info (if claimed and approved) */}
              {approvedClaim && (
                <div className="border-t border-gray-100 pt-4 mt-4">
                  <div className="flex items-center gap-2 text-sm text-violet-600 font-medium mb-3">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Verified Profile
                  </div>
                  <div className="space-y-2 text-sm">
                    {approvedClaim.email && (
                      <a
                        href={`mailto:${approvedClaim.email}`}
                        className="flex items-center gap-2 text-gray-700 hover:text-violet-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {approvedClaim.email}
                      </a>
                    )}
                    {approvedClaim.phone && (
                      <a
                        href={`tel:${approvedClaim.phone}`}
                        className="flex items-center gap-2 text-gray-700 hover:text-violet-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {approvedClaim.phone}
                      </a>
                    )}
                    {approvedClaim.website && (
                      <a
                        href={approvedClaim.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-gray-700 hover:text-violet-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                        Website
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Registry Badge */}
              <div className="border-t border-gray-100 pt-4 mt-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
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
                  <span>Registered with Ontario</span>
                </div>
              </div>

              {/* Claim Profile Button (if not claimed) */}
              {!approvedClaim && (
                <div className="border-t border-gray-100 pt-4 mt-4">
                  <ClaimProfile
                    officiantId={officiant.id}
                    officiantName={`${officiant.firstName} ${officiant.lastName}`}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Email Generator */}
          <div className="md:col-span-2">
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Contact {officiant.firstName}
              </h2>
              <p className="text-gray-600 text-sm mb-6">
                Fill in your details and we&apos;ll generate a personalized
                inquiry email for you to send.
              </p>

              <EmailGenerator
                officiant={{
                  firstName: officiant.firstName,
                  lastName: officiant.lastName,
                  affiliation: officiant.affiliation,
                }}
              />
            </div>
          </div>
        </div>
      </main>
      </div>
    </>
  );
}
