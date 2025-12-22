"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface Claim {
  id: number;
  officiant_id: number;
  email: string;
  phone?: string;
  website?: string;
  status: string;
  created_at: string;
  verified_at?: string;
  officiant: {
    first_name: string;
    last_name: string;
    municipality: string;
    affiliation: string;
  } | null;
}

export default function AdminClaimsPage() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState("email_verified");

  const fetchClaims = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const savedPassword = localStorage.getItem("admin_password");
      const response = await fetch(`/api/admin/claims?status=${statusFilter}`, {
        headers: {
          Authorization: `Bearer ${savedPassword}`,
        },
      });

      if (response.status === 401) {
        setIsAuthenticated(false);
        localStorage.removeItem("admin_password");
        return;
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setClaims(data.claims || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch claims");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    const savedPassword = localStorage.getItem("admin_password");
    if (savedPassword) {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchClaims();
    }
  }, [isAuthenticated, statusFilter, fetchClaims]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Test the password by making a request
    try {
      const response = await fetch("/api/admin/claims?status=email_verified", {
        headers: {
          Authorization: `Bearer ${password}`,
        },
      });

      if (response.status === 401) {
        setError("Invalid password");
        return;
      }

      localStorage.setItem("admin_password", password);
      setIsAuthenticated(true);
    } catch {
      setError("Failed to authenticate");
    }
  };

  const handleAction = async (claimId: number, action: "approve" | "reject") => {
    setActionLoading(claimId);
    try {
      const savedPassword = localStorage.getItem("admin_password");
      const response = await fetch("/api/admin/claims", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${savedPassword}`,
        },
        body: JSON.stringify({ claimId, action }),
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      // Refresh the list
      fetchClaims();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process action");
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_password");
    setIsAuthenticated(false);
    setPassword("");
    setClaims([]);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Login</h1>
          <p className="text-gray-600 mb-6">Enter the admin password to continue.</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="Enter admin password"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button type="submit" className="btn-primary w-full">
              Login
            </button>
          </form>

          <Link href="/" className="block text-center text-sm text-gray-500 mt-4 hover:text-gray-700">
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Claim Requests</h1>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
              View Site
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Status Filter */}
        <div className="mb-6 flex gap-2">
          {["email_verified", "approved", "pending"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === status
                  ? "bg-violet-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {status === "email_verified"
                ? "Awaiting Review"
                : status === "approved"
                ? "Approved"
                : "Pending Verification"}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading claims...</p>
          </div>
        ) : claims.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center">
            <p className="text-gray-500">No claims with status &quot;{statusFilter}&quot;</p>
          </div>
        ) : (
          <div className="space-y-4">
            {claims.map((claim) => (
              <div key={claim.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-lg font-semibold text-gray-900">
                        {claim.officiant?.first_name} {claim.officiant?.last_name}
                      </h2>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        claim.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : claim.status === "email_verified"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700"
                      }`}>
                        {claim.status}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-3">
                      {claim.officiant?.municipality} &bull; {claim.officiant?.affiliation}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500">Email:</span>{" "}
                        <a href={`mailto:${claim.email}`} className="text-violet-600 hover:underline">
                          {claim.email}
                        </a>
                      </div>
                      {claim.phone && (
                        <div>
                          <span className="text-gray-500">Phone:</span> {claim.phone}
                        </div>
                      )}
                      {claim.website && (
                        <div>
                          <span className="text-gray-500">Website:</span>{" "}
                          <a
                            href={claim.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-violet-600 hover:underline"
                          >
                            {claim.website.replace(/^https?:\/\//, "")}
                          </a>
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-gray-400 mt-3">
                      Submitted: {new Date(claim.created_at).toLocaleDateString()}
                      {claim.verified_at && (
                        <> &bull; Verified: {new Date(claim.verified_at).toLocaleDateString()}</>
                      )}
                    </p>
                  </div>

                  {claim.status === "email_verified" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAction(claim.id, "approve")}
                        disabled={actionLoading === claim.id}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                      >
                        {actionLoading === claim.id ? "..." : "Approve"}
                      </button>
                      <button
                        onClick={() => handleAction(claim.id, "reject")}
                        disabled={actionLoading === claim.id}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                      >
                        {actionLoading === claim.id ? "..." : "Reject"}
                      </button>
                    </div>
                  )}

                  <Link
                    href={`/officiant/${claim.officiant_id}`}
                    className="text-sm text-violet-600 hover:underline"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
