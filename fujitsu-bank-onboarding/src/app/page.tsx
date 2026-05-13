"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import WelcomeStep from "@/components/onboarding/WelcomeStep";
import IdentityStep from "@/components/onboarding/IdentityStep";
import DocumentStep from "@/components/onboarding/DocumentStep";
import SignatureStep from "@/components/onboarding/SignatureStep";
import DashboardStep from "@/components/onboarding/DashboardStep";
import { type OCRResult } from "@/hooks/useOCR";

const TOTAL_STEPS = 5;

export default function Home() {
  const [currentStep, setCurrentStep] = useState(1);
  const [extractedData, setExtractedData] = useState<OCRResult | null>(null);
  const [signatureData, setSignatureData] = useState<string | null>(null);

  const goNext = () => setCurrentStep((s) => Math.min(s + 1, TOTAL_STEPS));
  const goBack = () => setCurrentStep((s) => Math.max(s - 1, 1));

  const handleDocumentComplete = (data: OCRResult) => {
    setExtractedData(data);
    goNext();
  };

  const handleSignatureComplete = (signature: string) => {
    setSignatureData(signature);
    goNext();
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header currentStep={currentStep} totalSteps={TOTAL_STEPS} />

      <main className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <WelcomeStep key="welcome" onNext={goNext} />
          )}
          {currentStep === 2 && (
            <IdentityStep key="identity" onNext={goNext} onBack={goBack} />
          )}
          {currentStep === 3 && (
            <DocumentStep
              key="document"
              onNext={handleDocumentComplete}
              onBack={goBack}
            />
          )}
          {currentStep === 4 && (
            <SignatureStep
              key="signature"
              onNext={handleSignatureComplete}
              onBack={goBack}
            />
          )}
          {currentStep === 5 && (
            <DashboardStep
              key="dashboard"
              extractedData={extractedData}
              signatureData={signatureData}
            />
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E0E0E0] bg-white py-4 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between text-[10px] text-[#999] gap-2">
          <span>
            © {new Date().getFullYear()} Fujitsu Bank, S.A. – Digital Onboarding
            Demo
          </span>
          <div className="flex items-center gap-4">
            <span>Identity & Signature by Namirial S.p.A.</span>
            <span className="namirial-badge text-[9px]">
              eIDAS Qualified
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
