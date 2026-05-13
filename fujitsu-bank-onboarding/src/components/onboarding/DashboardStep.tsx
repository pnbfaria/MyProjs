"use client";

import { motion } from "framer-motion";
import {
  CheckCircle,
  CreditCard,
  Smartphone,
  Shield,
  Download,
  PartyPopper,
} from "lucide-react";
import { type OCRResult } from "@/hooks/useOCR";
import Image from "next/image";

interface DashboardStepProps {
  extractedData: OCRResult | null;
  signatureData: string | null;
}

export default function DashboardStep({
  extractedData,
  signatureData,
}: DashboardStepProps) {
  const data = extractedData || {
    fullName: "Maria Santos Silva",
    dateOfBirth: "15/03/1988",
    address: "Rua Augusta 127, 3º Dto, 1250-069 Lisboa",
    monthlyIncome: "€4,200.00",
    employer: "TechCorp Solutions, Lda.",
    documentType: "Salary Slip",
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -60 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex-1 flex items-center justify-center px-4 py-12"
    >
      <div className="max-w-3xl w-full">
        {/* Success Hero */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-center mb-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 mx-auto bg-gradient-to-br from-[#10B981] to-[#059669] rounded-2xl flex items-center justify-center shadow-lg shadow-green-200 mb-6"
          >
            <PartyPopper size={36} className="text-white" />
          </motion.div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#1A1A2E] mb-3">
            Welcome to{" "}
            <span className="text-[#E60012]">Fujitsu Bank</span>!
          </h1>
          <p className="text-[#666] text-base max-w-md mx-auto">
            Your account has been successfully created. Here&apos;s a summary of
            your verified information.
          </p>
        </motion.div>

        {/* Summary Cards Grid */}
        <div className="grid md:grid-cols-2 gap-5 mb-8">
          {/* Personal Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card-elevated p-5"
          >
            <h3 className="text-sm font-bold text-[#1A1A2E] flex items-center gap-2 mb-4">
              <CheckCircle size={16} className="text-[#10B981]" />
              Verified Identity
            </h3>
            <div className="space-y-3">
              {[
                { label: "Full Name", value: data.fullName },
                { label: "Date of Birth", value: data.dateOfBirth },
                { label: "Document No.", value: "PT-123456789" },
                { label: "Nationality", value: "Portuguese" },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex justify-between items-center text-sm"
                >
                  <span className="text-[#999]">{label}</span>
                  <span className="font-semibold text-[#333]">{value}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Financial Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card-elevated p-5"
          >
            <h3 className="text-sm font-bold text-[#1A1A2E] flex items-center gap-2 mb-4">
              <CheckCircle size={16} className="text-[#10B981]" />
              Financial Verification
            </h3>
            <div className="space-y-3">
              {[
                { label: "Monthly Income", value: data.monthlyIncome },
                { label: "Employer", value: data.employer },
                { label: "Address", value: data.address },
                { label: "Source Document", value: data.documentType },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex justify-between items-center text-sm"
                >
                  <span className="text-[#999]">{label}</span>
                  <span className="font-semibold text-[#333] text-right max-w-[200px]">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Signature Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="card-elevated p-5"
          >
            <h3 className="text-sm font-bold text-[#1A1A2E] flex items-center gap-2 mb-4">
              <CheckCircle size={16} className="text-[#10B981]" />
              Electronic Signature
            </h3>
            {signatureData ? (
              <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg p-3 mb-3">
                <Image
                  src={signatureData}
                  alt="Your signature"
                  className="max-h-16 mx-auto"
                  width={200}
                  height={64}
                  unoptimized
                />
              </div>
            ) : (
              <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg p-4 mb-3 text-center text-[#ccc] text-sm">
                Signature captured
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="namirial-badge text-[10px]">
                <Shield size={10} />
                Namirial QES Certified
              </span>
              <span className="text-[10px] text-[#999]">
                {new Date().toLocaleDateString("en-GB")}
              </span>
            </div>
          </motion.div>

          {/* Account Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="card-elevated p-5"
          >
            <h3 className="text-sm font-bold text-[#1A1A2E] flex items-center gap-2 mb-4">
              <CreditCard size={16} className="text-[#E60012]" />
              Your New Account
            </h3>
            <div className="space-y-3">
              {[
                { label: "Account Type", value: "Current Account" },
                { label: "IBAN", value: "PT50 0042 •••• •••• 7891" },
                { label: "Status", value: "✅ Active" },
                { label: "Card", value: "Visa Debit (arriving in 5 days)" },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex justify-between items-center text-sm"
                >
                  <span className="text-[#999]">{label}</span>
                  <span className="font-semibold text-[#333]">{value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <button className="btn-primary px-8 py-3.5 text-sm">
            <Smartphone size={16} />
            Open Mobile Banking
          </button>
          <button className="btn-secondary px-8 py-3.5 text-sm flex items-center justify-center gap-2">
            <Download size={16} />
            Download Contract (PDF)
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
