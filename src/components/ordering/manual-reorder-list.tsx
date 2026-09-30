"use client";

import { useState } from "react";
import { DocumentAnalysis } from "@/types/document";
import { formatDateForDisplay } from "@/lib/date/date-extractor";
import {
  GripVertical,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Eye,
  Calendar,
  Tag,
} from "lucide-react";

interface ManualReorderListProps {
  documents: DocumentAnalysis[];
  onReorder: (newOrder: DocumentAnalysis[]) => void;
  onReset: () => void;
  hasManualOverrides: boolean;
  onPreview: (doc: DocumentAnalysis) => void;
}

export function ManualReorderList({
  documents,
  onReorder,
  onReset,
  hasManualOverrides,
  onPreview,
}: ManualReorderListProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const copy = [...documents];
    const [draggedItem] = copy.splice(draggedIndex, 1);
    copy.splice(index, 0, {
      ...draggedItem,
      isManuallyOverridden: true,
    });

    setDraggedIndex(null);
    setDragOverIndex(null);
    onReorder(copy);
  };

  const moveItem = (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= documents.length) return;

    const copy = [...documents];
    const [moved] = copy.splice(index, 1);
    copy.splice(target, 0, {
      ...moved,
      isManuallyOverridden: true,
    });
    onReorder(copy);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
        <div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Final Dossier Sequence</span>
            {hasManualOverrides && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                Manual Overrides Active
              </span>
            )}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Drag items using the grip handle or click arrow buttons to fine-tune the final merged sequence.
          </p>
        </div>

        {hasManualOverrides && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
            <span>Reset to SOP Recommended Order</span>
          </button>
        )}
      </div>

      {/* Interactive List */}
      <div className="space-y-2">
        {documents.map((doc, index) => {
          const isDragging = draggedIndex === index;
          const isOver = dragOverIndex === index;

          return (
            <div
              key={doc.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={() => handleDrop(index)}
              className={`flex items-center justify-between p-3.5 rounded-xl border text-xs transition-all ${
                isDragging
                  ? "opacity-40 scale-98 border-blue-400 bg-blue-50/50"
                  : isOver
                  ? "border-blue-500 bg-blue-50/30 dark:border-blue-400 dark:bg-blue-950/20"
                  : doc.isManuallyOverridden
                  ? "border-amber-300 bg-amber-50/30 dark:border-amber-800 dark:bg-amber-950/20"
                  : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {/* Drag Handle */}
                <div
                  title="Drag to reorder"
                  className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors"
                >
                  <GripVertical className="h-4 w-4" />
                </div>

                {/* Final Order Number */}
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white font-mono font-bold text-xs shadow-xs dark:bg-white dark:text-slate-900">
                  {String(index + 1).padStart(2, "0")}
                </span>

                {/* Document Information */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-900 truncate dark:text-white">
                      {doc.fileName}
                    </span>
                    {doc.isManuallyOverridden && (
                      <span className="inline-flex items-center rounded-md bg-amber-100 px-1.5 py-0.2 text-[10px] font-semibold text-amber-800 dark:bg-amber-900/60 dark:text-amber-200">
                        Manual override
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap">
                    <span className="inline-flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                      <Tag className="h-3 w-3 text-slate-400" />
                      {doc.documentTypeName || "Unclassified"}
                    </span>
                    {doc.date && (
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        {formatDateForDisplay(doc.date)}
                      </span>
                    )}
                    {doc.sopStepOrder && (
                      <span className="text-blue-600 font-medium dark:text-blue-400">
                        Stage {doc.sopStepOrder}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 shrink-0 ml-3">
                <button
                  type="button"
                  onClick={() => moveItem(index, "up")}
                  disabled={index === 0}
                  title="Move earlier in package"
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-30 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => moveItem(index, "down")}
                  disabled={index === documents.length - 1}
                  title="Move later in package"
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-30 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onPreview(doc)}
                  title="Preview PDF"
                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors ml-1 dark:text-blue-400 dark:hover:bg-blue-950/50"
                >
                  <Eye className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
