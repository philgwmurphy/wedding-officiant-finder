// Raw record from Ontario Data Catalogue API
export interface OntarioApiRecord {
  _id: number;
  Municipality: string;
  "Last Name": string;
  "First Name": string;
  Affiliation: string;
}

// Cleaned/normalized officiant record
export interface Officiant {
  id: number;
  firstName: string;
  lastName: string;
  municipality: string;
  affiliation: string;
  lat?: number;
  lng?: number;
  // Claim-related fields (only present if profile is claimed and approved)
  email?: string;
  phone?: string;
  website?: string;
  claimedAt?: string;
  isVerified?: boolean;
}

// Profile claim status
export type ClaimStatus = "pending" | "email_verified" | "approved" | "rejected";

// Profile claim record
export interface ProfileClaim {
  id: number;
  officiantId: number;
  email: string;
  phone?: string;
  website?: string;
  verificationCode?: string;
  createdAt: string;
  verifiedAt?: string;
  approvedAt?: string;
  expiresAt: string;
  status: ClaimStatus;
}

// Claim submission request
export interface ClaimRequest {
  officiantId: number;
  email: string;
  phone?: string;
  website?: string;
}

// Claim verification request
export interface ClaimVerifyRequest {
  officiantId: number;
  email: string;
  code: string;
}

// Search parameters
export interface SearchParams {
  location?: string;
  lat?: number;
  lng?: number;
  radius?: number; // in km
  affiliation?: string;
  query?: string;
  limit?: number;
  offset?: number;
}

// Search result with distance
export interface OfficiantSearchResult extends Officiant {
  distance?: number; // in km
}

// API response from Ontario Data Catalogue
export interface OntarioApiResponse {
  success: boolean;
  result: {
    resource_id: string;
    fields: Array<{ id: string; type: string }>;
    records: OntarioApiRecord[];
    _links: {
      start: string;
      next?: string;
    };
    total: number;
  };
}

// Geocoding result
export interface GeocodedMunicipality {
  name: string;
  lat: number;
  lng: number;
}
