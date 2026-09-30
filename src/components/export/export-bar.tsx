"use client";

import { Download, FileCheck, FileSpreadsheet, RotateCcw, Loader2 } from "lucide-react";

interface ExportBarProps {
  documentCount: number;
  onExportPdf: () => void;
  onOpenAudit: () => void;
  onReset: () => void;
  isMerging: boolean;
  mergeProgress: { current: number; total: number } | null;
  disabled?: boolean;
}

export function ExportBar({
  documentCount,
  onExportPdf,
  onOpenAudit,
  onReset,
  isMerging,
  mergeProgress,
  disabled,
}: ExportBarProps) {
  return (
    <div className="sticky bottom-4 z-30 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            <FileCheck className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
              Sequence Ready for Export
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {documentCount} documents arranged in compliance with SOP rules and date constraints.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end flex-wrap">
          <button
            type="button"
            onClick={onReset}
            disabled={isMerging}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
            <span>Reset</span>
          </button>

          <button
            type="button"
            onClick={onOpenAudit}
            disabled={disabled || isMerging}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-slate-500" />
            <span>Audit Report</span>
          </button>

          <button
            type="button"
            onClick={onExportPdf}
            disabled={disabled || isMerging}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 active:scale-95 transition-all disabled:opacity-50"
          >
            {isMerging ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>
                  Merging {mergeProgress ? `(${mergeProgress.current}/${mergeProgress.total})` : "PDFs..."}
                </span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                <span>Merge & Download Final PDF</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
