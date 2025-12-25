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
                <h3 className="font-semibold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">
                  {officiant.firstName} {officiant.lastName}
                </h3>
                <p className="text-sm text-[var(--muted)] mt-0.5">
                  {officiant.municipality}
                </p>
              </div>

              {distanceText && (
                <span className="text-xs text-[var(--muted)] bg-[var(--secondary)] px-2 py-1 rounded-full whitespace-nowrap">
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
        <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between text-sm">
          <span className="text-[var(--muted)]">View profile</span>
          <svg
            className="w-4 h-4 text-[var(--muted)] group-hover:text-[var(--primary)] group-hover:translate-x-1 transition-all"
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
      bgColor: "bg-amber-100 dark:bg-amber-900/30",
      textColor: "text-amber-700 dark:text-amber-300",
      pillBg: "bg-amber-50 dark:bg-amber-900/20",
      pillText: "text-amber-700 dark:text-amber-300",
    };
  }

  // Anglican
  if (lower.includes("anglican")) {
    return {
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      textColor: "text-blue-700 dark:text-blue-300",
      pillBg: "bg-blue-50 dark:bg-blue-900/20",
      pillText: "text-blue-700 dark:text-blue-300",
    };
  }

  // United Church
  if (lower.includes("united")) {
    return {
      bgColor: "bg-red-100 dark:bg-red-900/30",
      textColor: "text-red-700 dark:text-red-300",
      pillBg: "bg-red-50 dark:bg-red-900/20",
      pillText: "text-red-700 dark:text-red-300",
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
      bgColor: "bg-slate-100 dark:bg-slate-700/30",
      textColor: "text-slate-700 dark:text-slate-300",
      pillBg: "bg-slate-50 dark:bg-slate-700/20",
      pillText: "text-slate-700 dark:text-slate-300",
    };
  }

  // Spiritualist / New Age
  if (lower.includes("spiritual")) {
    return {
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
      textColor: "text-purple-700 dark:text-purple-300",
      pillBg: "bg-purple-50 dark:bg-purple-900/20",
      pillText: "text-purple-700 dark:text-purple-300",
    };
  }

  // Jewish
  if (lower.includes("jewish") || lower.includes("synagogue")) {
    return {
      bgColor: "bg-indigo-100 dark:bg-indigo-900/30",
      textColor: "text-indigo-700 dark:text-indigo-300",
      pillBg: "bg-indigo-50 dark:bg-indigo-900/20",
      pillText: "text-indigo-700 dark:text-indigo-300",
    };
  }

  // Default - uses theme variables for sage color
  return {
    bgColor: "bg-[var(--secondary)]",
    textColor: "text-[var(--primary-dark)]",
    pillBg: "bg-[var(--secondary)]",
    pillText: "text-[var(--primary-dark)]",
  };
}
