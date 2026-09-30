"use client";

import { useState } from "react";
import { ConflictItem } from "@/types/analysis";
import { AlertCircle, AlertTriangle, Info, ChevronDown, ChevronUp, ShieldCheck } from "lucide-react";

interface ConflictBannerProps {
  conflicts: ConflictItem[];
}

export function ConflictBanner({ conflicts }: ConflictBannerProps) {
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (conflicts.length === 0) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/20 dark:text-emerald-300">
        <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
        <div className="text-xs">
          <p className="font-semibold text-sm">Sequence & Compliance Validation Passed</p>
          <p className="text-emerald-700 dark:text-emerald-400 mt-0.5">
            Zero conflicts or rule violations found. All mandatory documents match the SOP prerequisites.
          </p>
        </div>
      </div>
    );
  }

  const criticalCount = conflicts.filter((c) => c.severity === "critical").length;
  const warningCount = conflicts.filter((c) => c.severity === "warning").length;
  const infoCount = conflicts.filter((c) => c.severity === "info").length;

  return (
    <div className="space-y-3">
      {/* Summary Header */}
      <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-white shadow-xs dark:bg-slate-900 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-200">
            Detected Alerts & Verification Checks
          </span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {conflicts.length}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {criticalCount > 0 && (
            <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-0.5 rounded-md font-semibold dark:bg-red-950/40">
              <AlertCircle className="h-3 w-3" /> {criticalCount} Critical
            </span>
          )}
          {warningCount > 0 && (
            <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md font-semibold dark:bg-amber-950/40">
              <AlertTriangle className="h-3 w-3" /> {warningCount} Warnings
            </span>
          )}
          {infoCount > 0 && (
            <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md font-medium dark:bg-blue-950/40">
              <Info className="h-3 w-3" /> {infoCount} Notes
            </span>
          )}
        </div>
      </div>

      {/* Conflict Items List */}
      <div className="space-y-2">
        {conflicts.map((item) => {
          const isExpanded = !!expandedIds[item.id];
          const isCritical = item.severity === "critical";
          const isWarning = item.severity === "warning";

          const cardStyle = isCritical
            ? "border-red-200 bg-red-50/40 dark:border-red-900/50 dark:bg-red-950/20"
            : isWarning
            ? "border-amber-200 bg-amber-50/40 dark:border-amber-900/50 dark:bg-amber-950/20"
            : "border-blue-200 bg-blue-50/40 dark:border-blue-900/50 dark:bg-blue-950/20";

          const icon = isCritical ? (
            <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
          ) : isWarning ? (
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
          ) : (
            <Info className="h-4 w-4 text-blue-600 shrink-0" />
          );

          return (
            <div
              key={item.id}
              className={`rounded-xl border p-3.5 transition-all text-xs ${cardStyle}`}
            >
              <div
                onClick={() => toggleExpand(item.id)}
                className="flex items-center justify-between cursor-pointer select-none"
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  {icon}
                  <span className="font-semibold text-slate-900 dark:text-white truncate">
                    {item.title}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] text-slate-400 hidden sm:inline">
                    {isExpanded ? "Collapse" : "Why it matters"}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-slate-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-500" />
                  )}
                </div>
              </div>

              <p className="mt-1 text-slate-600 pl-6 dark:text-slate-300">
                {item.description}
              </p>

              {isExpanded && (
                <div className="mt-3 pl-6 pt-3 border-t border-slate-200/60 dark:border-slate-800 space-y-2">
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      Why this matters:
                    </span>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                      {item.whyItMatters}
                    </p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      Recommended Action:
                    </span>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                      {item.recommendedAction}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
