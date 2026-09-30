import { CandidateDate } from "@/types/document";

const MONTH_NAMES: Record<string, string> = {
  jan: "01", january: "01",
  feb: "02", february: "02",
  mar: "03", march: "03",
  apr: "04", april: "04",
  may: "05",
  jun: "06", june: "06",
  jul: "07", july: "07",
  aug: "08", august: "08",
  sep: "09", sept: "09", september: "09",
  oct: "10", october: "10",
  nov: "11", november: "11",
  dec: "12", december: "12",
};

export interface DateExtractionResult {
  primaryDate: string | null; // ISO YYYY-MM-DD
  confidence: "high" | "medium" | "low";
  candidates: CandidateDate[];
  hasConflict: boolean;
  message?: string;
}

function pad2(n: number | string): string {
  return String(n).padStart(2, "0");
}

function isValidDate(year: number, month: number, day: number): boolean {
  if (year < 1970 || year > 2099) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  // Day check by month
  const d = new Date(year, month - 1, day);
  return d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day;
}

export function extractDatesFromText(text: string, documentType?: string | null): DateExtractionResult {
  const candidates: CandidateDate[] = [];
  const seenNormalized = new Set<string>();

  // 1. ISO format: YYYY-MM-DD or YYYY/MM/DD
  const isoRegex = /\b(20\d\d|19\d\d)[-/](0[1-9]|1[0-2])[-/](0[1-9]|[12]\d|3[01])\b/g;
  let match: RegExpExecArray | null;
  while ((match = isoRegex.exec(text)) !== null) {
    const [raw, yStr, mStr, dStr] = match;
    const y = parseInt(yStr, 10);
    const m = parseInt(mStr, 10);
    const d = parseInt(dStr, 10);
    if (isValidDate(y, m, d)) {
      const normalized = `${y}-${pad2(m)}-${pad2(d)}`;
      const context = extractSurroundingContext(text, match.index, raw.length);
      const isPriority = isPriorityContext(context, documentType);
      candidates.push({
        raw,
        normalized,
        confidence: isPriority ? "high" : "medium",
        context,
      });
      seenNormalized.add(normalized);
    }
  }

  // 2. Day Month Year: e.g. 15 Jan 2026, 15 January 2026, 1st Jan 2026
  const dmyTextRegex =
    /\b([0-2]?\d|3[01])(?:st|nd|rd|th)?[\s,-]+(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)[\s,-]+(20\d\d|19\d\d)\b/gi;
  while ((match = dmyTextRegex.exec(text)) !== null) {
    const [raw, dayStr, monthName, yearStr] = match;
    const y = parseInt(yearStr, 10);
    const m = parseInt(MONTH_NAMES[monthName.toLowerCase()] || "0", 10);
    const d = parseInt(dayStr, 10);
    if (isValidDate(y, m, d)) {
      const normalized = `${y}-${pad2(m)}-${pad2(d)}`;
      const context = extractSurroundingContext(text, match.index, raw.length);
      const isPriority = isPriorityContext(context, documentType);
      candidates.push({
        raw,
        normalized,
        confidence: isPriority ? "high" : "medium",
        context,
      });
      seenNormalized.add(normalized);
    }
  }

  // 3. Month Day, Year: e.g. January 15, 2026 or Jan 15 2026
  const mdyTextRegex =
    /\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)[\s,-]+([0-2]?\d|3[01])(?:st|nd|rd|th)?[\s,-]+(20\d\d|19\d\d)\b/gi;
  while ((match = mdyTextRegex.exec(text)) !== null) {
    const [raw, monthName, dayStr, yearStr] = match;
    const y = parseInt(yearStr, 10);
    const m = parseInt(MONTH_NAMES[monthName.toLowerCase()] || "0", 10);
    const d = parseInt(dayStr, 10);
    if (isValidDate(y, m, d)) {
      const normalized = `${y}-${pad2(m)}-${pad2(d)}`;
      const context = extractSurroundingContext(text, match.index, raw.length);
      const isPriority = isPriorityContext(context, documentType);
      candidates.push({
        raw,
        normalized,
        confidence: isPriority ? "high" : "medium",
        context,
      });
      seenNormalized.add(normalized);
    }
  }

  // 4. DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY
  const dmyNumericRegex = /\b([0-2]?\d|3[01])[-/.](0[1-9]|1[0-2])[-/.](20\d\d|19\d\d)\b/g;
  while ((match = dmyNumericRegex.exec(text)) !== null) {
    const [raw, dStr, mStr, yStr] = match;
    const y = parseInt(yStr, 10);
    const m = parseInt(mStr, 10);
    const d = parseInt(dStr, 10);
    if (isValidDate(y, m, d)) {
      const normalized = `${y}-${pad2(m)}-${pad2(d)}`;
      const context = extractSurroundingContext(text, match.index, raw.length);
      const isPriority = isPriorityContext(context, documentType);
      candidates.push({
        raw,
        normalized,
        confidence: isPriority ? "high" : "medium",
        context,
      });
      seenNormalized.add(normalized);
    }
  }

  if (candidates.length === 0) {
    return {
      primaryDate: null,
      confidence: "low",
      candidates: [],
      hasConflict: false,
      message: "No date found in document text.",
    };
  }

  // Score candidates based on priority context and position
  candidates.sort((a, b) => {
    const scoreA = (a.confidence === "high" ? 20 : 0) + (isHighPriorityKeyword(a.context || "") ? 15 : 0);
    const scoreB = (b.confidence === "high" ? 20 : 0) + (isHighPriorityKeyword(b.context || "") ? 15 : 0);
    return scoreB - scoreA;
  });

  const uniqueNormalized = Array.from(new Set(candidates.map((c) => c.normalized)));

  // If there are multiple DISTINCT normalized dates
  const hasConflict = uniqueNormalized.length > 1;

  const topCandidate = candidates[0];

  return {
    primaryDate: topCandidate.normalized,
    confidence: hasConflict ? "medium" : topCandidate.confidence,
    candidates,
    hasConflict,
    message: hasConflict
      ? `Multiple candidate dates detected (${uniqueNormalized.slice(0, 3).join(", ")}). Please review.`
      : undefined,
  };
}

function extractSurroundingContext(text: string, index: number, length: number): string {
  const start = Math.max(0, index - 40);
  const end = Math.min(text.length, index + length + 40);
  return text.substring(start, end).replace(/\s+/g, " ").trim();
}

function isHighPriorityKeyword(context: string): boolean {
  const lower = context.toLowerCase();
  const priorityTerms = [
    "date of issue",
    "issued date",
    "signed date",
    "dated",
    "date:",
    "execution date",
    "report date",
    "effective date",
    "order date",
    "invoice date",
    "application date",
  ];
  return priorityTerms.some((term) => lower.includes(term));
}

function isPriorityContext(context: string, docType?: string | null): boolean {
  const lower = context.toLowerCase();
  // Filter out irrelevant dates like date of birth or expiry unless expected
  if (lower.includes("dob") || lower.includes("birth") || lower.includes("expiry")) {
    return false;
  }
  if (docType && lower.includes(docType.toLowerCase())) {
    return true;
  }
  return isHighPriorityKeyword(context);
}

export function formatDateForDisplay(isoDate: string | null | undefined): string {
  if (!isoDate) return "No date detected";
  try {
    const [y, m, d] = isoDate.split("-").map(Number);
    if (!y || !m || !d) return isoDate;
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return isoDate;
  }
}
