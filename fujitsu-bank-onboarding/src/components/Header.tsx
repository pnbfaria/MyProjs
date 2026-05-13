"use client";

import { Check } from "lucide-react";

interface HeaderProps {
  currentStep: number;
  totalSteps: number;
}

const stepLabels = ["Welcome", "Identity", "Documents", "Signature", "Complete"];

export default function Header({ currentStep, totalSteps }: HeaderProps) {
  const progressPercent = ((currentStep) / totalSteps) * 100;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[#E0E0E0]">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <rect width="36" height="36" rx="8" fill="#E60012" />
              <text
                x="50%"
                y="55%"
                dominantBaseline="middle"
                textAnchor="middle"
                fill="white"
                fontSize="16"
                fontWeight="700"
                fontFamily="sans-serif"
              >
                F
              </text>
            </svg>
            <div className="ml-3">
              <span className="text-lg font-bold text-[#1A1A2E] tracking-tight">
                Fujitsu Bank
              </span>
              <span className="block text-[10px] text-[#999] font-medium tracking-wider uppercase -mt-0.5">
                Digital Onboarding
              </span>
            </div>
          </div>
        </div>

        {/* Step Progress */}
        <div className="hidden md:flex items-center gap-2">
          {stepLabels.map((label, i) => {
            const stepNum = i + 1;
            const isCompleted = stepNum < currentStep;
            const isActive = stepNum === currentStep;
            return (
              <div key={label} className="flex items-center gap-2">
                <div className="flex flex-col items-center">
                  <div
                    className={`step-dot ${
                      isCompleted
                        ? "completed"
                        : isActive
                        ? "active"
                        : "upcoming"
                    }`}
                  >
                    {isCompleted ? <Check size={14} /> : stepNum}
                  </div>
                  <span
                    className={`text-[10px] mt-1 font-medium ${
                      isActive
                        ? "text-[#E60012]"
                        : isCompleted
                        ? "text-[#10B981]"
                        : "text-[#9CA3AF]"
                    }`}
                  >
                    {label}
                  </span>
                </div>
                {i < stepLabels.length - 1 && (
                  <div
                    className={`w-8 h-0.5 rounded-full mb-4 ${
                      isCompleted ? "bg-[#10B981]" : "bg-[#E5E7EB]"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile Progress */}
        <div className="md:hidden flex flex-col items-end gap-1">
          <span className="text-xs font-semibold text-[#666]">
            Step {currentStep} of {totalSteps}
          </span>
          <div className="w-24 progress-track">
            <div
              className="progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
