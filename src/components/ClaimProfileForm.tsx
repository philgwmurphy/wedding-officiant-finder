"use client";

import { useState } from "react";

interface ClaimProfileFormProps {
  officiantId: number;
  officiantName: string;
  onSuccess: (email: string) => void;
  onCancel: () => void;
}

export default function ClaimProfileForm({
  officiantId,
  officiantName,
  onSuccess,
  onCancel,
}: ClaimProfileFormProps) {
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    website: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          officiantId,
          email: formData.email,
          phone: formData.phone || undefined,
          website: formData.website || undefined,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to submit claim");
      }

      onSuccess(formData.email);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-[var(--background-card)] rounded-xl shadow-xl max-w-md w-full p-6">
        <h2 className="text-xl font-semibold text-[var(--foreground)] mb-2">
          Claim Your Profile
        </h2>
        <p className="text-[var(--muted)] text-sm mb-6">
          Verify that you are <strong>{officiantName}</strong> to add your
          contact information to this profile.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-[var(--foreground)] mb-1"
            >
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="input-field"
              placeholder="your@email.com"
            />
            <p className="text-xs text-[var(--muted)] mt-1">
              We&apos;ll send a verification code to this email
            </p>
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-[var(--foreground)] mb-1"
            >
              Phone Number (optional)
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="input-field"
              placeholder="(555) 555-5555"
            />
          </div>

          <div>
            <label
              htmlFor="website"
              className="block text-sm font-medium text-[var(--foreground)] mb-1"
            >
              Website (optional)
            </label>
            <input
              type="url"
              id="website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              className="input-field"
              placeholder="https://yourwebsite.com"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="btn-secondary flex-1"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Sending...
                </>
              ) : (
                "Send Verification Code"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
