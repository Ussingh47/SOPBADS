"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { UploadCloud, FileUp, ShieldCheck } from "lucide-react";

interface DropZoneProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
}

export function DropZone({ onFilesSelected, disabled }: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (disabled) return;
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      onFilesSelected(filesArray);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      onFilesSelected(filesArray);
      e.target.value = ""; // Reset for re-selection
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !disabled && fileInputRef.current?.click()}
      className={`group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 sm:p-10 text-center transition-all cursor-pointer ${
        isDragOver
          ? "border-blue-500 bg-blue-50/60 dark:border-blue-400 dark:bg-blue-950/20"
          : "border-slate-300 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900/30 dark:hover:border-slate-600"
      } ${disabled ? "opacity-50 pointer-events-none" : ""}`}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={handleFileInputChange}
      />

      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm border border-slate-200 group-hover:scale-105 transition-transform dark:bg-slate-800 dark:border-slate-700">
        <UploadCloud className="h-7 w-7 text-blue-600 dark:text-blue-400" />
      </div>

      <h3 className="mt-4 text-base font-semibold text-slate-900 tracking-tight dark:text-white">
        Drop your PDF documents here, or <span className="text-blue-600 dark:text-blue-400 underline underline-offset-2">browse</span>
      </h3>
      <p className="mt-1 text-xs text-slate-500 max-w-md dark:text-slate-400">
        Supports multiple PDF files. Files remain strictly inside your browser and are never uploaded to any remote cloud.
      </p>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
        <span className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-1 border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
          <FileUp className="h-3 w-3 text-slate-500" /> Multi-file Upload
        </span>
        <span className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-1 border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
          <ShieldCheck className="h-3 w-3 text-emerald-600" /> 100% Client-Side
        </span>
      </div>
    </div>
  );
}
