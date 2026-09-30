"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { DocumentAnalysis, UploadedFileItem } from "@/types/document";
import { SOPDefinition } from "@/types/sop";
import { OrderingResult } from "@/types/analysis";
import { BUILTIN_SOPS, getDefaultSOP, getSOPById } from "@/data/sops";
import { extractPdfTextAndMetadata } from "@/lib/pdf/pdf-extractor";
import { classifyDocument } from "@/lib/classification/classifier";
import { extractDatesFromText } from "@/lib/date/date-extractor";
import { runOrderingAnalysis } from "@/lib/ordering/ordering-engine";
import { mergeOrderedPdfs, downloadMergedPdfBlob } from "@/lib/pdf/pdf-merger";
import { downloadAuditReport } from "@/lib/audit/audit-generator";
import confetti from "canvas-confetti";

export function useWorkspace() {
  const [selectedSop, setSelectedSop] = useState<SOPDefinition>(getDefaultSOP());
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileItem[]>([]);
  const [analyzedDocuments, setAnalyzedDocuments] = useState<DocumentAnalysis[]>([]);
  const [manualOrder, setManualOrder] = useState<DocumentAnalysis[] | null>(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0); // 0 to 100
  const [currentAnalysisStatus, setCurrentAnalysisStatus] = useState<string>("");

  const [isMerging, setIsMerging] = useState(false);
  const [mergeProgress, setMergeProgress] = useState<{ current: number; total: number } | null>(null);

  const [previewDoc, setPreviewDoc] = useState<DocumentAnalysis | null>(null);
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [sopDrawerOpen, setSopDrawerOpen] = useState(false);
  const [customSops, setCustomSops] = useState<SOPDefinition[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem("doc_assistant_custom_sops");
      if (saved) {
        const parsed: SOPDefinition[] = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch {
      // Ignore during initial render
    }
    return [];
  });
  const [sopBuilderOpen, setSopBuilderOpen] = useState(false);
  const [editingSop, setEditingSop] = useState<SOPDefinition | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const allSops: SOPDefinition[] = useMemo(() => {
    return [...BUILTIN_SOPS, ...customSops];
  }, [customSops]);

  // Compute orderingResult deterministically via useMemo
  const orderingResult: OrderingResult | null = useMemo(() => {
    if (analyzedDocuments.length === 0) return null;
    return runOrderingAnalysis(
      analyzedDocuments,
      selectedSop,
      manualOrder || undefined
    );
  }, [analyzedDocuments, selectedSop, manualOrder]);

  // Clean up object URLs on unmount or reset
  const cleanupPreviews = useCallback(() => {
    analyzedDocuments.forEach((doc) => {
      if (doc.previewUrl) {
        URL.revokeObjectURL(doc.previewUrl);
      }
    });
  }, [analyzedDocuments]);

  useEffect(() => {
    return () => {
      cleanupPreviews();
    };
  }, [cleanupPreviews]);

  // Handle SOP change
  const handleSelectSop = useCallback((sopId: string) => {
    const found = allSops.find((s) => s.id === sopId) || getSOPById(sopId);
    if (found) {
      setSelectedSop(found);
      setManualOrder(null); // Reset manual overrides when switching SOP
    }
  }, [allSops]);

  // Custom SOP CRUD
  const handleSaveCustomSop = useCallback((sopToSave: SOPDefinition) => {
    setCustomSops((prev) => {
      const existingIndex = prev.findIndex((s) => s.id === sopToSave.id);
      let nextList: SOPDefinition[];
      if (existingIndex >= 0) {
        nextList = [...prev];
        nextList[existingIndex] = sopToSave;
      } else {
        nextList = [...prev, sopToSave];
      }
      try {
        localStorage.setItem("doc_assistant_custom_sops", JSON.stringify(nextList));
      } catch (e) {
        console.warn("Failed to persist custom SOPs:", e);
      }
      return nextList;
    });
    setSelectedSop(sopToSave);
    setManualOrder(null);
  }, []);

  const handleDeleteCustomSop = useCallback(
    (sopId: string) => {
      setCustomSops((prev) => {
        const nextList = prev.filter((s) => s.id !== sopId);
        try {
          localStorage.setItem("doc_assistant_custom_sops", JSON.stringify(nextList));
        } catch (e) {
          console.warn("Failed to update custom SOPs in storage:", e);
        }
        return nextList;
      });
      if (selectedSop.id === sopId) {
        setSelectedSop(getDefaultSOP());
        setManualOrder(null);
      }
    },
    [selectedSop]
  );

  const handleOpenNewBuilder = useCallback(() => {
    setEditingSop(null);
    setSopBuilderOpen(true);
  }, []);

  const handleEditCurrentSop = useCallback(() => {
    setEditingSop(selectedSop);
    setSopBuilderOpen(true);
  }, [selectedSop]);

  // Add files to upload queue
  const handleAddFiles = useCallback((newFiles: File[]) => {
    const pdfFiles = newFiles.filter((f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"));

    if (pdfFiles.length === 0) {
      setErrorMessage("Please upload valid PDF files only.");
      return;
    }

    setErrorMessage(null);
    const newItems: UploadedFileItem[] = pdfFiles.map((file) => ({
      id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      file,
      fileName: file.name,
      fileSize: file.size,
      uploadStatus: "ready",
    }));

    setUploadedFiles((prev) => [...prev, ...newItems]);
  }, []);

  // Remove file before analysis
  const handleRemoveUploadedFile = useCallback((id: string) => {
    setUploadedFiles((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // Reorder uploaded files before analysis
  const handleReorderUploadedFiles = useCallback((newOrder: UploadedFileItem[]) => {
    setUploadedFiles(newOrder);
  }, []);

  // Start document analysis pipeline
  const runAnalysis = useCallback(async () => {
    if (uploadedFiles.length === 0) return;

    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setErrorMessage(null);
    setManualOrder(null);

    const analyzedList: DocumentAnalysis[] = [];
    const total = uploadedFiles.length;

    try {
      for (let i = 0; i < total; i++) {
        const item = uploadedFiles[i];
        setCurrentAnalysisStatus(`Processing ${item.fileName} (${i + 1} of ${total})...`);
        setAnalysisProgress(Math.round(((i) / total) * 100));

        try {
          const arrayBuffer = await item.file.arrayBuffer();

          // 1. Text & metadata extraction via PDF.js
          const extracted = await extractPdfTextAndMetadata(arrayBuffer, {
            enableOcrFallback: true,
          });

          // 2. Document classification
          const allowedTypes = selectedSop.steps.flatMap((s) => s.documentTypes);
          const classification = classifyDocument(item.fileName, extracted.text, allowedTypes);

          // 3. Date extraction
          const dateResult = extractDatesFromText(extracted.text, classification.documentType);

          // Create object URL for local PDF preview
          const blob = new Blob([arrayBuffer], { type: "application/pdf" });
          const previewUrl = URL.createObjectURL(blob);

          const analysis: DocumentAnalysis = {
            id: item.id,
            fileName: item.fileName,
            fileSize: item.fileSize,
            documentType: classification.documentType,
            documentTypeName: classification.documentTypeName,
            confidence: classification.confidence,
            date: dateResult.primaryDate,
            dateConfidence: dateResult.confidence,
            candidateDates: dateResult.candidates,
            hasDateConflict: dateResult.hasConflict,
            referenceNumber: classification.referenceNumber,
            extractedText: extracted.text,
            pageCount: extracted.pageCount,
            status: classification.status,
            statusMessage: classification.statusMessage || dateResult.message,
            file: item.file,
            previewUrl,
            rawArrayBuffer: arrayBuffer,
          };

          analyzedList.push(analysis);
        } catch (fileErr: unknown) {
          console.error(`Error analyzing ${item.fileName}:`, fileErr);
          const errorMsg = (fileErr as Error)?.message || "Document could not be analyzed.";

          analyzedList.push({
            id: item.id,
            fileName: item.fileName,
            fileSize: item.fileSize,
            documentType: null,
            documentTypeName: "Unreadable Document",
            confidence: 0,
            date: null,
            referenceNumber: null,
            extractedText: "",
            pageCount: 1,
            status: "error",
            statusMessage: errorMsg,
            file: item.file,
          });
        }
      }

      setAnalysisProgress(100);
      setCurrentAnalysisStatus("Analysis complete!");
      setAnalyzedDocuments(analyzedList);
    } catch (err: unknown) {
      console.error("Analysis pipeline error:", err);
      setErrorMessage("An unexpected error occurred during document analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  }, [uploadedFiles, selectedSop]);


  // Manual reordering update
  const handleManualReorder = useCallback((updatedOrder: DocumentAnalysis[]) => {
    const tagged = updatedOrder.map((doc) => ({
      ...doc,
      isManuallyOverridden: true,
    }));
    setManualOrder(tagged);
  }, []);

  // Reset manual override back to algorithmic recommendation
  const handleResetToRecommended = useCallback(() => {
    setManualOrder(null);
  }, []);

  // Merge and Export final PDF
  const handleExportMergedPdf = useCallback(async () => {
    if (!orderingResult || orderingResult.finalOrder.length === 0) return;

    setIsMerging(true);
    setMergeProgress({ current: 0, total: orderingResult.finalOrder.length });
    setErrorMessage(null);

    try {
      const mergedBytes = await mergeOrderedPdfs(
        orderingResult.finalOrder,
        (current, total) => {
          setMergeProgress({ current, total });
        }
      );

      const today = new Date().toISOString().split("T")[0];
      downloadMergedPdfBlob(
        mergedBytes,
        `ordered-documents-${selectedSop.id}-${today}.pdf`
      );

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // Confetti is a visual extra
      }
    } catch (err: unknown) {
      console.error("PDF Merge error:", err);
      setErrorMessage((err as Error)?.message || "Failed to merge PDF documents.");
    } finally {
      setIsMerging(false);
      setMergeProgress(null);
    }
  }, [orderingResult, selectedSop]);

  // Download Audit Report
  const handleDownloadAuditReport = useCallback((format: "md" | "html" = "md") => {
    if (!orderingResult) return;
    downloadAuditReport(orderingResult, format);
  }, [orderingResult]);

  // Full Session Reset
  const handleResetSession = useCallback(() => {
    cleanupPreviews();
    setUploadedFiles([]);
    setAnalyzedDocuments([]);
    setManualOrder(null);
    setPreviewDoc(null);
    setErrorMessage(null);
    setAnalysisProgress(0);
    setCurrentAnalysisStatus("");
  }, [cleanupPreviews]);

  return {
    sops: allSops,
    selectedSop,
    handleSelectSop,
    uploadedFiles,
    handleAddFiles,
    handleRemoveUploadedFile,
    handleReorderUploadedFiles,
    runAnalysis,
    isAnalyzing,
    analysisProgress,
    currentAnalysisStatus,
    analyzedDocuments,
    orderingResult,
    manualOrder,
    handleManualReorder,
    handleResetToRecommended,
    isMerging,
    mergeProgress,
    handleExportMergedPdf,
    handleDownloadAuditReport,
    previewDoc,
    setPreviewDoc,
    auditModalOpen,
    setAuditModalOpen,
    sopDrawerOpen,
    setSopDrawerOpen,
    sopBuilderOpen,
    setSopBuilderOpen,
    editingSop,
    handleOpenNewBuilder,
    handleEditCurrentSop,
    handleSaveCustomSop,
    handleDeleteCustomSop,
    errorMessage,
    setErrorMessage,
    handleResetSession,
  };
}
