import { CLASSIFICATION_DICTIONARY, TypeRule } from "./dictionary";

export interface ClassificationResult {
  documentType: string | null;
  documentTypeName: string;
  confidence: number; // 0 to 100
  status: "identified" | "uncertain" | "error";
  statusMessage?: string;
  matchedRule?: TypeRule;
  referenceNumber: string | null;
}

export function classifyDocument(
  fileName: string,
  text: string,
  targetSopAllowedTypes?: string[]
): ClassificationResult {
  const normalizedText = text.toLowerCase();
  const normalizedFileName = fileName.toLowerCase();

  const candidateScores: {
    rule: TypeRule;
    score: number;
    matchDetails: string[];
  }[] = [];

  for (const rule of CLASSIFICATION_DICTIONARY) {
    let score = 0;
    const matchDetails: string[] = [];

    // 1. Filename match
    if (rule.filenamePatterns) {
      for (const pattern of rule.filenamePatterns) {
        if (pattern.test(normalizedFileName)) {
          score += 35;
          matchDetails.push(`Filename pattern match (${pattern.source})`);
          break;
        }
      }
    }

    // 2. Primary keywords match
    let primaryCount = 0;
    for (const kw of rule.primaryKeywords) {
      if (normalizedText.includes(kw.toLowerCase())) {
        primaryCount++;
        score += 25;
        matchDetails.push(`Primary keyword "${kw}"`);
        if (primaryCount >= 2) break; // cap primary keyword bonus
      }
    }

    // 3. Secondary keywords match
    let secondaryCount = 0;
    for (const kw of rule.secondaryKeywords) {
      if (normalizedText.includes(kw.toLowerCase())) {
        secondaryCount++;
        score += 10;
        matchDetails.push(`Secondary keyword "${kw}"`);
        if (secondaryCount >= 3) break;
      }
    }

    // 4. Boost if document type is explicitly part of the currently selected SOP
    if (targetSopAllowedTypes && targetSopAllowedTypes.includes(rule.type)) {
      if (score > 15) {
        score += 10;
      }
    }

    // 5. Negative keywords penalty
    if (rule.negativeKeywords) {
      for (const neg of rule.negativeKeywords) {
        if (normalizedText.includes(neg.toLowerCase())) {
          score -= 30;
        }
      }
    }

    if (score > 0) {
      candidateScores.push({ rule, score, matchDetails });
    }
  }

  // Sort candidates by score descending
  candidateScores.sort((a, b) => b.score - a.score);

  // Reference number extraction
  let referenceNumber: string | null = null;
  const bestCandidate = candidateScores[0];

  if (bestCandidate?.rule.referenceNumberPatterns) {
    for (const refPattern of bestCandidate.rule.referenceNumberPatterns) {
      const match = text.match(refPattern);
      if (match) {
        referenceNumber = match[1] || match[0];
        break;
      }
    }
  }

  if (!referenceNumber) {
    // Generic fallback for reference numbers
    const genericRefMatch = text.match(
      /(?:Ref(?:erence)?\s*(?:No\.?|#)?|ID\s*(?:No\.?|#)?|Document\s*ID):\s*([A-Za-z0-9\-\/]{4,24})/i
    );
    if (genericRefMatch) {
      referenceNumber = genericRefMatch[1].trim();
    }
  }

  if (!bestCandidate || bestCandidate.score < 25) {
    return {
      documentType: null,
      documentTypeName: "Unclassified Document",
      confidence: bestCandidate ? Math.min(24, Math.round(bestCandidate.score)) : 0,
      status: "uncertain",
      statusMessage: "Document type could not be confidently identified.",
      referenceNumber,
    };
  }

  // Normalize confidence to 0-100% max
  const confidence = Math.min(99, Math.round(bestCandidate.score));

  if (confidence >= 60) {
    return {
      documentType: bestCandidate.rule.type,
      documentTypeName: bestCandidate.rule.label,
      confidence,
      status: "identified",
      matchedRule: bestCandidate.rule,
      referenceNumber,
    };
  } else {
    return {
      documentType: bestCandidate.rule.type,
      documentTypeName: bestCandidate.rule.label,
      confidence,
      status: "uncertain",
      statusMessage: "Low confidence classification. Manual review suggested.",
      matchedRule: bestCandidate.rule,
      referenceNumber,
    };
  }
}
