"use client";

import { OrderingResult } from "@/types/analysis";
import { generateAuditReportMarkdown } from "@/lib/audit/audit-generator";
import { X, Download, ShieldCheck, Copy, Check } from "lucide-react";
import { useState } from "react";

interface AuditReportModalProps {
  result: OrderingResult | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload: (format: "md" | "html") => void;
}

export function AuditReportModal({
  result,
  isOpen,
  onClose,
  onDownload,
}: AuditReportModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !result) return null;

  const markdownText = generateAuditReportMarkdown(result);

  const handleCopy = () => {
    navigator.clipboard.writeText(markdownText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-3xl max-h-[85vh] flex flex-col rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden dark:bg-slate-900 dark:border-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 p-5 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm sm:text-base dark:text-white">
                Compliance & Ordering Audit Report
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                SOP: {result.sop.name} • {result.finalOrder.length} Documents Sequenced
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Report Content */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="rounded-xl bg-slate-900 p-4 text-slate-100 font-mono text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap select-text">
            {markdownText}
          </div>
        </div>

        {/* Footer with Download Options */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 p-4 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors w-full sm:w-auto justify-center dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span>Copied to Clipboard</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-slate-500" />
                <span>Copy Markdown</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => onDownload("md")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download (.MD)</span>
            </button>
            <button
              type="button"
              onClick={() => onDownload("html")}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800 transition-colors dark:bg-white dark:text-slate-900"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download (.HTML)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
