import { DocumentAnalysis } from "./document";
import { SOPDefinition } from "./sop";

export type ConflictSeverity = "critical" | "warning" | "info";

export type ConflictType =
  | "missing_required_document"
  | "duplicate_document"
  | "date_sequence_contradiction"
  | "classification_uncertainty"
  | "sop_sequence_violation"
  | "multiple_dates_detected"
  | "unclassified_document";

export interface ConflictItem {
  id: string;
  type: ConflictType;
  severity: ConflictSeverity;
  title: string;
  description: string;
  whyItMatters: string;
  recommendedAction: string;
  documentIds?: string[];
  stepId?: string;
}

export interface OrderingResult {
  originalOrder: DocumentAnalysis[];
  recommendedOrder: DocumentAnalysis[];
  finalOrder: DocumentAnalysis[];
  conflicts: ConflictItem[];
  movedCount: number;
  uncertainCount: number;
  hasManualOverrides: boolean;
  sop: SOPDefinition;
}

export interface AuditReportData {
  generatedAt: string;
  sopName: string;
  sopId: string;
  originalSequence: { id: string; fileName: string; type: string; date: string }[];
  recommendedSequence: { id: string; fileName: string; type: string; date: string; step: string }[];
  finalSequence: { id: string; fileName: string; type: string; date: string; overridden: boolean }[];
  conflicts: ConflictItem[];
  manualOverrides: { fileName: string; originalPos: number; finalPos: number }[];
  missingDocuments: string[];
  duplicateDocuments: string[];
}
