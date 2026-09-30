"use client";

import { DocumentAnalysis } from "@/types/document";
import { formatDateForDisplay } from "@/lib/date/date-extractor";
import { CheckCircle2, AlertTriangle, XCircle, Eye, Calendar, Hash, FileText } from "lucide-react";

interface AnalysisTableProps {
  documents: DocumentAnalysis[];
  onPreview: (doc: DocumentAnalysis) => void;
}

export function AnalysisTable({ documents, onPreview }: AnalysisTableProps) {
  if (documents.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
          Document Classification & Metadata Extraction
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Deterministic extraction results with confidence ratings and detected legal dates.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:bg-slate-800/60 dark:border-slate-800 dark:text-slate-400">
            <tr>
              <th className="py-3 px-4 w-12 text-center">#</th>
              <th className="py-3 px-4">Document</th>
              <th className="py-3 px-4">Identified Type</th>
              <th className="py-3 px-4">Detected Date</th>
              <th className="py-3 px-4">SOP Position</th>
              <th className="py-3 px-4">Confidence</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {documents.map((doc, idx) => {
              const isCorrect = doc.status === "identified" && !doc.hasDateConflict;
              const isUncertain = doc.status === "uncertain" || doc.hasDateConflict;

              return (
                <tr
                  key={doc.id}
                  className="hover:bg-slate-50/80 transition-colors dark:hover:bg-slate-800/40"
                >
                  {/* Sequence # */}
                  <td className="py-3 px-4 text-center font-mono text-slate-500 font-medium">
                    {String(idx + 1).padStart(2, "0")}
                  </td>

                  {/* Document Name */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 max-w-xs">
                      <FileText className="h-4 w-4 text-blue-600 shrink-0 dark:text-blue-400" />
                      <div className="truncate">
                        <span className="font-medium text-slate-900 truncate block dark:text-white">
                          {doc.fileName}
                        </span>
                        {doc.referenceNumber && (
                          <span className="text-[10px] text-slate-400 font-mono flex items-center gap-0.5">
                            <Hash className="h-2.5 w-2.5" /> {doc.referenceNumber}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Document Type */}
                  <td className="py-3 px-4">
                    {doc.documentTypeName ? (
                      <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                        {doc.documentTypeName}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Unclassified</span>
                    )}
                  </td>

                  {/* Date */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3 w-3 text-slate-400 shrink-0" />
                      <div>
                        <span className="font-medium text-slate-700 dark:text-slate-200">
                          {doc.date ? formatDateForDisplay(doc.date) : "No date"}
                        </span>
                        {doc.hasDateConflict && (
                          <span className="text-[10px] text-amber-600 block dark:text-amber-400">
                            Multiple dates
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* SOP Position */}
                  <td className="py-3 px-4">
                    {doc.sopStepOrder && doc.sopStepOrder < 9999 ? (
                      <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 font-semibold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                        Step {doc.sopStepOrder}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">No Step Match</span>
                    )}
                  </td>

                  {/* Confidence */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            doc.confidence >= 70
                              ? "bg-emerald-500"
                              : doc.confidence >= 40
                              ? "bg-amber-500"
                              : "bg-red-400"
                          }`}
                          style={{ width: `${doc.confidence}%` }}
                        />
                      </div>
                      <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
                        {doc.confidence}%
                      </span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4">
                    {isCorrect ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                        <CheckCircle2 className="h-3 w-3" /> Correct
                      </span>
                    ) : isUncertain ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 font-semibold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                        <AlertTriangle className="h-3 w-3" /> Needs review
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 font-semibold text-red-700 dark:bg-red-950/60 dark:text-red-300">
                        <XCircle className="h-3 w-3" /> Error
                      </span>
                    )}
                  </td>

                  {/* Action */}
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => onPreview(doc)}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50 transition-colors dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                    >
                      <Eye className="h-3 w-3" />
                      <span>Preview</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
