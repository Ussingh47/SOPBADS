export type DocumentStatus = "identified" | "uncertain" | "error";

export interface CandidateDate {
  raw: string;
  normalized: string; // YYYY-MM-DD
  confidence: "high" | "medium" | "low";
  context?: string;
}

export interface DocumentAnalysis {
  id: string;
  fileName: string;
  fileSize: number;
  documentType: string | null;
  documentTypeName?: string;
  confidence: number;
  date: string | null; // ISO YYYY-MM-DD
  dateConfidence?: "high" | "medium" | "low";
  candidateDates?: CandidateDate[];
  hasDateConflict?: boolean;
  referenceNumber: string | null;
  extractedText: string;
  pageCount: number;
  status: DocumentStatus;
  statusMessage?: string;
  sopStepId?: string | null;
  sopStepOrder?: number | null;
  isManuallyOverridden?: boolean;
  file?: File;
  previewUrl?: string;
  rawArrayBuffer?: ArrayBuffer;
}

export interface UploadedFileItem {
  id: string;
  file: File;
  fileName: string;
  fileSize: number;
  pageCount?: number;
  uploadStatus: "ready" | "processing" | "analyzed" | "error";
  errorMessage?: string;
}
