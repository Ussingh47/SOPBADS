"use client";

import { DocumentAnalysis } from "@/types/document";
import { FileText } from "lucide-react";

interface OrderComparisonProps {
  originalOrder: DocumentAnalysis[];
  recommendedOrder: DocumentAnalysis[];
  movedCount: number;
  uncertainCount: number;
}

export function OrderComparison({
  originalOrder,
  recommendedOrder,
  movedCount,
  uncertainCount,
}: OrderComparisonProps) {
  if (originalOrder.length === 0) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 dark:border-slate-800 dark:bg-slate-900">
      {/* Metric Callout */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
        <div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
            Original Upload vs. SOP Recommended Order
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Side-by-side transition map highlighting documents sequenced by SOP rules and dependencies.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="rounded-lg bg-blue-50 px-2.5 py-1 font-semibold text-blue-700 border border-blue-200/60 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-900">
            {movedCount} {movedCount === 1 ? "document moved" : "documents moved"}
          </span>
          {uncertainCount > 0 && (
            <span className="rounded-lg bg-amber-50 px-2.5 py-1 font-semibold text-amber-700 border border-amber-200/60 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900">
              {uncertainCount} {uncertainCount === 1 ? "requires review" : "require review"}
            </span>
          )}
        </div>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Original Order Column */}
        <div className="space-y-2">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-1">
            Original Upload Order
          </div>
          <div className="space-y-2">
            {originalOrder.map((doc, idx) => (
              <div
                key={`orig-${doc.id}`}
                className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/60 text-xs dark:border-slate-800 dark:bg-slate-800/40"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-200 text-[11px] font-mono font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                <span className="font-medium text-slate-800 truncate flex-1 dark:text-slate-200">
                  {doc.fileName}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Order Column */}
        <div className="space-y-2">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-blue-600 px-1 dark:text-blue-400">
            Recommended SOP Sequence
          </div>
          <div className="space-y-2">
            {recommendedOrder.map((doc, idx) => {
              const origIdx = originalOrder.findIndex((o) => o.id === doc.id);
              const hasMoved = origIdx !== -1 && origIdx !== idx;

              return (
                <div
                  key={`rec-${doc.id}`}
                  className={`flex items-center justify-between p-3 rounded-xl border text-xs transition-colors ${
                    hasMoved
                      ? "border-blue-300 bg-blue-50/80 shadow-xs dark:border-blue-800 dark:bg-blue-950/40"
                      : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[11px] font-mono font-bold ${
                        hasMoved
                          ? "bg-blue-600 text-white"
                          : "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                      }`}
                    >
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <FileText className="h-4 w-4 text-blue-600 shrink-0 dark:text-blue-400" />
                    <div className="min-w-0 flex-1">
                      <span className="font-semibold text-slate-900 truncate block dark:text-white">
                        {doc.fileName}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        {doc.sopStepOrder ? `Step ${doc.sopStepOrder}: ` : ""}
                        {doc.documentTypeName}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 ml-2">
                    {hasMoved ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-blue-200/70 px-2 py-0.5 text-[10px] font-bold text-blue-900 dark:bg-blue-900 dark:text-blue-100">
                        Moved from #{origIdx + 1}
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        Unchanged
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
