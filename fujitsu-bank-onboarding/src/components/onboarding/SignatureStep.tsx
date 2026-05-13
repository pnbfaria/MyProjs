"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  PenLine,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  CheckCircle,
  Shield,
} from "lucide-react";

interface SignatureStepProps {
  onNext: (signature: string) => void;
  onBack: () => void;
}

export default function SignatureStep({ onNext, onBack }: SignatureStepProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = "#1A1A2E";
  }, []);

  const getCoords = (
    e: React.MouseEvent | React.TouchEvent
  ): { x: number; y: number } => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDrawing = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx) return;
      const { x, y } = getCoords(e);
      ctx.beginPath();
      ctx.moveTo(x, y);
      setIsDrawing(true);
      setHasSigned(true);
    },
    []
  );

  const draw = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      if (!isDrawing) return;
      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx) return;
      const { x, y } = getCoords(e);
      ctx.lineTo(x, y);
      ctx.stroke();
    },
    [isDrawing]
  );

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
  }, []);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
    setIsConfirmed(false);
  };

  const confirmSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const signatureData = canvas.toDataURL("image/png");
    setIsConfirmed(true);
    // Wait a moment, then call onNext
    setTimeout(() => onNext(signatureData), 800);
  };

  const now = new Date();
  const timestamp = now.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }) + ", " + now.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -60 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex-1 flex items-center justify-center px-4 py-12"
    >
      <div className="max-w-3xl w-full">
        {/* Step Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto bg-red-50 rounded-xl flex items-center justify-center mb-4">
            <PenLine size={28} className="text-[#E60012]" />
          </div>
          <h2 className="text-2xl font-bold text-[#1A1A2E] mb-2">
            Electronic Signature
          </h2>
          <p className="text-[#666] text-sm">
            Review the terms below and sign to complete your application.
          </p>
        </div>

        {/* Terms & Conditions */}
        <div className="card-elevated mb-6">
          <div className="document-viewer">
            <h3>Terms & Conditions – Fujitsu Bank Account Opening</h3>
            <p>
              <strong>1. Account Agreement.</strong> By signing this document,
              you agree to open a current account with Fujitsu Bank, S.A.,
              registered in Portugal under license No. 0042. This agreement is
              governed by the laws of Portugal and the European Union.
            </p>
            <p>
              <strong>2. Data Processing.</strong> Fujitsu Bank processes
              personal data in compliance with Regulation (EU) 2016/679 (GDPR).
              Your identity verification and document extraction are handled by
              Namirial S.p.A., an EU-qualified trust service provider under
              eIDAS Regulation (EU) No 910/2014.
            </p>
            <p>
              <strong>3. Electronic Signature.</strong> This qualified
              electronic signature (QES) holds the same legal standing as a
              handwritten signature under Article 25(2) of the eIDAS
              Regulation. The signing certificate is issued by Namirial S.p.A.
            </p>
            <p>
              <strong>4. Account Features.</strong> Your current account
              includes: zero monthly maintenance fees for the first 12 months,
              a Visa debit card, online and mobile banking access, SEPA
              transfers, and standing order capabilities.
            </p>
            <p>
              <strong>5. Liability.</strong> The account holder is responsible
              for maintaining the security of login credentials. Fujitsu Bank
              shall not be liable for losses due to unauthorized access
              resulting from client negligence.
            </p>
            <p>
              <strong>6. Withdrawal.</strong> You have the right to withdraw
              from this agreement within 14 days without penalty, as per EU
              Consumer Rights Directive 2011/83/EU.
            </p>
          </div>
        </div>

        {/* Signature Area */}
        <div className="card-elevated p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[#1A1A2E] flex items-center gap-2">
              <PenLine size={16} className="text-[#E60012]" />
              Sign Below
            </h3>
            <div className="flex items-center gap-2">
              <span className="namirial-badge text-[10px]">
                <Shield size={10} />
                Certified by Namirial
              </span>
            </div>
          </div>

          {/* Canvas */}
          <div className="relative">
            <canvas
              ref={canvasRef}
              className="signature-canvas w-full"
              style={{ height: "180px" }}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />

            {!hasSigned && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <p className="text-[#D1D5DB] text-sm font-medium">
                  Draw your signature here
                </p>
              </div>
            )}

            {isConfirmed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-lg flex items-center justify-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="flex flex-col items-center"
                >
                  <div className="w-14 h-14 bg-[#10B981] rounded-full flex items-center justify-center">
                    <CheckCircle size={28} className="text-white" />
                  </div>
                  <span className="text-sm font-semibold text-[#10B981] mt-2">
                    Signature Confirmed
                  </span>
                </motion.div>
              </motion.div>
            )}
          </div>

          {/* Timestamp & Actions */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-[10px] text-[#999]">
              Signing timestamp: {timestamp} UTC+1
            </p>
            <div className="flex gap-2">
              <button
                onClick={clearCanvas}
                disabled={isConfirmed}
                className="btn-secondary text-sm px-4 py-2 flex items-center gap-1.5"
              >
                <RotateCcw size={14} />
                Clear
              </button>
              <button
                onClick={confirmSignature}
                disabled={!hasSigned || isConfirmed}
                className="btn-primary text-sm px-4 py-2"
              >
                <CheckCircle size={14} />
                Confirm Signature
              </button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button onClick={onBack} className="btn-secondary">
            <ArrowLeft size={16} />
            Back
          </button>
          <button disabled className="btn-primary opacity-50 cursor-not-allowed">
            Waiting for signature…
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
