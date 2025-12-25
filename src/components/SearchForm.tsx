"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import AffiliationChips from "./AffiliationChips";

interface SearchFormProps {
  initialLocation?: string;
  initialAffiliation?: string;
  compact?: boolean;
}

const POSTAL_CODE_REGEX = /^[A-Za-z]\d[A-Za-z][ ]?\d[A-Za-z]\d$/i;
const MUNICIPALITIES_CACHE_KEY = "municipalities-cache-v1";
const MUNICIPALITIES_CACHE_TTL_MS = 1000 * 60 * 60;

type MunicipalitiesResponse = {
  success: boolean;
  municipalities: string[];
};

const normalizeLocationInput = (value: string): string => {
  const trimmed = value.trim();

  if (POSTAL_CODE_REGEX.test(trimmed)) {
    const compact = trimmed.replace(/\s+/g, "").toUpperCase();
    return `${compact.slice(0, 3)} ${compact.slice(3)}`;
  }

  return trimmed;
};

const readCachedMunicipalities = (): string[] | null => {
  if (typeof window === "undefined") return null;

  try {
    const cached = window.sessionStorage.getItem(MUNICIPALITIES_CACHE_KEY);
    if (!cached) return null;

    const parsed = JSON.parse(cached) as {
      municipalities: string[];
      timestamp: number;
    };

    const isFresh = Date.now() - parsed.timestamp < MUNICIPALITIES_CACHE_TTL_MS;
    if (isFresh && Array.isArray(parsed.municipalities)) {
      return parsed.municipalities;
    }

    window.sessionStorage.removeItem(MUNICIPALITIES_CACHE_KEY);
  } catch (error) {
    console.error("Failed to read municipalities cache", error);
  }

  return null;
};

const storeMunicipalities = (municipalities: string[]): void => {
  if (typeof window === "undefined") return;

  try {
    const payload = JSON.stringify({
      municipalities,
      timestamp: Date.now(),
    });
    window.sessionStorage.setItem(MUNICIPALITIES_CACHE_KEY, payload);
  } catch (error) {
    console.error("Failed to store municipalities cache", error);
  }
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
  const [gettingLocation, setGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasRequestedMunicipalities = useRef(false);

  const handleNearMe = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }

    setGettingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const params = new URLSearchParams();
        params.set("lat", latitude.toFixed(6));
        params.set("lng", longitude.toFixed(6));
        params.set("radius", "50");
        if (affiliation) params.set("affiliation", affiliation);
        router.push(`/search?${params.toString()}`);
        setGettingLocation(false);
      },
      (error) => {
        setGettingLocation(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("Location access denied. Please enable it in your browser settings.");
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("Location unavailable. Please try again or enter manually.");
            break;
          case error.TIMEOUT:
            setLocationError("Location request timed out. Please try again.");
            break;
          default:
            setLocationError("Unable to get your location. Please enter manually.");
        }
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  }, [affiliation, router]);

  // Keep local state in sync when navigating between searches on the results page
  useEffect(() => {
    setLocation(initialLocation);
    setAffiliation(initialAffiliation);
  }, [initialLocation, initialAffiliation]);

  // Fetch municipalities for autocomplete with session-level caching to avoid refetches across navigations
  useEffect(() => {
    const cachedMunicipalities = readCachedMunicipalities();
    if (cachedMunicipalities) {
      setMunicipalities(cachedMunicipalities);
      return;
    }

    if (hasRequestedMunicipalities.current) return;
    hasRequestedMunicipalities.current = true;

    let isActive = true;

    fetch("/api/municipalities")
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }

        const data: MunicipalitiesResponse = await res.json();
        return data;
      })
      .then((data) => {
        if (!isActive || !data?.success) return;

        setMunicipalities(data.municipalities);
        storeMunicipalities(data.municipalities);
      })
      .catch((error) => {
        if (isActive) {
          console.error("Municipality fetch error:", error);
        }
      });

    return () => {
      isActive = false;
    };
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
            placeholder="City, town, or postal code"
            className="input-field text-sm py-2"
          />
          {showSuggestions && filteredSuggestions.length > 0 && (
            <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg mt-1 shadow-lg max-h-48 overflow-y-auto">
              {filteredSuggestions.map((suggestion) => (
                <li
                  key={suggestion}
                  onClick={() => selectSuggestion(suggestion)}
                  className="px-4 py-2 hover:bg-[#E8F0E9] cursor-pointer text-sm"
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          type="button"
          onClick={handleNearMe}
          disabled={gettingLocation}
          className="btn-secondary text-sm py-2 px-3 flex items-center gap-1"
          title="Use my location"
        >
          {gettingLocation ? (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v2m0 16v2m10-10h-2M4 12H2m15.364-5.364l-1.414 1.414M8.05 15.95l-1.414 1.414m0-11.314l1.414 1.414m9.9 9.9l1.414 1.414" />
            </svg>
          )}
        </button>
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
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-700"
              >
                Where is your wedding?
              </label>
              <button
                type="button"
                onClick={handleNearMe}
                disabled={gettingLocation}
                className="text-sm text-[#7D9A82] hover:text-[#5E7D63] font-medium flex items-center gap-1 disabled:opacity-50"
              >
                {gettingLocation ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Getting location...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v2m0 16v2m10-10h-2M4 12H2m15.364-5.364l-1.414 1.414M8.05 15.95l-1.414 1.414m0-11.314l1.414 1.414m9.9 9.9l1.414 1.414" />
                    </svg>
                    <span>Use my location</span>
                  </>
                )}
              </button>
            </div>
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
                placeholder="Enter city, town, or postal code"
                className="input-field pl-10"
              />
            </div>
            {locationError && (
              <p className="mt-1.5 text-sm text-red-600">{locationError}</p>
            )}
            {showSuggestions && filteredSuggestions.length > 0 && (
              <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg mt-1 shadow-lg max-h-48 overflow-y-auto">
                {filteredSuggestions.map((suggestion) => (
                  <li
                    key={suggestion}
                    onClick={() => selectSuggestion(suggestion)}
                    className="px-4 py-3 hover:bg-[#E8F0E9] cursor-pointer flex items-center gap-2"
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
            <AffiliationChips
              selected={affiliation}
              onSelect={setAffiliation}
              className="mt-3"
            />
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
