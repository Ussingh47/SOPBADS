"use client";

import { SOPDefinition } from "@/types/sop";
import { X, ArrowRight, BookOpen } from "lucide-react";

interface SopRuleViewerProps {
  sop: SOPDefinition;
  isOpen: boolean;
  onClose: () => void;
}

export function SopRuleViewer({ sop, isOpen, onClose }: SopRuleViewerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden dark:bg-slate-900 dark:border-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 p-5 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-base dark:text-white">
                {sop.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                SOP ID: <code className="text-[11px] font-mono">{sop.id}</code> • Category: {sop.category || "Compliance"}
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 dark:bg-slate-950 dark:border-slate-800">
            {sop.description}
          </div>

          {/* Sequential Steps */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider dark:text-white">
                Mandated Step Sequence ({sop.steps.length} Stages)
              </h4>
              <span className="text-[11px] text-slate-500">Ordered by Priority 1</span>
            </div>

            <div className="space-y-2.5">
              {sop.steps.map((step) => (
                <div
                  key={step.id}
                  className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-white hover:border-blue-200 transition-colors dark:border-slate-800 dark:bg-slate-900/60"
                >
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white text-xs font-bold dark:bg-white dark:text-slate-900">
                    {step.order}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-900 text-sm dark:text-white">
                        {step.name}
                      </span>
                      {step.required ? (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700 dark:bg-red-950/60 dark:text-red-300">
                          Mandatory
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                          Optional
                        </span>
                      )}
                    </div>
                    {step.description && (
                      <p className="text-xs text-slate-500 mt-0.5 dark:text-slate-400">
                        {step.description}
                      </p>
                    )}
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      <span className="text-[11px] text-slate-400 font-medium">Matching Types:</span>
                      {step.documentTypes.map((t) => (
                        <span
                          key={t}
                          className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Explicit Rules */}
          {sop.rules.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3 dark:text-white">
                Dependency Precedence Rules ({sop.rules.length})
              </h4>
              <div className="space-y-2">
                {sop.rules.map((rule, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 rounded-xl border border-amber-200/80 bg-amber-50/50 text-xs text-slate-800 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-200"
                  >
                    <ArrowRight className="h-4 w-4 text-amber-600 shrink-0" />
                    <div>
                      <span className="font-semibold">{rule.description || `${rule.before} must precede ${rule.after}`}</span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Dependency Rule: Step [{rule.before}] &rarr; Step [{rule.after}]
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 p-4 bg-slate-50 flex justify-end dark:border-slate-800 dark:bg-slate-950">
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800 transition-colors dark:bg-white dark:text-slate-900"
          >
            Close Rulebook
          </button>
        </div>
      </div>
    </div>
  );
}
