"use client";

import { useState } from "react";
import { DocumentAnalysis } from "@/types/document";
import { formatDateForDisplay } from "@/lib/date/date-extractor";
import {
  X,
  FileText,
  FileCode2,
  Eye,
} from "lucide-react";

interface PdfPreviewModalProps {
  doc: DocumentAnalysis | null;
  onClose: () => void;
}

export function PdfPreviewModal({ doc, onClose }: PdfPreviewModalProps) {
  const [activeTab, setActiveTab] = useState<"viewer" | "text">("viewer");

  if (!doc) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-5xl h-[90vh] flex flex-col rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden dark:bg-slate-900 dark:border-slate-800">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3.5 bg-white dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center gap-3 min-w-0 pr-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-slate-900 text-sm truncate dark:text-white">
                {doc.fileName}
              </h3>
              <div className="flex items-center gap-3 text-[11px] text-slate-500 flex-wrap dark:text-slate-400">
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  {doc.documentTypeName || "Unclassified"}
                </span>
                <span>•</span>
                <span>{doc.pageCount} {doc.pageCount === 1 ? "page" : "pages"}</span>
                {doc.date && (
                  <>
                    <span>•</span>
                    <span>Date: {formatDateForDisplay(doc.date)}</span>
                  </>
                )}
                {doc.referenceNumber && (
                  <>
                    <span>•</span>
                    <span className="font-mono">Ref: {doc.referenceNumber}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action Tabs & Controls */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-xs dark:border-slate-800 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab("viewer")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-colors ${
                  activeTab === "viewer"
                    ? "bg-white text-slate-900 shadow-2xs dark:bg-slate-900 dark:text-white"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                <Eye className="h-3.5 w-3.5" />
                <span>PDF Viewer</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("text")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-colors ${
                  activeTab === "text"
                    ? "bg-white text-slate-900 shadow-2xs dark:bg-slate-900 dark:text-white"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                <FileCode2 className="h-3.5 w-3.5" />
                <span>Extracted Text</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors ml-2 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Viewer Content */}
        <div className="flex-1 bg-slate-100 relative overflow-hidden flex items-center justify-center dark:bg-slate-950">
          {activeTab === "viewer" ? (
            doc.previewUrl ? (
              <iframe
                src={`${doc.previewUrl}#view=FitH&toolbar=1`}
                title={doc.fileName}
                className="w-full h-full border-none"
              />
            ) : (
              <div className="text-center p-8 text-slate-500">
                <FileText className="h-12 w-12 mx-auto mb-2 text-slate-400" />
                <p className="text-sm font-medium">PDF preview is unavailable for this item.</p>
              </div>
            )
          ) : (
            <div className="w-full h-full overflow-y-auto p-6 bg-white dark:bg-slate-900 text-xs">
              <div className="max-w-3xl mx-auto space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-800/40 dark:border-slate-800">
                  <h4 className="font-semibold text-slate-900 text-xs uppercase tracking-wider mb-2 dark:text-white">
                    Metadata Extraction Diagnostics
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
                    <div>
                      <span className="text-slate-400 block">Identified Type</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {doc.documentTypeName || "None"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Confidence Score</span>
                      <span className="font-mono font-bold text-blue-600">
                        {doc.confidence}%
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Extracted Date</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {doc.date || "Not detected"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Reference No</span>
                      <span className="font-mono text-slate-800 dark:text-slate-200">
                        {doc.referenceNumber || "None"}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-900 text-xs uppercase tracking-wider mb-2 dark:text-white">
                    Raw Extracted Text ({doc.extractedText.length} characters)
                  </h4>
                  <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-[11px] leading-relaxed whitespace-pre-wrap max-h-[50vh] overflow-y-auto">
                    {doc.extractedText || "(No text content extracted. Document may be an image-only scan.)"}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 px-5 py-3 bg-white text-xs text-slate-500 dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-700 dark:text-slate-300">
              Status:
            </span>
            <span>{doc.statusMessage || "Parsed successfully."}</span>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg bg-slate-900 px-4 py-1.5 text-xs font-medium text-white hover:bg-slate-800 transition-colors dark:bg-white dark:text-slate-900"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
}
