"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";

interface SyncLog {
  id: number;
  started_at: string;
  completed_at: string | null;
  status: string;
  total_fetched: number | null;
  total_inserted: number | null;
  total_updated: number | null;
  error_message: string | null;
}

interface SyncStats {
  totalOfficiants: number;
  geocodedOfficiants: number;
  geocodedPercent: number;
  totalClaims: number;
  approvedClaims: number;
  pendingClaims: number;
}

export default function AdminSyncPage() {
  const [stats, setStats] = useState<SyncStats | null>(null);
  const [syncHistory, setSyncHistory] = useState<SyncLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSyncStatus();
  }, []);

  const fetchSyncStatus = async () => {
    setLoading(true);
    setError(null);

    try {
      const savedPassword = localStorage.getItem("admin_password");
      const response = await fetch("/api/admin/sync", {
        headers: {
          Authorization: `Bearer ${savedPassword}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch sync status");
      }

      const data = await response.json();
      setStats(data.stats);
      setSyncHistory(data.syncHistory || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load sync status");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatDuration = (start: string, end: string | null) => {
    if (!end) return "In progress...";
    const duration = new Date(end).getTime() - new Date(start).getTime();
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Sync Status</h1>
        <p className="text-gray-600">
          Monitor data synchronization from Ontario Data Catalogue.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-[#7D9A82] border-t-transparent rounded-full mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading sync status...</p>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-sm text-gray-500 mb-1">Total Officiants</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.totalOfficiants.toLocaleString()}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-sm text-gray-500 mb-1">Geocoded</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.geocodedPercent}%
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-sm text-gray-500 mb-1">With Coordinates</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.geocodedOfficiants.toLocaleString()}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-sm text-gray-500 mb-1">Total Claims</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.totalClaims}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-sm text-gray-500 mb-1">Approved</p>
              <p className="text-2xl font-bold text-green-600">
                {stats?.approvedClaims}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-sm text-gray-500 mb-1">Pending Review</p>
              <p className="text-2xl font-bold text-yellow-600">
                {stats?.pendingClaims}
              </p>
            </div>
          </div>

          {/* Sync History */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Sync History</h2>
            </div>
            {syncHistory.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No sync history available. Run <code className="bg-gray-100 px-2 py-1 rounded">npm run sync</code> to sync data.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left font-medium text-gray-500">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500">
                        Duration
                      </th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500">
                        Fetched
                      </th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500">
                        Inserted
                      </th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500">
                        Updated
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {syncHistory.map((sync) => (
                      <tr key={sync.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                          {formatDate(sync.started_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              sync.status === "completed"
                                ? "bg-green-100 text-green-700"
                                : sync.status === "running"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {sync.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                          {formatDuration(sync.started_at, sync.completed_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                          {sync.total_fetched?.toLocaleString() || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                          {sync.total_inserted?.toLocaleString() || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                          {sync.total_updated?.toLocaleString() || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Sync Instructions */}
          <div className="mt-6 bg-[#E8F0E9] rounded-xl p-6">
            <h3 className="font-semibold text-[#5E7D63] mb-2">
              How to Sync Data
            </h3>
            <p className="text-sm text-[#5E7D63] mb-3">
              Data is synced from the Ontario Data Catalogue using the sync script:
            </p>
            <code className="block bg-white rounded-lg px-4 py-3 text-sm text-gray-800 font-mono">
              npm run sync
            </code>
            <p className="text-xs text-[#7A8578] mt-3">
              Consider setting up a scheduled task (cron job) to run this automatically.
            </p>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
