import { OrderingResult } from "@/types/analysis";
import { formatDateForDisplay } from "../date/date-extractor";

export function generateAuditReportMarkdown(result: OrderingResult): string {
  const { originalOrder, recommendedOrder, finalOrder, conflicts, movedCount, hasManualOverrides, sop } =
    result;
  const analysisDate = new Date().toISOString().replace("T", " ").substring(0, 19) + " UTC";

  const lines: string[] = [];

  lines.push("# Document Order Assistant - Compliance Audit Report");
  lines.push("");
  lines.push(`**Generated On:** ${analysisDate}`);
  lines.push(`**SOP Applied:** ${sop.name} (\`${sop.id}\`)`);
  lines.push(`**Total Documents Processed:** ${originalOrder.length}`);
  lines.push(`**Documents Re-ordered:** ${movedCount}`);
  lines.push(`**Manual Overrides Applied:** ${hasManualOverrides ? "Yes" : "None"}`);
  lines.push(`**Total Conflicts / Warnings Flagged:** ${conflicts.length}`);
  lines.push("");
  lines.push("---");
  lines.push("");

  // 1. Original vs Final Order Table
  lines.push("## 1. Sequence Audit Table");
  lines.push("");
  lines.push("| Pos | Original Upload | Recommended Order | Final Confirmed Order | Matched SOP Step | Date | Status |");
  lines.push("|:---:|:---|:---|:---|:---|:---|:---|");

  const maxLen = Math.max(originalOrder.length, finalOrder.length);
  for (let i = 0; i < maxLen; i++) {
    const orig = originalOrder[i];
    const rec = recommendedOrder[i];
    const fin = finalOrder[i];

    const origName = orig ? orig.fileName : "-";
    const recName = rec ? rec.fileName : "-";
    const finName = fin ? `${fin.fileName}${fin.isManuallyOverridden ? " (Override)" : ""}` : "-";
    const stepName = fin?.sopStepOrder ? `Step ${fin.sopStepOrder} (${fin.documentTypeName})` : "Unclassified";
    const docDate = fin?.date ? formatDateForDisplay(fin.date) : "N/A";
    const status = fin?.status === "identified" ? "Verified" : "Needs Review";

    lines.push(`| ${i + 1} | ${origName} | ${recName} | ${finName} | ${stepName} | ${docDate} | ${status} |`);
  }
  lines.push("");

  // 2. Conflict & Compliance Details
  lines.push("## 2. Detected Compliance Conflicts & Warnings");
  lines.push("");
  if (conflicts.length === 0) {
    lines.push("✓ **Zero Compliance Conflicts Detected.** All mandatory documents are accounted for and conform to sequential order.");
  } else {
    for (const c of conflicts) {
      const icon = c.severity === "critical" ? "🔴 [CRITICAL]" : c.severity === "warning" ? "🟡 [WARNING]" : "🔵 [INFO]";
      lines.push(`### ${icon} ${c.title}`);
      lines.push(`- **Type:** \`${c.type}\``);
      lines.push(`- **Detail:** ${c.description}`);
      lines.push(`- **Why it matters:** ${c.whyItMatters}`);
      lines.push(`- **Action:** ${c.recommendedAction}`);
      lines.push("");
    }
  }
  lines.push("");

  // 3. Manual Overrides Section
  lines.push("## 3. Manual Overrides Summary");
  lines.push("");
  const overridden = finalOrder.filter((d) => d.isManuallyOverridden);
  if (overridden.length === 0) {
    lines.push("No manual position overrides were made. The automated recommendation was adopted unchanged.");
  } else {
    lines.push(`The user applied manual sequence adjustments to ${overridden.length} document(s):`);
    overridden.forEach((d) => {
      const finalPos = finalOrder.findIndex((x) => x.id === d.id) + 1;
      const recPos = recommendedOrder.findIndex((x) => x.id === d.id) + 1;
      lines.push(`- **${d.fileName}**: Moved from recommended position #${recPos} to final position #${finalPos}.`);
    });
  }
  lines.push("");

  // 4. Privacy and Verification Notice
  lines.push("---");
  lines.push("### Privacy & System Verification Notice");
  lines.push("All document parsing, classification, and sequencing was executed exclusively inside the local browser sandbox. No file contents or metadata were transmitted to remote external servers or paid AI APIs.");

  return lines.join("\n");
}

export function downloadAuditReport(result: OrderingResult, format: "md" | "html" = "md"): void {
  const content = generateAuditReportMarkdown(result);
  const today = new Date().toISOString().split("T")[0];
  const filename = `audit-report-${result.sop.id}-${today}.${format}`;

  let blob: Blob;
  if (format === "html") {
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Document Order Assistant - Audit Report</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; max-width: 900px; margin: 40px auto; padding: 0 20px; color: #1e293b; background: #f8fafc; }
    .card { background: white; padding: 32px; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    h1 { color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; }
    h2 { color: #1e293b; margin-top: 24px; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; }
    h3 { margin-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px; }
    th, td { border: 1px solid #e2e8f0; padding: 10px 12px; text-align: left; }
    th { background: #f1f5f9; font-weight: 600; }
    code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 13px; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 12px; font-weight: 600; }
  </style>
</head>
<body>
  <div class="card">
    <pre style="white-space: pre-wrap; font-family: inherit;">${content.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>
  </div>
</body>
</html>`;
    blob = new Blob([htmlContent], { type: "text/html" });
  } else {
    blob = new Blob([content], { type: "text/markdown" });
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
