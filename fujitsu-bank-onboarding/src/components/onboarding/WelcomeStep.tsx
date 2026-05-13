"use client";

import { motion } from "framer-motion";
import { Shield, ArrowRight, CheckCircle, Lock } from "lucide-react";

interface WelcomeStepProps {
  onNext: () => void;
}

export default function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -60 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex-1 flex items-center justify-center px-4 py-12"
    >
      <div className="max-w-2xl w-full text-center">
        {/* Hero Section */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#E60012] to-[#FF4D5A] rounded-2xl flex items-center justify-center shadow-lg shadow-red-200 mb-6">
            <Shield size={36} className="text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#1A1A2E] mb-4 tracking-tight">
            Welcome to{" "}
            <span className="text-[#E60012]">Fujitsu Bank</span>
          </h1>
          <p className="text-lg text-[#666] max-w-lg mx-auto leading-relaxed">
            Open your account in minutes with our secure digital onboarding —
            powered by{" "}
            <span className="font-semibold text-[#1E3A5F]">Namirial</span>.
          </p>
        </motion.div>

        {/* Feature Pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="flex flex-wrap justify-center gap-3 mb-10"
        >
          {[
            { icon: Shield, label: "KYC Verification" },
            { icon: CheckCircle, label: "OCR Extraction" },
            { icon: Lock, label: "e-Signature" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 bg-white border border-[#E0E0E0] rounded-full px-4 py-2 text-sm font-medium text-[#444]"
            >
              <Icon size={16} className="text-[#E60012]" />
              {label}
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <button
            onClick={onNext}
            className="btn-primary text-base px-10 py-4 rounded-lg shadow-lg shadow-red-100"
          >
            Start Onboarding
            <ArrowRight size={18} />
          </button>
        </motion.div>

        {/* GDPR Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="mt-10 card p-5 text-left max-w-lg mx-auto"
        >
          <div className="flex items-start gap-3">
            <Lock size={16} className="text-[#999] mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-[#444] mb-1">
                Data Processing Notice
              </p>
              <p className="text-xs text-[#888] leading-relaxed">
                By proceeding, you consent to Fujitsu Bank processing your
                personal data in compliance with GDPR (EU 2016/679). Identity
                verification and electronic signature services are provided by
                Namirial S.p.A., an eIDAS-qualified trust service provider. Your
                data will be encrypted and stored securely.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
