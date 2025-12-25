"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [officiantId, setOfficiantId] = useState<number | null>(null);
  const [officiantName, setOfficiantName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated (has claimed profile)
    const storedId = sessionStorage.getItem("dashboard_officiant_id");
    const storedName = sessionStorage.getItem("dashboard_officiant_name");

    if (storedId && storedName) {
      setOfficiantId(parseInt(storedId, 10));
      setOfficiantName(storedName);
      setIsLoading(false);
    } else {
      // Redirect to login/claim page
      router.push("/dashboard/login");
    }
  }, [router]);

  const handleLogout = () => {
    sessionStorage.removeItem("dashboard_officiant_id");
    sessionStorage.removeItem("dashboard_officiant_name");
    sessionStorage.removeItem("dashboard_email");
    router.push("/");
  };

  const navItems = [
    { href: "/dashboard", label: "Overview", icon: "home" },
    { href: "/dashboard/profile", label: "Profile", icon: "user" },
    { href: "/dashboard/leads", label: "Leads", icon: "inbox" },
    { href: "/dashboard/subscription", label: "Subscription", icon: "credit-card" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Top Navigation */}
      <header className="bg-[var(--background-card)] border-b border-[var(--border)] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-xl font-bold text-[var(--primary)]">
                Officiant Finder
              </Link>
              <span className="text-sm text-[var(--muted)]">Dashboard</span>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-[var(--foreground)]">{officiantName}</span>
              <button
                onClick={handleLogout}
                className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Navigation */}
          <nav className="w-full md:w-64 shrink-0">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? "bg-[var(--primary)] text-white"
                          : "text-[var(--foreground)] hover:bg-[var(--secondary)]"
                      }`}
                    >
                      <NavIcon name={item.icon} />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="mt-8 p-4 bg-[var(--secondary)] rounded-lg">
              <p className="text-sm text-[var(--foreground)] font-medium mb-2">
                View your public profile
              </p>
              <Link
                href={`/officiant/${officiantId}`}
                className="text-sm text-[var(--primary)] hover:underline"
              >
                View Profile →
              </Link>
            </div>
          </nav>

          {/* Main Content */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}

function NavIcon({ name }: { name: string }) {
  const icons: Record<string, React.ReactNode> = {
    home: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    user: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    inbox: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
    ),
    "credit-card": (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
  };

  return icons[name] || null;
}
