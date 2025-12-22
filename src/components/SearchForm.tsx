"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface SearchFormProps {
  initialLocation?: string;
  initialAffiliation?: string;
  compact?: boolean;
}

const POSTAL_CODE_REGEX = /^[A-Za-z]\d[A-Za-z][ ]?\d[A-Za-z]\d$/i;

const normalizeLocationInput = (value: string): string => {
  const trimmed = value.trim();

  if (POSTAL_CODE_REGEX.test(trimmed)) {
    const compact = trimmed.replace(/\s+/g, "").toUpperCase();
    return `${compact.slice(0, 3)} ${compact.slice(3)}`;
  }

  return trimmed;
};

export default function SearchForm({
  initialLocation = "",
  initialAffiliation = "",
  compact = false,
}: SearchFormProps) {
  const router = useRouter();
  const [location, setLocation] = useState(initialLocation);
  const [affiliation, setAffiliation] = useState(initialAffiliation);
  const [municipalities, setMunicipalities] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep local state in sync when navigating between searches on the results page
  useEffect(() => {
    setLocation(initialLocation);
    setAffiliation(initialAffiliation);
  }, [initialLocation, initialAffiliation]);

  // Fetch municipalities for autocomplete
  useEffect(() => {
    fetch("/api/municipalities")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setMunicipalities(data.municipalities);
        }
      })
      .catch(console.error);
  }, []);

  // Filter suggestions as user types
  useEffect(() => {
    if (location.length > 1) {
      const filtered = municipalities
        .filter((m) => m.toLowerCase().includes(location.toLowerCase()))
        .slice(0, 6);
      setFilteredSuggestions(filtered);
    } else {
      setFilteredSuggestions([]);
    }
  }, [location, municipalities]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const normalizedLocation = normalizeLocationInput(location);

    const params = new URLSearchParams();
    if (normalizedLocation) params.set("location", normalizedLocation);
    if (affiliation) params.set("affiliation", affiliation);

    router.push(`/search?${params.toString()}`);
  };

  const selectSuggestion = (suggestion: string) => {
    setLocation(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-2xl">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="City, town, or postal code (with or without space)..."
            className="input-field text-sm py-2"
          />
          {showSuggestions && filteredSuggestions.length > 0 && (
            <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg mt-1 shadow-lg max-h-48 overflow-y-auto">
              {filteredSuggestions.map((suggestion) => (
                <li
                  key={suggestion}
                  onClick={() => selectSuggestion(suggestion)}
                  className="px-4 py-2 hover:bg-violet-50 cursor-pointer text-sm"
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
        </div>
        <button type="submit" className="btn-primary text-sm py-2 px-4">
          Search
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
        <div className="space-y-4">
          {/* Location Input */}
          <div className="relative">
            <label
              htmlFor="location"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Where is your wedding? (city or postal code)
            </label>
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
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
              <input
                ref={inputRef}
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="Enter city, town, or postal code in Ontario (spaces optional)"
                className="input-field pl-10"
              />
            </div>
            {showSuggestions && filteredSuggestions.length > 0 && (
              <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg mt-1 shadow-lg max-h-48 overflow-y-auto">
                {filteredSuggestions.map((suggestion) => (
                  <li
                    key={suggestion}
                    onClick={() => selectSuggestion(suggestion)}
                    className="px-4 py-3 hover:bg-violet-50 cursor-pointer flex items-center gap-2"
                  >
                    <svg
                      className="w-4 h-4 text-gray-400"
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
                    </svg>
                    {suggestion}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Affiliation Input */}
          <div>
            <label
              htmlFor="affiliation"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Ceremony type (optional)
            </label>
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <input
                id="affiliation"
                type="text"
                value={affiliation}
                onChange={(e) => setAffiliation(e.target.value)}
                placeholder="e.g., Anglican, Catholic, Non-denominational..."
                className="input-field pl-10"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full btn-primary mt-6 py-3.5 text-lg flex items-center justify-center gap-2"
        >
          <svg
            className="w-5 h-5"
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
          Find Officiants
        </button>
      </div>
    </form>
  );
}
