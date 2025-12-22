import type { Officiant } from "@/types/officiant";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://onweddingofficiants.ca";
const SITE_NAME = "Ontario Officiant Finder";

/**
 * Generate WebSite schema with search action
 */
export function generateWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: "Find registered wedding officiants across Ontario, Canada. Search by location, affiliation, and more.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/search?location={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * Generate Organization schema
 */
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description: "Ontario Officiant Finder helps couples find registered wedding officiants across Ontario, Canada.",
    sameAs: [],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: ["English", "French"],
    },
  };
}

/**
 * Generate FAQPage schema for AEO
 */
export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generate Person schema for officiant profile
 */
export function generatePersonSchema(officiant: Officiant, claimed?: boolean) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: `${officiant.firstName} ${officiant.lastName}`,
    jobTitle: "Wedding Officiant",
    description: `Registered wedding officiant in ${officiant.municipality}, Ontario. Affiliated with ${officiant.affiliation}.`,
    address: {
      "@type": "PostalAddress",
      addressLocality: officiant.municipality,
      addressRegion: "Ontario",
      addressCountry: "CA",
    },
    ...(claimed && {
      isAcceptingNewPatients: true,
    }),
  };
}

/**
 * Generate BreadcrumbList schema
 */
export function generateBreadcrumbSchema(
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}

/**
 * Generate LocalBusiness schema for officiant (if claimed)
 */
export function generateLocalBusinessSchema(
  officiant: Officiant,
  contactInfo?: { email?: string; phone?: string; website?: string }
) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${SITE_URL}/officiant/${officiant.id}`,
    name: `${officiant.firstName} ${officiant.lastName} - Wedding Officiant`,
    description: `Professional wedding officiant serving ${officiant.municipality} and surrounding areas in Ontario.`,
    address: {
      "@type": "PostalAddress",
      addressLocality: officiant.municipality,
      addressRegion: "Ontario",
      addressCountry: "CA",
    },
    ...(contactInfo?.email && { email: contactInfo.email }),
    ...(contactInfo?.phone && { telephone: contactInfo.phone }),
    ...(contactInfo?.website && { url: contactInfo.website }),
    priceRange: "$$",
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    },
  };
}

/**
 * Common FAQ content for the homepage
 */
export const HOMEPAGE_FAQS = [
  {
    question: "How do I find a wedding officiant in Ontario?",
    answer:
      "Use our search tool to find registered wedding officiants by location. Enter your city or postal code, set a search radius, and browse officiants near you. All officiants listed are officially registered with the Province of Ontario.",
  },
  {
    question: "What types of wedding officiants are available in Ontario?",
    answer:
      "Ontario has several types of officiants: Religious officiants (ordained ministers, priests, rabbis, imams), Civil officiants (judges, justices of the peace), and Independent officiants who can perform secular or spiritual ceremonies. You can filter by affiliation in our search.",
  },
  {
    question: "How much does a wedding officiant cost in Ontario?",
    answer:
      "Wedding officiant fees in Ontario typically range from $300 to $800, depending on the officiant's experience, ceremony customization, travel distance, and additional services like rehearsal attendance. Some religious officiants may have set fees or accept donations.",
  },
  {
    question: "Can I have a non-religious wedding ceremony in Ontario?",
    answer:
      "Yes, Ontario fully supports secular wedding ceremonies. You can choose an independent officiant who specializes in non-religious ceremonies, or a civil officiant. Many couples opt for personalized secular ceremonies that reflect their values and relationship.",
  },
  {
    question: "How far in advance should I book a wedding officiant?",
    answer:
      "It's recommended to book your officiant 6-12 months before your wedding date, especially for popular wedding seasons (May-October). This gives you time to meet, plan your ceremony, and ensure availability. Some sought-after officiants book up to a year in advance.",
  },
  {
    question: "Is my wedding officiant legally registered?",
    answer:
      "All officiants in our directory are sourced directly from the Ontario government's official registry. This ensures they are legally authorized to perform marriages in Ontario. You can verify registration through our search or the provincial registry.",
  },
];
