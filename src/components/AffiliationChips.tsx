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
                ? "bg-[#7D9A82] text-white border-[#7D9A82]"
                : "bg-white text-gray-700 border-gray-300 hover:border-[#B8CCBB] hover:text-[#7D9A82]"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
