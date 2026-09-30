"use client";

import { UploadedFileItem } from "@/types/document";
import { formatFileSize } from "@/lib/utils";
import { FileText, Trash2, ArrowUp, ArrowDown, Play, Loader2 } from "lucide-react";

interface UploadQueueProps {
  files: UploadedFileItem[];
  onRemove: (id: string) => void;
  onReorder: (newOrder: UploadedFileItem[]) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  progress: number;
  statusText: string;
}

export function UploadQueue({
  files,
  onRemove,
  onReorder,
  onAnalyze,
  isAnalyzing,
  progress,
  statusText,
}: UploadQueueProps) {
  if (files.length === 0) return null;

  const moveItem = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= files.length) return;

    const copy = [...files];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIndex, 0, moved);
    onReorder(copy);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
            Uploaded Document Queue ({files.length} {files.length === 1 ? "file" : "files"})
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Initial input order. Use arrows to adjust initial sequence or click Analyze below.
          </p>
        </div>

        <button
          type="button"
          onClick={onAnalyze}
          disabled={isAnalyzing}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs sm:text-sm font-medium text-white shadow-sm hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Analyzing Documents ({progress}%)...</span>
            </>
          ) : (
            <>
              <Play className="h-4 w-4 fill-white" />
              <span>Analyze & Order {files.length} Documents</span>
            </>
          )}
        </button>
      </div>

      {isAnalyzing && (
        <div className="space-y-1.5 bg-blue-50/70 p-3.5 rounded-xl border border-blue-100 dark:bg-blue-950/40 dark:border-blue-900">
          <div className="flex justify-between text-xs font-medium text-blue-900 dark:text-blue-200">
            <span>{statusText || "Extracting text and dates..."}</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-blue-200 dark:bg-blue-900 overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* File List */}
      <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden dark:divide-slate-800 dark:border-slate-800">
        {files.map((item, index) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-3 bg-white hover:bg-slate-50 transition-colors dark:bg-slate-900 dark:hover:bg-slate-800/60"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-100 text-[11px] font-mono text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                {String(index + 1).padStart(2, "0")}
              </span>
              <FileText className="h-4 w-4 text-blue-600 shrink-0 dark:text-blue-400" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-slate-900 truncate dark:text-white">
                  {item.fileName}
                </p>
                <p className="text-[11px] text-slate-400">
                  {formatFileSize(item.fileSize)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0 ml-3">
              <button
                type="button"
                onClick={() => moveItem(index, "up")}
                disabled={index === 0 || isAnalyzing}
                title="Move up"
                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors disabled:opacity-30 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => moveItem(index, "down")}
                disabled={index === files.length - 1 || isAnalyzing}
                title="Move down"
                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors disabled:opacity-30 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <ArrowDown className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onRemove(item.id)}
                disabled={isAnalyzing}
                title="Remove file"
                className="p-1 text-red-400 hover:text-red-700 hover:bg-red-50 rounded transition-colors disabled:opacity-30 ml-1 dark:hover:bg-red-950/40"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
