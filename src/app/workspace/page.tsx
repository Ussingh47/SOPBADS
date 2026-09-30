"use client";

import { useWorkspace } from "@/hooks/use-workspace";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { SopSelector } from "@/components/sop/sop-selector";
import { SopRuleViewer } from "@/components/sop/sop-rule-viewer";
import { SopBuilderModal } from "@/components/sop/sop-builder-modal";
import { DropZone } from "@/components/upload/drop-zone";
import { UploadQueue } from "@/components/upload/upload-queue";
import { ConflictBanner } from "@/components/analysis/conflict-banner";
import { AnalysisTable } from "@/components/analysis/analysis-table";
import { OrderComparison } from "@/components/ordering/order-comparison";
import { ManualReorderList } from "@/components/ordering/manual-reorder-list";
import { PdfPreviewModal } from "@/components/pdf-preview/pdf-preview-modal";
import { AuditReportModal } from "@/components/export/audit-report-modal";
import { ExportBar } from "@/components/export/export-bar";
import {
  AlertCircle,
  RotateCcw,
} from "lucide-react";

export default function WorkspacePage() {
  const {
    sops,
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
  } = useWorkspace();

  const hasResults = orderingResult !== null && analyzedDocuments.length > 0;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-slate-950 font-sans">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Workspace Sub-Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight dark:text-white">
                Document Workspace
              </h1>
              <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800 dark:bg-blue-900/60 dark:text-blue-200">
                Active Session
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 dark:text-slate-400">
              Upload multiple PDF documents to classify, validate dependencies, and generate a verified sequence.
            </p>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
            <button
              type="button"
              onClick={handleResetSession}
              disabled={isAnalyzing || isMerging}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
              <span>New Session</span>
            </button>
          </div>
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="flex items-center justify-between p-4 rounded-xl border border-red-200 bg-red-50 text-red-800 text-xs dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-red-600 hover:underline font-medium text-xs ml-4"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* SOP Selection Header */}
        <SopSelector
          sops={sops}
          selectedSop={selectedSop}
          onSelectSop={handleSelectSop}
          onOpenRules={() => setSopDrawerOpen(true)}
          onOpenNewBuilder={handleOpenNewBuilder}
          onEditCurrentSop={handleEditCurrentSop}
          disabled={isAnalyzing || isMerging}
        />


        {/* Upload & Staging Area */}
        <div className="space-y-4">
          <DropZone
            onFilesSelected={handleAddFiles}
            disabled={isAnalyzing || isMerging}
          />

          <UploadQueue
            files={uploadedFiles}
            onRemove={handleRemoveUploadedFile}
            onReorder={handleReorderUploadedFiles}
            onAnalyze={runAnalysis}
            isAnalyzing={isAnalyzing}
            progress={analysisProgress}
            statusText={currentAnalysisStatus}
          />
        </div>

        {/* Post-Analysis Sections */}
        {hasResults && orderingResult && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Step 1: Conflict & Compliance Alerts */}
            <ConflictBanner conflicts={orderingResult.conflicts} />

            {/* Step 2: Extracted Classification Diagnostics Table */}
            <AnalysisTable
              documents={orderingResult.originalOrder}
              onPreview={(doc) => setPreviewDoc(doc)}
            />

            {/* Step 3: Original vs Recommended Order Comparison */}
            <OrderComparison
              originalOrder={orderingResult.originalOrder}
              recommendedOrder={orderingResult.recommendedOrder}
              movedCount={orderingResult.movedCount}
              uncertainCount={orderingResult.uncertainCount}
            />

            {/* Step 4: Final Sequence & Manual Override Drag-and-Drop */}
            <ManualReorderList
              documents={orderingResult.finalOrder}
              onReorder={handleManualReorder}
              onReset={handleResetToRecommended}
              hasManualOverrides={orderingResult.hasManualOverrides}
              onPreview={(doc) => setPreviewDoc(doc)}
            />

            {/* Sticky Export & Audit Bar */}
            <ExportBar
              documentCount={orderingResult.finalOrder.length}
              onExportPdf={handleExportMergedPdf}
              onOpenAudit={() => setAuditModalOpen(true)}
              onReset={handleResetSession}
              isMerging={isMerging}
              mergeProgress={mergeProgress}
            />
          </div>
        )}
      </main>

      <Footer />

      {/* Modals & Drawers */}
      <SopRuleViewer
        sop={selectedSop}
        isOpen={sopDrawerOpen}
        onClose={() => setSopDrawerOpen(false)}
      />

      <PdfPreviewModal
        doc={previewDoc}
        onClose={() => setPreviewDoc(null)}
      />

      <AuditReportModal
        result={orderingResult}
        isOpen={auditModalOpen}
        onClose={() => setAuditModalOpen(false)}
        onDownload={handleDownloadAuditReport}
      />

      <SopBuilderModal
        isOpen={sopBuilderOpen}
        onClose={() => setSopBuilderOpen(false)}
        onSave={handleSaveCustomSop}
        onDelete={handleDeleteCustomSop}
        initialSop={editingSop}
      />
    </div>
  );
}
