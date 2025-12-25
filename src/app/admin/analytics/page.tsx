"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";

interface AnalyticsData {
  topAffiliations: { name: string; count: number }[];
  topMunicipalities: { name: string; count: number }[];
  claimsByStatus: Record<string, number>;
  claimsTimeline: { date: string; count: number }[];
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);

    try {
      const savedPassword = localStorage.getItem("admin_password");
      const response = await fetch("/api/admin/analytics", {
        headers: {
          Authorization: `Bearer ${savedPassword}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch analytics");
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  const getMaxCount = (items: { count: number }[]) => {
    return Math.max(...items.map((i) => i.count), 1);
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Analytics</h1>
        <p className="text-gray-600">
          Overview of officiant data and claim statistics.
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
          <p className="text-gray-500 mt-4">Loading analytics...</p>
        </div>
      ) : data ? (
        <div className="space-y-8">
          {/* Claims Overview */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Claims Overview
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-3xl font-bold text-gray-400">
                  {data.claimsByStatus.pending || 0}
                </p>
                <p className="text-sm text-gray-500 mt-1">Pending</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-3xl font-bold text-yellow-600">
                  {data.claimsByStatus.email_verified || 0}
                </p>
                <p className="text-sm text-gray-500 mt-1">Awaiting Review</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-3xl font-bold text-green-600">
                  {data.claimsByStatus.approved || 0}
                </p>
                <p className="text-sm text-gray-500 mt-1">Approved</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <p className="text-3xl font-bold text-red-400">
                  {data.claimsByStatus.rejected || 0}
                </p>
                <p className="text-sm text-gray-500 mt-1">Rejected</p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Top Affiliations */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Top Affiliations
              </h2>
              <div className="space-y-3">
                {data.topAffiliations.slice(0, 10).map((item, index) => (
                  <div key={item.name} className="flex items-center gap-3">
                    <span className="text-sm text-gray-400 w-5">{index + 1}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700 truncate max-w-[180px]">
                          {item.name}
                        </span>
                        <span className="text-sm text-gray-500">
                          {item.count.toLocaleString()}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#7D9A82] rounded-full"
                          style={{
                            width: `${(item.count / getMaxCount(data.topAffiliations)) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Municipalities */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Top Municipalities
              </h2>
              <div className="space-y-3">
                {data.topMunicipalities.slice(0, 10).map((item, index) => (
                  <div key={item.name} className="flex items-center gap-3">
                    <span className="text-sm text-gray-400 w-5">{index + 1}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700 truncate max-w-[180px]">
                          {item.name}
                        </span>
                        <span className="text-sm text-gray-500">
                          {item.count.toLocaleString()}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#B8CCBB] rounded-full"
                          style={{
                            width: `${(item.count / getMaxCount(data.topMunicipalities)) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Claims Timeline */}
          {data.claimsTimeline.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Claims (Last 30 Days)
              </h2>
              <div className="flex items-end gap-1 h-32">
                {data.claimsTimeline.map((day) => (
                  <div
                    key={day.date}
                    className="flex-1 bg-[#7D9A82] rounded-t hover:bg-[#5E7D63] transition-colors cursor-default group relative"
                    style={{
                      height: `${Math.max((day.count / getMaxCount(data.claimsTimeline)) * 100, 4)}%`,
                    }}
                  >
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      {new Date(day.date).toLocaleDateString()}: {day.count} claims
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-400">
                <span>{data.claimsTimeline[0]?.date}</span>
                <span>{data.claimsTimeline[data.claimsTimeline.length - 1]?.date}</span>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </AdminLayout>
  );
}
