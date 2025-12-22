import Link from "next/link";
import type { OfficiantSearchResult } from "@/types/officiant";

interface OfficiantCardProps {
  officiant: OfficiantSearchResult;
}

export default function OfficiantCard({ officiant }: OfficiantCardProps) {
  // Generate initials for avatar
  const initials =
    `${officiant.firstName.charAt(0)}${officiant.lastName.charAt(0)}`.toUpperCase();

  // Format distance
  const distanceText =
    officiant.distance !== undefined
      ? officiant.distance < 1
        ? "< 1 km away"
        : `${Math.round(officiant.distance)} km away`
      : null;

  // Determine affiliation category for styling
  const affiliationCategory = getAffiliationCategory(officiant.affiliation);

  return (
    <Link href={`/officiant/${officiant.id}`}>
      <article className="card group cursor-pointer">
        <div className="flex gap-4">
          {/* Avatar */}
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-semibold shrink-0 ${affiliationCategory.bgColor} ${affiliationCategory.textColor}`}
          >
            {initials}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-gray-900 group-hover:text-violet-600 transition-colors">
                  {officiant.firstName} {officiant.lastName}
                </h3>
                <p className="text-sm text-gray-600 mt-0.5">
                  {officiant.municipality}
                </p>
              </div>

              {distanceText && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full whitespace-nowrap">
                  {distanceText}
                </span>
              )}
            </div>

            {/* Affiliation */}
            <div className="mt-3">
              <span
                className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full ${affiliationCategory.pillBg} ${affiliationCategory.pillText}`}
              >
                {officiant.affiliation}
              </span>
            </div>
          </div>
        </div>

        {/* Hover indicator */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-sm">
          <span className="text-gray-500">View profile</span>
          <svg
            className="w-4 h-4 text-gray-400 group-hover:text-violet-600 group-hover:translate-x-1 transition-all"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </article>
    </Link>
  );
}

// Helper to categorize affiliations for visual distinction
function getAffiliationCategory(affiliation: string): {
  bgColor: string;
  textColor: string;
  pillBg: string;
  pillText: string;
} {
  const lower = affiliation.toLowerCase();

  // Catholic/Roman Catholic
  if (lower.includes("catholic")) {
    return {
      bgColor: "bg-amber-100",
      textColor: "text-amber-700",
      pillBg: "bg-amber-50",
      pillText: "text-amber-700",
    };
  }

  // Anglican
  if (lower.includes("anglican")) {
    return {
      bgColor: "bg-blue-100",
      textColor: "text-blue-700",
      pillBg: "bg-blue-50",
      pillText: "text-blue-700",
    };
  }

  // United Church
  if (lower.includes("united")) {
    return {
      bgColor: "bg-red-100",
      textColor: "text-red-700",
      pillBg: "bg-red-50",
      pillText: "text-red-700",
    };
  }

  // Non-denominational / Secular
  if (
    lower.includes("non-denominational") ||
    lower.includes("secular") ||
    lower.includes("humanist") ||
    lower.includes("civil")
  ) {
    return {
      bgColor: "bg-slate-100",
      textColor: "text-slate-700",
      pillBg: "bg-slate-50",
      pillText: "text-slate-700",
    };
  }

  // Spiritualist / New Age
  if (lower.includes("spiritual")) {
    return {
      bgColor: "bg-purple-100",
      textColor: "text-purple-700",
      pillBg: "bg-purple-50",
      pillText: "text-purple-700",
    };
  }

  // Jewish
  if (lower.includes("jewish") || lower.includes("synagogue")) {
    return {
      bgColor: "bg-indigo-100",
      textColor: "text-indigo-700",
      pillBg: "bg-indigo-50",
      pillText: "text-indigo-700",
    };
  }

  // Default
  return {
    bgColor: "bg-violet-100",
    textColor: "text-violet-700",
    pillBg: "bg-violet-50",
    pillText: "text-violet-700",
  };
}
