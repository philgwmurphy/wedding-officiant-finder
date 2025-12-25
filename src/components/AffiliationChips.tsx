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
                ? "bg-violet-600 text-white border-violet-600"
                : "bg-white text-gray-700 border-gray-300 hover:border-violet-400 hover:text-violet-600"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
