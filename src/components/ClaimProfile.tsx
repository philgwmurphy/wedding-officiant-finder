"use client";

import { useState } from "react";
import ClaimProfileForm from "./ClaimProfileForm";
import ClaimVerifyForm from "./ClaimVerifyForm";

interface ClaimProfileProps {
  officiantId: number;
  officiantName: string;
}

type ClaimStep = "button" | "form" | "verify" | "complete";

export default function ClaimProfile({
  officiantId,
  officiantName,
}: ClaimProfileProps) {
  const [step, setStep] = useState<ClaimStep>("button");
  const [email, setEmail] = useState("");

  const handleFormSuccess = (submittedEmail: string) => {
    setEmail(submittedEmail);
    setStep("verify");
  };

  const handleVerifySuccess = () => {
    setStep("complete");
  };

  const handleClose = () => {
    setStep("button");
    setEmail("");
  };

  if (step === "complete") {
    return (
      <div className="border border-green-200 bg-green-50 rounded-lg p-4 text-center">
        <div className="flex items-center justify-center gap-2 text-green-700 font-medium">
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          Claim Submitted
        </div>
        <p className="text-sm text-green-600 mt-1">
          Your profile claim is pending approval.
        </p>
      </div>
    );
  }

  return (
    <>
      {step === "button" && (
        <button
          onClick={() => setStep("form")}
          className="w-full border-2 border-dashed border-[#B8CCBB] rounded-lg p-4 text-center hover:border-[#7D9A82] hover:bg-[#E8F0E9] transition-colors group"
        >
          <div className="flex items-center justify-center gap-2 text-[#7D9A82] font-medium group-hover:text-[#5E7D63]">
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
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            Is this you? Claim this profile
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Add your contact info so couples can reach you
          </p>
        </button>
      )}

      {step === "form" && (
        <ClaimProfileForm
          officiantId={officiantId}
          officiantName={officiantName}
          onSuccess={handleFormSuccess}
          onCancel={handleClose}
        />
      )}

      {step === "verify" && (
        <ClaimVerifyForm
          officiantId={officiantId}
          email={email}
          onSuccess={handleVerifySuccess}
          onBack={() => setStep("form")}
        />
      )}
    </>
  );
}
