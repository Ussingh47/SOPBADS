import { describe, it, expect } from "vitest";
import { computeRecommendedOrder, runOrderingAnalysis } from "../src/lib/ordering/ordering-engine";
import { detectConflicts } from "../src/lib/ordering/conflict-detector";
import { extractDatesFromText } from "../src/lib/date/date-extractor";
import { classifyDocument } from "../src/lib/classification/classifier";
import employeeOnboardingRaw from "../src/data/sops/employee-onboarding.json";
import { DocumentAnalysis } from "../src/types/document";
import { SOPDefinition } from "../src/types/sop";

const employeeOnboarding = employeeOnboardingRaw as SOPDefinition;

function createDoc(overrides: Partial<DocumentAnalysis>): DocumentAnalysis {
  return {
    id: overrides.id || `doc-${Math.random()}`,
    fileName: overrides.fileName || "test.pdf",
    fileSize: 1024,
    documentType: overrides.documentType || null,
    documentTypeName: overrides.documentTypeName || "Test Doc",
    confidence: overrides.confidence ?? 95,
    date: overrides.date ?? "2026-01-10",
    referenceNumber: overrides.referenceNumber ?? "REF-1234",
    extractedText: overrides.extractedText || "Sample text content",
    pageCount: overrides.pageCount ?? 1,
    status: overrides.status || "identified",
    ...overrides,
  };
}

describe("Document Order Assistant - Core Engine Tests", () => {
  // Case 1: Correctly ordered documents -> Expected: No changes
  it("Case 1: Correctly ordered documents should produce no changes", () => {
    const docs: DocumentAnalysis[] = [
      createDoc({ id: "1", fileName: "01_Application.pdf", documentType: "application", date: "2026-01-05" }),
      createDoc({ id: "2", fileName: "02_Passport.pdf", documentType: "identity-proof", date: "2026-01-06" }),
      createDoc({ id: "3", fileName: "03_BackgroundCheck.pdf", documentType: "verification", date: "2026-01-12" }),
      createDoc({ id: "4", fileName: "04_OfferLetter.pdf", documentType: "approval", date: "2026-01-15" }),
      createDoc({ id: "5", fileName: "05_Contract.pdf", documentType: "final-decision", date: "2026-01-20" }),
    ];

    const result = runOrderingAnalysis(docs, employeeOnboarding);
    expect(result.movedCount).toBe(0);
    expect(result.recommendedOrder.map((d) => d.id)).toEqual(["1", "2", "3", "4", "5"]);
  });

  // Case 2: Completely random order -> Expected: Correct SOP sequence
  it("Case 2: Completely scrambled order should be restored to correct SOP sequence", () => {
    const docs: DocumentAnalysis[] = [
      createDoc({ id: "5", fileName: "Contract.pdf", documentType: "final-decision" }),
      createDoc({ id: "3", fileName: "BackgroundCheck.pdf", documentType: "verification" }),
      createDoc({ id: "1", fileName: "Application.pdf", documentType: "application" }),
      createDoc({ id: "4", fileName: "OfferLetter.pdf", documentType: "approval" }),
      createDoc({ id: "2", fileName: "Passport.pdf", documentType: "identity-proof" }),
    ];

    const recommended = computeRecommendedOrder(docs, employeeOnboarding);
    expect(recommended.map((d) => d.id)).toEqual(["1", "2", "3", "4", "5"]);
  });

  // Case 3: Dates contradict SOP order -> Expected: SOP takes precedence
  it("Case 3: SOP order takes precedence when dates contradict sequential steps", () => {
    // Application: Jan 15, Verification: Jan 05, Approval: Jan 20
    // Chronologically, Verification would come first, BUT SOP dictates Application -> Verification -> Approval
    const docs: DocumentAnalysis[] = [
      createDoc({ id: "app", fileName: "Application.pdf", documentType: "application", date: "2026-01-15" }),
      createDoc({ id: "ver", fileName: "Verification.pdf", documentType: "verification", date: "2026-01-05" }),
      createDoc({ id: "appr", fileName: "Approval.pdf", documentType: "approval", date: "2026-01-20" }),
    ];

    const recommended = computeRecommendedOrder(docs, employeeOnboarding);
    expect(recommended.map((d) => d.id)).toEqual(["app", "ver", "appr"]);

    // Conflict detector should also flag a temporal inconsistency warning
    const conflicts = detectConflicts(recommended, employeeOnboarding);
    const dateContradiction = conflicts.find((c) => c.type === "date_sequence_contradiction");
    expect(dateContradiction).toBeDefined();
    expect(dateContradiction?.severity).toBe("warning");
  });

  // Case 4: Missing document -> Expected: Warning / conflict
  it("Case 4: Detects missing mandatory document", () => {
    // Missing Verification Report and Final Decision
    const docs: DocumentAnalysis[] = [
      createDoc({ id: "1", fileName: "Application.pdf", documentType: "application" }),
      createDoc({ id: "2", fileName: "Passport.pdf", documentType: "identity-proof" }),
      createDoc({ id: "3", fileName: "Approval.pdf", documentType: "approval" }),
    ];

    const result = runOrderingAnalysis(docs, employeeOnboarding);
    const missingVerification = result.conflicts.find(
      (c) => c.type === "missing_required_document" && c.stepId === "verification"
    );
    expect(missingVerification).toBeDefined();
    expect(missingVerification?.severity).toBe("critical");
  });

  // Case 5: Duplicate document -> Expected: Warning
  it("Case 5: Detects duplicate document for single-step requirement", () => {
    const docs: DocumentAnalysis[] = [
      createDoc({ id: "app1", fileName: "Application_v1.pdf", documentType: "application" }),
      createDoc({ id: "app2", fileName: "Application_v2.pdf", documentType: "application" }),
      createDoc({ id: "id1", fileName: "Passport.pdf", documentType: "identity-proof" }),
    ];

    const result = runOrderingAnalysis(docs, employeeOnboarding);
    const duplicateApp = result.conflicts.find(
      (c) => c.type === "duplicate_document" && c.stepId === "application"
    );
    expect(duplicateApp).toBeDefined();
    expect(duplicateApp?.severity).toBe("warning");
  });

  // Case 6: Unknown document -> Expected: Manual review
  it("Case 6: Unclassified document triggers uncertainty conflict and is moved to the end", () => {
    const docs: DocumentAnalysis[] = [
      createDoc({ id: "1", fileName: "RandomNotes.pdf", documentType: null, status: "uncertain", confidence: 15 }),
      createDoc({ id: "2", fileName: "Application.pdf", documentType: "application", confidence: 95 }),
    ];

    const result = runOrderingAnalysis(docs, employeeOnboarding);
    expect(result.recommendedOrder[0].id).toBe("2");
    expect(result.recommendedOrder[1].id).toBe("1");

    const uncertaintyConflict = result.conflicts.find((c) => c.type === "classification_uncertainty");
    expect(uncertaintyConflict).toBeDefined();
  });

  // Case 7: Multiple dates -> Expected: Ambiguity warning
  it("Case 7: Multiple dates in a single document trigger conflict warning", () => {
    const sampleText = `
      Application filed on 12 Jan 2026.
      Previous contract expired on 15 Feb 2025.
      Emergency contact updated on 30 Nov 2024.
    `;
    const dateResult = extractDatesFromText(sampleText, "application");
    expect(dateResult.hasConflict).toBe(true);
    expect(dateResult.candidates.length).toBeGreaterThan(1);

    const doc = createDoc({
      id: "doc-multi",
      fileName: "MultiDateApp.pdf",
      documentType: "application",
      date: dateResult.primaryDate,
      hasDateConflict: dateResult.hasConflict,
      candidateDates: dateResult.candidates,
    });

    const conflicts = detectConflicts([doc], employeeOnboarding);
    const multiDateConflict = conflicts.find((c) => c.type === "multiple_dates_detected");
    expect(multiDateConflict).toBeDefined();
  });

  // Case 8: Manual override -> Expected: Final order respects user override
  it("Case 8: Final order respects user manual override without being clobbered", () => {
    const docs: DocumentAnalysis[] = [
      createDoc({ id: "1", fileName: "Application.pdf", documentType: "application" }),
      createDoc({ id: "2", fileName: "Passport.pdf", documentType: "identity-proof" }),
      createDoc({ id: "3", fileName: "Verification.pdf", documentType: "verification" }),
    ];

    // User explicitly dragged Verification to first place
    const userCustomOrder: DocumentAnalysis[] = [
      { ...docs[2], isManuallyOverridden: true },
      docs[0],
      docs[1],
    ];

    const result = runOrderingAnalysis(docs, employeeOnboarding, userCustomOrder);
    expect(result.finalOrder.map((d) => d.id)).toEqual(["3", "1", "2"]);
    expect(result.hasManualOverrides).toBe(true);
  });

  // Classification unit test
  it("Classification service correctly identifies document by text & keywords", () => {
    const applicationText = "Candidate Employment Application Form for Software Engineer. Position applied for.";
    const result = classifyDocument("candidate_submission.pdf", applicationText);
    expect(result.documentType).toBe("application");
    expect(result.confidence).toBeGreaterThanOrEqual(60);
    expect(result.status).toBe("identified");
  });
});
