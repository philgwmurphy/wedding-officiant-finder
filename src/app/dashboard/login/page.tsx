"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DashboardLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [officiantInfo, setOfficiantInfo] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/dashboard/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to send verification code");
        return;
      }

      setOfficiantInfo({ id: data.officiantId, name: data.officiantName });
      setStep("code");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/dashboard/login/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Invalid verification code");
        return;
      }

      // Store session info
      sessionStorage.setItem("dashboard_officiant_id", data.officiantId.toString());
      sessionStorage.setItem("dashboard_officiant_name", data.officiantName);
      sessionStorage.setItem("dashboard_email", email);

      router.push("/dashboard");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-[var(--primary)]">
            Officiant Finder
          </Link>
          <h1 className="text-xl font-semibold text-[var(--foreground)] mt-4">
            Officiant Dashboard
          </h1>
          <p className="text-[var(--muted)] mt-2">
            {step === "email"
              ? "Sign in with the email you used to claim your profile"
              : "Enter the verification code sent to your email"}
          </p>
        </div>

        <div className="card">
          {step === "email" ? (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[var(--foreground)] mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input-field"
                  placeholder="you@example.com"
                />
              </div>

              {error && (
                <p className="text-red-500 text-sm">{error}</p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary disabled:opacity-50"
              >
                {isLoading ? "Sending..." : "Send Verification Code"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleCodeSubmit} className="space-y-4">
              {officiantInfo && (
                <div className="text-center mb-4 p-3 bg-[var(--secondary)] rounded-lg">
                  <p className="text-sm text-[var(--muted)]">Signing in as</p>
                  <p className="font-semibold text-[var(--foreground)]">{officiantInfo.name}</p>
                </div>
              )}

              <div>
                <label htmlFor="code" className="block text-sm font-medium text-[var(--foreground)] mb-1">
                  Verification Code
                </label>
                <input
                  type="text"
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  required
                  className="input-field text-center text-2xl tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                />
              </div>

              {error && (
                <p className="text-red-500 text-sm">{error}</p>
              )}

              <button
                type="submit"
                disabled={isLoading || code.length !== 6}
                className="w-full btn-primary disabled:opacity-50"
              >
                {isLoading ? "Verifying..." : "Sign In"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  setCode("");
                  setError("");
                }}
                className="w-full text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
              >
                Use a different email
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-[var(--muted)] mt-6">
          Don&apos;t have a claimed profile?{" "}
          <Link href="/" className="text-[var(--primary)] hover:underline">
            Find your profile
          </Link>
        </p>
      </div>
    </div>
  );
}
