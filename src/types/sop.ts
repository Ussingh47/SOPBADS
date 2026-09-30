export interface SOPStep {
  id: string;
  name: string;
  order: number;
  documentTypes: string[];
  required?: boolean;
  description?: string;
  maxAllowed?: number; // e.g., 1 for single occurrence
}

export type SOPRuleType = "before" | "after" | "same-stage";

export interface SOPRule {
  type: SOPRuleType;
  before: string; // step id or doc type
  after: string;  // step id or doc type
  description?: string;
}

export interface SOPDefinition {
  id: string;
  name: string;
  description: string;
  category?: string;
  isCustom?: boolean;
  steps: SOPStep[];
  rules: SOPRule[];
  allowedTypes?: string[];
}
