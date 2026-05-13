"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Upload,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  X,
} from "lucide-react";
import { useOCR, type OCRResult } from "@/hooks/useOCR";

interface DocumentStepProps {
  onNext: (data: OCRResult) => void;
  onBack: () => void;
}

export default function DocumentStep({ onNext, onBack }: DocumentStepProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [editedData, setEditedData] = useState<OCRResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { isProcessing, progress, result, processDocument, reset } = useOCR();

  const handleFileDrop = useCallback(
    async (file: File) => {
      setUploadedFile(file);
      const extracted = await processDocument(file);
      setEditedData(extracted);
    },
    [processDocument]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileDrop(file);
    },
    [handleFileDrop]
  );

  const onFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFileDrop(file);
    },
    [handleFileDrop]
  );

  const handleReset = () => {
    setUploadedFile(null);
    setEditedData(null);
    reset();
  };

  const handleFieldChange = (field: keyof OCRResult, value: string) => {
    if (editedData) {
      setEditedData({ ...editedData, [field]: value });
    }
  };

  const ocrFields: { key: keyof OCRResult; label: string }[] = [
    { key: "fullName", label: "Full Name" },
    { key: "dateOfBirth", label: "Date of Birth" },
    { key: "address", label: "Address" },
    { key: "monthlyIncome", label: "Monthly Income" },
    { key: "employer", label: "Employer" },
    { key: "documentType", label: "Document Type" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -60 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex-1 flex items-center justify-center px-4 py-12"
    >
      <div className="max-w-5xl w-full">
        {/* Step Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto bg-red-50 rounded-xl flex items-center justify-center mb-4">
            <FileText size={28} className="text-[#E60012]" />
          </div>
          <h2 className="text-2xl font-bold text-[#1A1A2E] mb-2">
            Document Extraction
          </h2>
          <p className="text-[#666] text-sm">
            Upload a salary slip or utility bill. Our OCR engine will
            automatically extract the data.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!uploadedFile ? (
            /* Drop Zone */
            <motion.div
              key="dropzone"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div
                className={`drop-zone card-elevated ${
                  isDragOver ? "drag-over" : ""
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={onDrop}
                onClick={() => fileRef.current?.click()}
              >
                <Upload
                  size={40}
                  className={`mx-auto mb-4 ${
                    isDragOver ? "text-[#E60012]" : "text-[#ccc]"
                  }`}
                />
                <p className="text-lg font-semibold text-[#444] mb-2">
                  Drag & drop your document here
                </p>
                <p className="text-sm text-[#999] mb-4">
                  Supported: PDF, JPG, PNG • Max 10 MB
                </p>
                <button className="btn-primary text-sm px-6 py-2.5">
                  Browse Files
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={onFileSelect}
                />
              </div>
            </motion.div>
          ) : (
            /* Side-by-Side: Document Preview + Extracted Data */
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid md:grid-cols-2 gap-6"
            >
              {/* Left: Document Preview */}
              <div className="card-elevated p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-[#1A1A2E] flex items-center gap-2">
                    <FileText size={16} className="text-[#E60012]" />
                    Uploaded Document
                  </h3>
                  <button
                    onClick={handleReset}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-[#999] hover:text-[#E60012] transition"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Mock Document */}
                <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg p-6 min-h-[320px] relative">
                  {/* Simulated document content */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-[#E60012]/10 rounded-lg flex items-center justify-center">
                        <FileText size={20} className="text-[#E60012]" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#333]">
                          {uploadedFile.name}
                        </p>
                        <p className="text-[10px] text-[#999]">
                          {(uploadedFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>

                    {/* Simulated document lines */}
                    <div className="space-y-2.5">
                      <div className="h-3 bg-[#E0E0E0] rounded-full w-3/4" />
                      <div className="h-3 bg-[#E0E0E0] rounded-full w-full" />
                      <div className="h-3 bg-[#E0E0E0] rounded-full w-5/6" />
                      <div className="h-6 mt-3" />
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <div className="h-2 bg-[#D1D5DB] rounded w-1/2" />
                          <div className="h-3.5 bg-[#E0E0E0] rounded w-full" />
                        </div>
                        <div className="space-y-2">
                          <div className="h-2 bg-[#D1D5DB] rounded w-2/3" />
                          <div className="h-3.5 bg-[#E0E0E0] rounded w-full" />
                        </div>
                      </div>
                      <div className="h-6 mt-2" />
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <div className="h-2 bg-[#D1D5DB] rounded w-1/3" />
                          <div className="h-3.5 bg-[#E0E0E0] rounded w-4/5" />
                        </div>
                        <div className="space-y-2">
                          <div className="h-2 bg-[#D1D5DB] rounded w-1/2" />
                          <div className="h-3.5 bg-[#E0E0E0] rounded w-3/4" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Processing overlay */}
                  {isProcessing && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center"
                    >
                      <div className="spinner mb-3" />
                      <p className="text-sm font-semibold text-[#444]">
                        Extracting data…
                      </p>
                      <div className="w-32 h-1.5 bg-[#E5E7EB] rounded-full mt-3 overflow-hidden">
                        <motion.div
                          className="h-full bg-[#E60012] rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      <p className="text-[10px] text-[#999] mt-1">
                        {progress}%
                      </p>
                    </motion.div>
                  )}
                </div>

                {/* Namirial badge */}
                <div className="mt-3 flex justify-end">
                  <span className="namirial-badge text-[10px]">
                    🔍 Namirial OCR Engine
                  </span>
                </div>
              </div>

              {/* Right: Extracted Fields */}
              <div className="card-elevated p-5">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-sm font-bold text-[#1A1A2E] flex items-center gap-2">
                    <CheckCircle
                      size={16}
                      className={
                        result ? "text-[#10B981]" : "text-[#D1D5DB]"
                      }
                    />
                    Extracted Data
                  </h3>
                  {result && (
                    <span className="text-[10px] font-medium bg-[#D1FAE5] text-[#059669] px-2 py-0.5 rounded-full">
                      {ocrFields.length} fields found
                    </span>
                  )}
                </div>

                {!result && !isProcessing && (
                  <div className="flex flex-col items-center justify-center min-h-[320px] text-[#ccc]">
                    <FileText size={40} className="mb-2" />
                    <p className="text-sm">Waiting for extraction…</p>
                  </div>
                )}

                {isProcessing && (
                  <div className="space-y-4 min-h-[320px]">
                    {ocrFields.map((_, i) => (
                      <div key={i} className="space-y-1.5">
                        <div className="h-2.5 bg-[#F3F4F6] rounded w-1/4 animate-pulse" />
                        <div className="h-9 bg-[#F3F4F6] rounded-lg animate-pulse" />
                      </div>
                    ))}
                  </div>
                )}

                {result && editedData && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    {ocrFields.map(({ key, label }, i) => (
                      <motion.div
                        key={key}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                      >
                        <label className="text-xs font-semibold text-[#999] mb-1 block">
                          {label}
                        </label>
                        <input
                          type="text"
                          value={editedData[key]}
                          onChange={(e) =>
                            handleFieldChange(key, e.target.value)
                          }
                          className="w-full px-3 py-2.5 rounded-lg text-sm font-medium text-[#333] ocr-field-pulse focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                          style={{ animationDelay: `${i * 0.15}s` }}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button onClick={onBack} className="btn-secondary">
            <ArrowLeft size={16} />
            Back
          </button>
          <button
            onClick={() => editedData && onNext(editedData)}
            disabled={!result}
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
