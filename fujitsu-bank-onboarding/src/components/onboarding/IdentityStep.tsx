"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Camera,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  ScanLine,
  User,
} from "lucide-react";

interface IdentityStepProps {
  onNext: () => void;
  onBack: () => void;
}

type ScanState = "idle" | "scanning" | "success";

export default function IdentityStep({ onNext, onBack }: IdentityStepProps) {
  const [scanState, setScanState] = useState<ScanState>("idle");

  const handleCapture = async () => {
    setScanState("scanning");
    // Simulate scanning delay
    await new Promise((r) => setTimeout(r, 3000));
    setScanState("success");
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -60 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex-1 flex items-center justify-center px-4 py-12"
    >
      <div className="max-w-2xl w-full">
        {/* Step Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto bg-red-50 rounded-xl flex items-center justify-center mb-4">
            <User size={28} className="text-[#E60012]" />
          </div>
          <h2 className="text-2xl font-bold text-[#1A1A2E] mb-2">
            Identity Verification
          </h2>
          <p className="text-[#666] text-sm">
            Position your ID document within the frame and capture a clear
            image.
          </p>
        </div>

        {/* Camera Viewport */}
        <div className="card-elevated p-6 mb-6">
          <div className="scanner-viewport">
            {/* Mock camera feed - dark background with subtle noise */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a]" />

            {/* Scanner overlay */}
            <div className="scanner-overlay">
              <div className="scanner-frame scanner-frame-bottom">
                {scanState === "scanning" && <div className="scan-line" />}

                {scanState === "idle" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 flex flex-col items-center justify-center text-white/60"
                  >
                    <ScanLine size={32} className="mb-2" />
                    <span className="text-xs font-medium">
                      Place ID here
                    </span>
                  </motion.div>
                )}

                {scanState === "success" && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="absolute inset-0 flex flex-col items-center justify-center"
                  >
                    <div className="w-16 h-16 bg-[#10B981] rounded-full flex items-center justify-center success-check">
                      <CheckCircle size={32} className="text-white" />
                    </div>
                    <span className="text-[#10B981] text-sm font-semibold mt-3">
                      ID Verified Successfully
                    </span>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Camera indicator */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  scanState === "scanning"
                    ? "bg-[#E60012] animate-pulse"
                    : scanState === "success"
                    ? "bg-[#10B981]"
                    : "bg-[#666]"
                }`}
              />
              <span className="text-white/50 text-xs font-medium">
                {scanState === "scanning"
                  ? "Scanning…"
                  : scanState === "success"
                  ? "Complete"
                  : "Ready"}
              </span>
            </div>

            {/* Namirial badge */}
            <div className="absolute bottom-4 right-4">
              <span className="namirial-badge text-[10px]">
                🔒 Namirial KYC
              </span>
            </div>
          </div>

          {/* Capture Button */}
          {scanState !== "success" && (
            <div className="flex justify-center mt-6">
              <button
                onClick={handleCapture}
                disabled={scanState === "scanning"}
                className="btn-primary"
              >
                {scanState === "scanning" ? (
                  <>
                    <div className="spinner !w-4 !h-4 !border-2 !border-white/30 !border-t-white" />
                    Scanning Document…
                  </>
                ) : (
                  <>
                    <Camera size={18} />
                    Capture ID
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Verified Data Preview */}
        {scanState === "success" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-5 mb-6"
          >
            <h3 className="text-sm font-bold text-[#1A1A2E] mb-3 flex items-center gap-2">
              <CheckCircle size={16} className="text-[#10B981]" />
              Extracted Identity Data
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { label: "Full Name", value: "Maria Santos Silva" },
                { label: "Date of Birth", value: "15/03/1988" },
                { label: "Document No.", value: "PT-123456789" },
                { label: "Nationality", value: "Portuguese" },
              ].map(({ label, value }) => (
                <div key={label}>
                  <span className="text-[#999] text-xs">{label}</span>
                  <p className="font-semibold text-[#333]">{value}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <button onClick={onBack} className="btn-secondary">
            <ArrowLeft size={16} />
            Back
          </button>
          <button
            onClick={onNext}
            disabled={scanState !== "success"}
            className="btn-primary"
          >
            Continue
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
