"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface DashboardData {
  subscription: {
    plan: string;
    status: string;
  };
  leads: {
    new: number;
    total: number;
  };
  profile: {
    hasPhoto: boolean;
    hasBio: boolean;
    completeness: number;
  };
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const officiantId = sessionStorage.getItem("dashboard_officiant_id");
      if (!officiantId) return;

      try {
        // Fetch subscription status
        const subRes = await fetch(`/api/subscription?officiantId=${officiantId}`);
        const subData = await subRes.json();

        // Fetch leads
        const leadsRes = await fetch(`/api/leads?officiantId=${officiantId}&limit=1`);
        const leadsData = await leadsRes.json();

        // Fetch premium profile
        const profileRes = await fetch(`/api/premium/profile?officiantId=${officiantId}`);
        const profileData = await profileRes.json();

        const profile = profileData.profile;
        const hasPhoto = Boolean(profile?.photo_url);
        const hasBio = Boolean(profile?.bio);
        const completeness = calculateCompleteness(profile);

        setData({
          subscription: {
            plan: subData.plan || "free",
            status: subData.status || "active",
          },
          leads: {
            new: leadsData.counts?.new || 0,
            total: leadsData.total || 0,
          },
          profile: {
            hasPhoto,
            hasBio,
            completeness,
          },
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--foreground)]">Dashboard</h1>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Subscription"
          value={data?.subscription.plan === "free" ? "Free" : data?.subscription.plan || "Free"}
          subtitle={data?.subscription.plan === "free" ? "Upgrade for more features" : "Active"}
          icon="credit-card"
          href="/dashboard/subscription"
          highlight={data?.subscription.plan !== "free"}
        />
        <StatCard
          title="New Leads"
          value={data?.leads.new.toString() || "0"}
          subtitle={`${data?.leads.total || 0} total inquiries`}
          icon="inbox"
          href="/dashboard/leads"
          highlight={(data?.leads.new || 0) > 0}
        />
        <StatCard
          title="Profile"
          value={`${data?.profile.completeness || 0}%`}
          subtitle="Profile completeness"
          icon="user"
          href="/dashboard/profile"
        />
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data?.subscription.plan === "free" && (
            <ActionCard
              title="Upgrade to Premium"
              description="Add a photo, bio, and more to stand out"
              href="/pricing"
              buttonText="View Plans"
              primary
            />
          )}
          {!data?.profile.hasPhoto && data?.subscription.plan !== "free" && (
            <ActionCard
              title="Add a Profile Photo"
              description="Profiles with photos get more inquiries"
              href="/dashboard/profile"
              buttonText="Add Photo"
            />
          )}
          {!data?.profile.hasBio && data?.subscription.plan !== "free" && (
            <ActionCard
              title="Write Your Bio"
              description="Tell couples about your ceremony style"
              href="/dashboard/profile"
              buttonText="Add Bio"
            />
          )}
          {(data?.leads.new || 0) > 0 && (
            <ActionCard
              title="New Inquiries"
              description={`You have ${data?.leads.new} new lead${(data?.leads.new || 0) > 1 ? "s" : ""} waiting`}
              href="/dashboard/leads"
              buttonText="View Leads"
              primary
            />
          )}
        </div>
      </div>

      {/* Tips */}
      <div className="card bg-[var(--secondary)]">
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-2">Tips to Get More Bookings</h2>
        <ul className="space-y-2 text-sm text-[var(--muted)]">
          <li>• Complete your profile with a photo and detailed bio</li>
          <li>• List all the ceremony types and services you offer</li>
          <li>• Respond quickly to inquiries - couples often reach out to multiple officiants</li>
          <li>• Consider upgrading to Featured to appear at the top of search results</li>
        </ul>
      </div>
    </div>
  );
}

function calculateCompleteness(profile: Record<string, unknown> | null): number {
  if (!profile) return 20; // Base score for having a claimed profile

  let score = 20;
  if (profile.photo_url) score += 20;
  if (profile.bio) score += 20;
  if (Array.isArray(profile.services) && profile.services.length > 0) score += 15;
  if (Array.isArray(profile.languages) && profile.languages.length > 1) score += 10;
  if (profile.price_range) score += 10;
  if (profile.years_experience) score += 5;

  return Math.min(score, 100);
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  href,
  highlight,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: string;
  href: string;
  highlight?: boolean;
}) {
  const icons: Record<string, React.ReactNode> = {
    "credit-card": (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    inbox: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
    ),
    user: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  };

  return (
    <Link href={href} className="card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[var(--muted)]">{title}</p>
          <p className={`text-2xl font-bold mt-1 ${highlight ? "text-[var(--primary)]" : "text-[var(--foreground)]"}`}>
            {value}
          </p>
          <p className="text-sm text-[var(--muted)] mt-1">{subtitle}</p>
        </div>
        <div className={`p-2 rounded-lg ${highlight ? "bg-[var(--primary)] text-white" : "bg-[var(--secondary)] text-[var(--primary)]"}`}>
          {icons[icon]}
        </div>
      </div>
    </Link>
  );
}

function ActionCard({
  title,
  description,
  href,
  buttonText,
  primary,
}: {
  title: string;
  description: string;
  href: string;
  buttonText: string;
  primary?: boolean;
}) {
  return (
    <div className={`p-4 rounded-lg border ${primary ? "border-[var(--primary)] bg-[var(--primary)]/5" : "border-[var(--border)]"}`}>
      <h3 className="font-semibold text-[var(--foreground)]">{title}</h3>
      <p className="text-sm text-[var(--muted)] mt-1">{description}</p>
      <Link
        href={href}
        className={`inline-block mt-3 text-sm font-medium ${primary ? "text-[var(--primary)]" : "text-[var(--muted)]"} hover:underline`}
      >
        {buttonText} →
      </Link>
    </div>
  );
}
