"use client";

import { useState, useCallback } from "react";

export interface OCRResult {
  fullName: string;
  dateOfBirth: string;
  address: string;
  monthlyIncome: string;
  employer: string;
  documentType: string;
}

export function useOCR() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<OCRResult | null>(null);

  const processDocument = useCallback(async (file: File) => {
    setIsProcessing(true);
    setProgress(0);
    setResult(null);

    // Simulate staged processing
    const stages = [10, 25, 40, 55, 70, 85, 95, 100];
    for (const stage of stages) {
      await new Promise((r) => setTimeout(r, 250));
      setProgress(stage);
    }

    // Return hardcoded extracted data
    const extracted: OCRResult = {
      fullName: "Maria Santos Silva",
      dateOfBirth: "15/03/1988",
      address: "Rua Augusta 127, 3º Dto, 1250-069 Lisboa",
      monthlyIncome: "€4,200.00",
      employer: "TechCorp Solutions, Lda.",
      documentType: file.name.toLowerCase().includes("salary")
        ? "Salary Slip"
        : "Utility Bill",
    };

    await new Promise((r) => setTimeout(r, 300));
    setIsProcessing(false);
    setResult(extracted);

    return extracted;
  }, []);

  const reset = useCallback(() => {
    setIsProcessing(false);
    setProgress(0);
    setResult(null);
  }, []);

  return { isProcessing, progress, result, processDocument, reset };
}
