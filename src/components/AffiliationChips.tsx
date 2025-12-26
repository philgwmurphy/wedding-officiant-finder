"use client";

import { POPULAR_AFFILIATIONS } from "@/lib/landing-pages";

interface AffiliationChipsProps {
  selected?: string;
  onSelect: (affiliation: string) => void;
  className?: string;
}

export default function AffiliationChips({
  selected,
  onSelect,
  className = "",
}: AffiliationChipsProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {POPULAR_AFFILIATIONS.map(({ label, value }) => {
        const isSelected = selected?.toLowerCase() === value.toLowerCase();
        return (
          <button
            key={value}
            type="button"
            onClick={() => onSelect(isSelected ? "" : value)}
            className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
              isSelected
                ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                : "bg-[var(--background-card)] text-[var(--foreground)] border-[var(--border)] hover:border-[var(--primary-light)] hover:text-[var(--primary)]"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
