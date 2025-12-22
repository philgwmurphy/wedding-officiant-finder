"use client";

import { useState } from "react";

interface EmailGeneratorProps {
  officiant: {
    firstName: string;
    lastName: string;
    affiliation: string;
  };
}

interface GeneratedEmail {
  subject: string;
  body: string;
}

export default function EmailGenerator({ officiant }: EmailGeneratorProps) {
  const [formData, setFormData] = useState({
    name1: "",
    name2: "",
    weddingDate: "",
    venue: "",
    story: "",
    style: "",
  });

  const [generatedEmail, setGeneratedEmail] = useState<GeneratedEmail | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
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
      const response = await fetch("/api/generate-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          officiant,
          couple: formData,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to generate email");
      }

      setGeneratedEmail(data.email);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!generatedEmail) return;

    const fullEmail = `Subject: ${generatedEmail.subject}\n\n${generatedEmail.body}`;

    try {
      await navigator.clipboard.writeText(fullEmail);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = fullEmail;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const resetForm = () => {
    setGeneratedEmail(null);
    setFormData({
      name1: "",
      name2: "",
      weddingDate: "",
      venue: "",
      story: "",
      style: "",
    });
  };

  if (generatedEmail) {
    return (
      <div className="space-y-4">
        {/* Subject */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subject
          </label>
          <div className="bg-gray-50 rounded-lg px-4 py-3 text-gray-900">
            {generatedEmail.subject}
          </div>
        </div>

        {/* Body */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Body
          </label>
          <div className="bg-gray-50 rounded-lg px-4 py-3 text-gray-900 whitespace-pre-wrap">
            {generatedEmail.body}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={copyToClipboard}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            {copied ? (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                Copy to Clipboard
              </>
            )}
          </button>
          <button onClick={resetForm} className="btn-secondary">
            Start Over
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center pt-2">
          Copy this email and send it to {officiant.firstName} through their
          church or organization contact.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Names */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="name1"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Your Name *
          </label>
          <input
            type="text"
            id="name1"
            name="name1"
            required
            value={formData.name1}
            onChange={handleChange}
            className="input-field"
            placeholder="Your first name"
          />
        </div>
        <div>
          <label
            htmlFor="name2"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Partner&apos;s Name *
          </label>
          <input
            type="text"
            id="name2"
            name="name2"
            required
            value={formData.name2}
            onChange={handleChange}
            className="input-field"
            placeholder="Partner's first name"
          />
        </div>
      </div>

      {/* Wedding Details */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="weddingDate"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Wedding Date *
          </label>
          <input
            type="text"
            id="weddingDate"
            name="weddingDate"
            required
            value={formData.weddingDate}
            onChange={handleChange}
            className="input-field"
            placeholder="e.g., September 15, 2025"
          />
        </div>
        <div>
          <label
            htmlFor="venue"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Venue / Location *
          </label>
          <input
            type="text"
            id="venue"
            name="venue"
            required
            value={formData.venue}
            onChange={handleChange}
            className="input-field"
            placeholder="e.g., The Barn at Sunset, Brighton"
          />
        </div>
      </div>

      {/* Style */}
      <div>
        <label
          htmlFor="style"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Ceremony Style
        </label>
        <input
          type="text"
          id="style"
          name="style"
          value={formData.style}
          onChange={handleChange}
          className="input-field"
          placeholder="e.g., Traditional, relaxed, short and sweet, personal vows..."
        />
      </div>

      {/* Story */}
      <div>
        <label
          htmlFor="story"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          A bit about you (optional)
        </label>
        <textarea
          id="story"
          name="story"
          rows={3}
          value={formData.story}
          onChange={handleChange}
          className="input-field resize-none"
          placeholder="How did you meet? What's special about your relationship? This helps personalize the email."
        />
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin w-5 h-5"
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
            Generating...
          </>
        ) : (
          <>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            Generate Inquiry Email
          </>
        )}
      </button>
    </form>
  );
}
