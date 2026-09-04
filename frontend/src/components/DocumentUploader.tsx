import React, { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Upload, X } from "lucide-react";
import { uploadDocument, processDocument } from "@/services/api";
import { Document, ProcessingStatus } from "@/types";

interface DocumentUploaderProps {
  onUploadComplete?: (doc: Document) => void;
}

const PROCESSING_STEPS = [
  { status: "extracting", label: "Extracting text..." },
  { status: "chunking", label: "Creating chunks..." },
  { status: "embedding", label: "Generating embeddings..." },
  { status: "indexing", label: "Indexing into Chroma..." },
  { status: "completed", label: "Ready for analysis" },
];

const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  onUploadComplete,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [progressText, setProgressText] = useState("");

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        await handleFileSelect(file);
      }
    },
    []
  );

  const handleFileSelect = async (file: File) => {
    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if (![".pdf", ".docx", ".txt"].includes(ext)) {
      setError("Unsupported file type. Use PDF, DOCX, or TXT.");
      return;
    }

    setFileName(file.name);
    setError("");
    setIsProcessing(true);
    setCurrentStep(0);
    setProgressText(PROCESSING_STEPS[0].label);

    try {
      const doc = await uploadDocument(file, "", "other");

      // Trigger processing
      const processSteps = ["extracting", "chunking", "embedding", "indexing", "completed"];

      // Poll for completion or process synchronously
      const pollInterval = setInterval(async () => {
        try {
          const result = await processDocument(doc.id);
          // If we get a result, processing is done
          clearInterval(pollInterval);
          setCurrentStep(4);
          setProgressText("Ready for analysis");
          setIsProcessing(false);
          onUploadComplete?.(result);
        } catch (e: any) {
          // Still processing or in progress
          const status = e.response?.data?.status;
          if (status && processSteps.indexOf(status) > -1) {
            setCurrentStep(processSteps.indexOf(status));
            setProgressText(PROCESSING_STEPS[processSteps.indexOf(status)]?.label || "Processing...");
          }
        }
      }, 1500);

      // Safety timeout
      setTimeout(() => {
        clearInterval(pollInterval);
        if (isProcessing) {
          setCurrentStep(4);
          setProgressText("Ready for analysis");
          setIsProcessing(false);
        }
      }, 60000);
    } catch (e: any) {
      setError(e.response?.data?.detail || "Upload failed");
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setFileName("");
    setIsProcessing(false);
    setCurrentStep(0);
    setProgressText("");
    setError("");
  };

  return (
    <div className="glass-card p-6">
      {!isProcessing && (
        <>
          <h2 className="text-xl font-semibold text-cyan-300 mb-4">
            Upload a Financial Document
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          <div
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
              isDragging
                ? "border-cyan-400 bg-cyan-400/10"
                : "border-gray-600 hover:border-cyan-400/50"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-cyan-400/10">
                <Upload className="h-8 w-8 text-cyan-400" />
              </div>
              <div>
                <p className="text-gray-300 font-medium">
                  Drag & drop your files here, or
                </p>
                <label className="text-cyan-400 hover:text-cyan-300 cursor-pointer font-medium">
                  browse files
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.docx,.txt"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(file);
                    }}
                  />
                </label>
              </div>
              <p className="text-xs text-gray-500">
                Supported: PDF, DOCX, TXT (max 50MB)
              </p>
            </div>
          </div>
        </>
      )}

      {isProcessing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-6 py-4"
        >
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-cyan-400" />
            <span className="font-medium">{fileName}</span>
            <button onClick={reset} className="text-gray-500 hover:text-gray-300">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="w-full max-w-md">
            <AnimatePresence>
              {PROCESSING_STEPS.map((step, index) => (
                <motion.div
                  key={step.status}
                  initial={{ opacity: index === currentStep ? 1 : 0.5, x: index === currentStep ? 0 : -10 }}
                  animate={{ opacity: index === currentStep ? 1 : 0.5, x: index === currentStep ? 0 : -10 }}
                  exit={{ opacity: 0, x: 10 }}
                  className={`flex items-center gap-3 py-2 ${
                    index < currentStep
                      ? "text-cyan-400"
                      : index === currentStep
                      ? "text-cyan-400 font-semibold"
                      : "text-gray-500"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                      index < currentStep
                        ? "bg-cyan-400 text-[#0a0f1b]"
                        : index === currentStep
                        ? "bg-cyan-400 text-[#0a0f1b]"
                        : "bg-gray-700 text-gray-500"
                    }`}
                  >
                    {index < currentStep ? "✓" : index + 1}
                  </div>
                  <span>{step.label}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="text-sm text-gray-400">{progressText}</div>
        </motion.div>
      )}
    </div>
  );
};

export default DocumentUploader;
