import { DocumentAnalysis } from "@/types/document";
import { SOPDefinition, SOPStep } from "@/types/sop";
import { OrderingResult } from "@/types/analysis";
import { detectConflicts } from "./conflict-detector";

export function findMatchingStep(
  docType: string | null,
  sop: SOPDefinition
): SOPStep | undefined {
  if (!docType) return undefined;
  return sop.steps.find((step) =>
    step.documentTypes.some((dt) => dt.toLowerCase() === docType.toLowerCase())
  );
}

export function enrichDocumentWithSop(
  doc: DocumentAnalysis,
  sop: SOPDefinition
): DocumentAnalysis {
  const step = findMatchingStep(doc.documentType, sop);
  return {
    ...doc,
    sopStepId: step ? step.id : null,
    sopStepOrder: step ? step.order : 9999,
  };
}

export function computeRecommendedOrder(
  documents: DocumentAnalysis[],
  sop: SOPDefinition
): DocumentAnalysis[] {
  // Enrich documents with SOP step information
  const enriched = documents.map((doc) => enrichDocumentWithSop(doc, sop));

  // Separate matched documents from unclassified/unknown
  const matchedDocs = enriched.filter((doc) => doc.sopStepId !== null && (doc.sopStepOrder ?? 9999) < 9999);
  const unmatchedDocs = enriched.filter((doc) => doc.sopStepId === null || (doc.sopStepOrder ?? 9999) >= 9999);

  // Deterministic sorting of matched documents
  matchedDocs.sort((a, b) => {
    // Priority 1: SOP Step Order
    const orderA = a.sopStepOrder ?? 9999;
    const orderB = b.sopStepOrder ?? 9999;
    if (orderA !== orderB) {
      return orderA - orderB;
    }

    // Priority 2: Chronological within the same SOP step (Priority 3 in requirement)
    if (a.date && b.date) {
      const cmp = a.date.localeCompare(b.date);
      if (cmp !== 0) return cmp;
    } else if (a.date && !b.date) {
      return -1; // dated documents first
    } else if (!a.date && b.date) {
      return 1;
    }

    // Priority 3: Alphabetical/stable tie-break
    return a.fileName.localeCompare(b.fileName);
  });

  // Apply SOP explicit before/after dependencies to ensure absolute compliance
  // (Topological adjustment if steps are partially overlapping)
  for (const rule of sop.rules) {
    if (rule.type === "before") {
      const beforeIndex = matchedDocs.findIndex(
        (d) => d.sopStepId === rule.before || d.documentType === rule.before
      );
      const afterIndex = matchedDocs.findIndex(
        (d) => d.sopStepId === rule.after || d.documentType === rule.after
      );

      if (beforeIndex !== -1 && afterIndex !== -1 && beforeIndex > afterIndex) {
        // Swap or move beforeDoc ahead of afterDoc
        const [item] = matchedDocs.splice(beforeIndex, 1);
        matchedDocs.splice(afterIndex, 0, item);
      }
    }
  }

  // Unmatched documents go to the end, ordered by name/date
  unmatchedDocs.sort((a, b) => {
    if (a.date && b.date) {
      return a.date.localeCompare(b.date);
    }
    return a.fileName.localeCompare(b.fileName);
  });

  return [...matchedDocs, ...unmatchedDocs];
}

export function runOrderingAnalysis(
  documents: DocumentAnalysis[],
  sop: SOPDefinition,
  customOrder?: DocumentAnalysis[]
): OrderingResult {
  const originalOrder = documents.map((doc) => enrichDocumentWithSop(doc, sop));
  const recommendedOrder = computeRecommendedOrder(documents, sop);

  // Final order defaults to customOrder if user manually adjusted, or recommendedOrder
  const finalOrder = customOrder ? customOrder : [...recommendedOrder];

  // Count how many documents moved relative to original order
  let movedCount = 0;
  originalOrder.forEach((doc, idx) => {
    const newIdx = recommendedOrder.findIndex((r) => r.id === doc.id);
    if (newIdx !== -1 && newIdx !== idx) {
      movedCount++;
    }
  });

  const uncertainCount = documents.filter(
    (d) => d.status === "uncertain" || !d.documentType
  ).length;

  const hasManualOverrides = finalOrder.some((d) => d.isManuallyOverridden);

  // Run conflict detection on the current final sequence and against SOP requirements
  const conflicts = detectConflicts(finalOrder, sop);

  return {
    originalOrder,
    recommendedOrder,
    finalOrder,
    conflicts,
    movedCount,
    uncertainCount,
    hasManualOverrides,
    sop,
  };
}
