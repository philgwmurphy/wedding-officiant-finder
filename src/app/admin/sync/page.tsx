"use client";

import { useState, useEffect, useCallback } from "react";
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

interface SyncResult {
  totalFetched: number;
  totalInserted: number;
  totalUpdated: number;
  geocodedCount: number;
  duration: string;
}

export default function AdminSyncPage() {
  const [stats, setStats] = useState<SyncStats | null>(null);
  const [syncHistory, setSyncHistory] = useState<SyncLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncRunning, setSyncRunning] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const fetchSyncStatus = useCallback(async () => {
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
      setSyncRunning(data.syncRunning || false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load sync status");
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      await fetchSyncStatus();
      setLoading(false);
    };
    loadData();
  }, [fetchSyncStatus]);

  // Poll for status while sync is running
  useEffect(() => {
    if (syncing) {
      const interval = setInterval(fetchSyncStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [syncing, fetchSyncStatus]);

  const handleStartSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    setSyncError(null);

    try {
      const savedPassword = localStorage.getItem("admin_password");
      const response = await fetch("/api/admin/sync", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${savedPassword}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Sync failed");
      }

      setSyncResult(data.result);
      // Refresh the sync status
      await fetchSyncStatus();
    } catch (err) {
      setSyncError(err instanceof Error ? err.message : "Sync failed");
    } finally {
      setSyncing(false);
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
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">Sync Status</h1>
          <p className="text-[var(--muted)]">
            Monitor and trigger data synchronization from Ontario Data Catalogue.
          </p>
        </div>
        <button
          onClick={handleStartSync}
          disabled={syncing || syncRunning}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--primary)] text-white rounded-lg font-medium hover:bg-[var(--primary-dark)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {syncing ? (
            <>
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Syncing...
            </>
          ) : syncRunning ? (
            <>
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Sync in Progress
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Start Sync
            </>
          )}
        </button>
      </div>

      {/* Sync Result */}
      {syncResult && (
        <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg text-sm mb-6 flex items-start gap-3">
          <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="font-medium">Sync completed successfully!</p>
            <p className="mt-1">
              Fetched {syncResult.totalFetched.toLocaleString()} records in {syncResult.duration}.
              {syncResult.totalInserted > 0 && ` ${syncResult.totalInserted.toLocaleString()} new.`}
              {syncResult.totalUpdated > 0 && ` ${syncResult.totalUpdated.toLocaleString()} updated.`}
            </p>
          </div>
        </div>
      )}

      {/* Sync Error */}
      {syncError && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm mb-6 flex items-start gap-3">
          <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="font-medium">Sync failed</p>
            <p className="mt-1">{syncError}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full mx-auto"></div>
          <p className="text-[var(--muted)] mt-4">Loading sync status...</p>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <div className="bg-[var(--background-card)] rounded-xl border border-[var(--border)] p-4">
              <p className="text-sm text-[var(--muted)] mb-1">Total Officiants</p>
              <p className="text-2xl font-bold text-[var(--foreground)]">
                {stats?.totalOfficiants.toLocaleString()}
              </p>
            </div>
            <div className="bg-[var(--background-card)] rounded-xl border border-[var(--border)] p-4">
              <p className="text-sm text-[var(--muted)] mb-1">Geocoded</p>
              <p className="text-2xl font-bold text-[var(--foreground)]">
                {stats?.geocodedPercent}%
              </p>
            </div>
            <div className="bg-[var(--background-card)] rounded-xl border border-[var(--border)] p-4">
              <p className="text-sm text-[var(--muted)] mb-1">With Coordinates</p>
              <p className="text-2xl font-bold text-[var(--foreground)]">
                {stats?.geocodedOfficiants.toLocaleString()}
              </p>
            </div>
            <div className="bg-[var(--background-card)] rounded-xl border border-[var(--border)] p-4">
              <p className="text-sm text-[var(--muted)] mb-1">Total Claims</p>
              <p className="text-2xl font-bold text-[var(--foreground)]">
                {stats?.totalClaims}
              </p>
            </div>
            <div className="bg-[var(--background-card)] rounded-xl border border-[var(--border)] p-4">
              <p className="text-sm text-[var(--muted)] mb-1">Approved</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats?.approvedClaims}
              </p>
            </div>
            <div className="bg-[var(--background-card)] rounded-xl border border-[var(--border)] p-4">
              <p className="text-sm text-[var(--muted)] mb-1">Pending Review</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {stats?.pendingClaims}
              </p>
            </div>
          </div>

          {/* Sync History */}
          <div className="bg-[var(--background-card)] rounded-xl border border-[var(--border)] overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--border)]">
              <h2 className="text-lg font-semibold text-[var(--foreground)]">Sync History</h2>
            </div>
            {syncHistory.length === 0 ? (
              <div className="p-6 text-center text-[var(--muted)]">
                No sync history available. Click the &quot;Start Sync&quot; button above to sync data.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[var(--secondary)]">
                    <tr>
                      <th className="px-6 py-3 text-left font-medium text-[var(--muted)]">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left font-medium text-[var(--muted)]">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left font-medium text-[var(--muted)]">
                        Duration
                      </th>
                      <th className="px-6 py-3 text-left font-medium text-[var(--muted)]">
                        Fetched
                      </th>
                      <th className="px-6 py-3 text-left font-medium text-[var(--muted)]">
                        Inserted
                      </th>
                      <th className="px-6 py-3 text-left font-medium text-[var(--muted)]">
                        Updated
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {syncHistory.map((sync) => (
                      <tr key={sync.id} className="hover:bg-[var(--secondary)]">
                        <td className="px-6 py-4 whitespace-nowrap text-[var(--foreground)]">
                          {formatDate(sync.started_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              sync.status === "completed"
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : sync.status === "running"
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            }`}
                          >
                            {sync.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-[var(--muted)]">
                          {formatDuration(sync.started_at, sync.completed_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-[var(--muted)]">
                          {sync.total_fetched?.toLocaleString() || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-[var(--muted)]">
                          {sync.total_inserted?.toLocaleString() || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-[var(--muted)]">
                          {sync.total_updated?.toLocaleString() || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Sync Info */}
          <div className="mt-6 bg-[var(--secondary)] rounded-xl p-6">
            <h3 className="font-semibold text-[var(--primary-dark)] mb-2">
              About Data Sync
            </h3>
            <p className="text-sm text-[var(--muted)] mb-3">
              Sync fetches the latest officiant data from the Ontario Data Catalogue and updates the database.
              This includes geocoding any new municipalities. The process typically takes 1-2 minutes.
            </p>
            <p className="text-xs text-[var(--muted)]">
              Tip: Set up a scheduled task (cron job) to run syncs automatically using <code className="bg-[var(--background)] px-2 py-0.5 rounded">npm run sync</code>
            </p>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
