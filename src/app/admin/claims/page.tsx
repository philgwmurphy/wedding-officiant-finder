"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import AdminLayout from "@/components/AdminLayout";

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
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
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

      if (!response.ok) {
        throw new Error("Failed to fetch claims");
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
    fetchClaims();
  }, [fetchClaims]);

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

      fetchClaims();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process action");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Claim Requests</h1>
        <p className="text-gray-600">
          Review and manage profile claim requests from officiants.
        </p>
      </div>

      {/* Status Filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        {[
          { value: "email_verified", label: "Awaiting Review" },
          { value: "approved", label: "Approved" },
          { value: "pending", label: "Pending Verification" },
        ].map((status) => (
          <button
            key={status.value}
            onClick={() => setStatusFilter(status.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === status.value
                ? "bg-[#7D9A82] text-white"
                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            {status.label}
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
          <div className="animate-spin w-8 h-8 border-4 border-[#7D9A82] border-t-transparent rounded-full mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading claims...</p>
        </div>
      ) : claims.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-gray-500">No claims found with this status</p>
        </div>
      ) : (
        <div className="space-y-4">
          {claims.map((claim) => (
            <div
              key={claim.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {claim.officiant?.first_name} {claim.officiant?.last_name}
                    </h2>
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        claim.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : claim.status === "email_verified"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {claim.status}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-3">
                    {claim.officiant?.municipality} &bull;{" "}
                    {claim.officiant?.affiliation}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">Email:</span>{" "}
                      <a
                        href={`mailto:${claim.email}`}
                        className="text-[#7D9A82] hover:underline"
                      >
                        {claim.email}
                      </a>
                    </div>
                    {claim.phone && (
                      <div>
                        <span className="text-gray-500">Phone:</span>{" "}
                        {claim.phone}
                      </div>
                    )}
                    {claim.website && (
                      <div>
                        <span className="text-gray-500">Website:</span>{" "}
                        <a
                          href={claim.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#7D9A82] hover:underline"
                        >
                          {claim.website.replace(/^https?:\/\//, "")}
                        </a>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-gray-400 mt-3">
                    Submitted: {new Date(claim.created_at).toLocaleDateString()}
                    {claim.verified_at && (
                      <>
                        {" "}
                        &bull; Verified:{" "}
                        {new Date(claim.verified_at).toLocaleDateString()}
                      </>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {claim.status === "email_verified" && (
                    <>
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
                    </>
                  )}
                  <Link
                    href={`/officiant/${claim.officiant_id}`}
                    className="text-sm text-[#7D9A82] hover:underline"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
