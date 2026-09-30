import { ConflictItem } from "@/types/analysis";
import { DocumentAnalysis } from "@/types/document";
import { SOPDefinition } from "@/types/sop";

export function detectConflicts(
  documents: DocumentAnalysis[],
  sop: SOPDefinition
): ConflictItem[] {
  const conflicts: ConflictItem[] = [];

  // Map documents by stepId and by documentType
  const docsByStepId: Record<string, DocumentAnalysis[]> = {};
  const docsByDocType: Record<string, DocumentAnalysis[]> = {};

  for (const doc of documents) {
    if (doc.sopStepId) {
      if (!docsByStepId[doc.sopStepId]) docsByStepId[doc.sopStepId] = [];
      docsByStepId[doc.sopStepId].push(doc);
    }
    if (doc.documentType) {
      if (!docsByDocType[doc.documentType]) docsByDocType[doc.documentType] = [];
      docsByDocType[doc.documentType].push(doc);
    }
  }

  // 1. Missing Required Documents
  for (const step of sop.steps) {
    if (step.required) {
      const matchingDocs = docsByStepId[step.id] || [];
      if (matchingDocs.length === 0) {
        conflicts.push({
          id: `missing-${step.id}`,
          type: "missing_required_document",
          severity: "critical",
          title: `Missing Required Document: ${step.name}`,
          description: `The SOP "${sop.name}" mandates "${step.name}" (Step ${step.order}), but no matching document was uploaded or identified.`,
          whyItMatters: "Missing mandatory compliance documents will lead to process rejection during audit or sign-off.",
          recommendedAction: `Upload the missing "${step.name}" or verify if an unclassified document corresponds to this step.`,
          stepId: step.id,
        });
      }
    }
  }

  // 2. Duplicate Documents (where maxAllowed is exceeded or unexpected)
  for (const step of sop.steps) {
    const matchingDocs = docsByStepId[step.id] || [];
    const maxAllowed = step.maxAllowed || 1;
    if (matchingDocs.length > maxAllowed) {
      conflicts.push({
        id: `duplicate-${step.id}`,
        type: "duplicate_document",
        severity: "warning",
        title: `Duplicate Document Detected for Step: ${step.name}`,
        description: `Found ${matchingDocs.length} documents classified for "${step.name}" (${matchingDocs.map((d) => d.fileName).join(", ")}), but this step typically expects ${maxAllowed}.`,
        whyItMatters: "Duplicate documents may cause confusion over which version is legally operative or supersedes the other.",
        recommendedAction: "Review the duplicates, remove the obsolete version, or reclassify if misidentified.",
        documentIds: matchingDocs.map((d) => d.id),
        stepId: step.id,
      });
    }
  }

  // 3. Classification Uncertainty
  for (const doc of documents) {
    if (doc.status === "uncertain" || !doc.documentType) {
      conflicts.push({
        id: `uncertain-${doc.id}`,
        type: "classification_uncertainty",
        severity: "warning",
        title: `Uncertain Document: ${doc.fileName}`,
        description: `Document "${doc.fileName}" has a confidence score of ${doc.confidence}%. ${doc.statusMessage || "Type could not be definitively matched."}`,
        whyItMatters: "Unclassified documents cannot be automatically positioned with certainty and default to the end of the package.",
        recommendedAction: "Click the document to preview its content and manually set the document type or position.",
        documentIds: [doc.id],
      });
    }
  }

  // 4. Multiple dates in a single document
  for (const doc of documents) {
    if (doc.hasDateConflict && doc.candidateDates && doc.candidateDates.length > 1) {
      const dateList = Array.from(new Set(doc.candidateDates.map((c) => c.normalized))).join(", ");
      conflicts.push({
        id: `multi-date-${doc.id}`,
        type: "multiple_dates_detected",
        severity: "info",
        title: `Multiple Dates in ${doc.fileName}`,
        description: `Detected candidate dates: [${dateList}]. Primary date selected: ${doc.date}.`,
        whyItMatters: "Ambiguous dates can affect chronological sub-sorting within the stage.",
        recommendedAction: "Inspect document preview to confirm the effective legal execution date.",
        documentIds: [doc.id],
      });
    }
  }

  // 5. Date Contradictions across sequential steps
  // E.g., Step B (Approval) has earlier date than Step A (Application)
  for (let i = 0; i < documents.length; i++) {
    const docA = documents[i];
    if (!docA.date || !docA.sopStepOrder) continue;

    for (let j = i + 1; j < documents.length; j++) {
      const docB = documents[j];
      if (!docB.date || !docB.sopStepOrder) continue;

      // If docA is supposed to come before docB in SOP (docA.order < docB.order)
      // but docB's date is significantly earlier than docA's date (by more than 0 days)
      if (docA.sopStepOrder < docB.sopStepOrder && docB.date < docA.date) {
        conflicts.push({
          id: `date-contradiction-${docA.id}-${docB.id}`,
          type: "date_sequence_contradiction",
          severity: "warning",
          title: `Temporal Inconsistency: ${docA.fileName} vs ${docB.fileName}`,
          description: `"${docB.fileName}" (Step ${docB.sopStepOrder}) has date ${docB.date}, which is EARLIER than preceding "${docA.fileName}" (Step ${docA.sopStepOrder}, date ${docA.date}).`,
          whyItMatters: "In business workflows, later stages (such as verification or approval) typically occur on or after intake application dates.",
          recommendedAction: "Check if one of the documents is an older revision or if the extracted date belongs to a previous reference.",
          documentIds: [docA.id, docB.id],
        });
      }
    }
  }

  // 6. Explicit Rule Violations (e.g. check current list sequence against SOP rules)
  for (const rule of sop.rules) {
    if (rule.type === "before") {
      const beforeDocs = documents.filter(
        (d) => d.sopStepId === rule.before || d.documentType === rule.before
      );
      const afterDocs = documents.filter(
        (d) => d.sopStepId === rule.after || d.documentType === rule.after
      );

      for (const bDoc of beforeDocs) {
        const bIndex = documents.findIndex((d) => d.id === bDoc.id);
        for (const aDoc of afterDocs) {
          const aIndex = documents.findIndex((d) => d.id === aDoc.id);
          if (bIndex > aIndex && aIndex !== -1 && bIndex !== -1) {
            conflicts.push({
              id: `rule-violation-${bDoc.id}-${aDoc.id}`,
              type: "sop_sequence_violation",
              severity: "critical",
              title: `SOP Sequence Violation: ${rule.before} must precede ${rule.after}`,
              description: `"${bDoc.fileName}" currently appears AFTER "${aDoc.fileName}", violating SOP rule: "${rule.description || `${rule.before} before ${rule.after}`}".`,
              whyItMatters: "Strict compliance packages require prerequisite documents to be filed ahead of dependent records.",
              recommendedAction: "Move the prerequisite document forward or accept the recommended ordering.",
              documentIds: [bDoc.id, aDoc.id],
            });
          }
        }
      }
    }
  }

  return conflicts;
}
