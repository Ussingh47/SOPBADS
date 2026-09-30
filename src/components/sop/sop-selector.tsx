"use client";

import { SOPDefinition } from "@/types/sop";
import { BookOpen, Info, Plus, Edit3 } from "lucide-react";

interface SopSelectorProps {
  sops: SOPDefinition[];
  selectedSop: SOPDefinition;
  onSelectSop: (id: string) => void;
  onOpenRules: () => void;
  onOpenNewBuilder: () => void;
  onEditCurrentSop: () => void;
  disabled?: boolean;
}

export function SopSelector({
  sops,
  selectedSop,
  onSelectSop,
  onOpenRules,
  onOpenNewBuilder,
  onEditCurrentSop,
  disabled,
}: SopSelectorProps) {
  return (
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs dark:bg-slate-900 dark:border-slate-800">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
          <BookOpen className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <label
              htmlFor="sop-select"
              className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block dark:text-slate-400"
            >
              Active SOP Rulebook
            </label>
            {selectedSop.isCustom && (
              <span className="rounded-full bg-indigo-50 px-2 py-0.2 text-[10px] font-bold text-indigo-700 border border-indigo-200/60 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800">
                Custom User SOP
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <select
              id="sop-select"
              value={selectedSop.id}
              onChange={(e) => onSelectSop(e.target.value)}
              disabled={disabled}
              className="font-semibold text-slate-900 text-xs sm:text-sm bg-transparent border-none p-0 focus:ring-0 cursor-pointer hover:text-blue-600 transition-colors disabled:opacity-50 dark:text-white truncate max-w-xs sm:max-w-md"
            >
              {sops.map((sop) => (
                <option
                  key={sop.id}
                  value={sop.id}
                  className="dark:bg-slate-900 text-slate-900 dark:text-white"
                >
                  {sop.name} ({sop.steps.length} steps) {sop.isCustom ? "[Custom]" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end lg:self-center flex-wrap">
        <div className="text-xs text-slate-500 hidden xl:block dark:text-slate-400 mr-1">
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {selectedSop.steps.length} Stages
          </span>{" "}
          • {selectedSop.rules.length} Rules
        </div>

        <button
          type="button"
          onClick={onOpenRules}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          <Info className="h-3.5 w-3.5 text-slate-500" />
          <span>View Rules</span>
        </button>

        {selectedSop.isCustom ? (
          <button
            type="button"
            onClick={onEditCurrentSop}
            className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors dark:border-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-300"
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>Edit SOP</span>
          </button>
        ) : null}

        <button
          type="button"
          onClick={onOpenNewBuilder}
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-blue-700 active:scale-95 transition-all"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Custom SOP</span>
        </button>
      </div>
    </div>
  );
}
