import { SOPDefinition } from "@/types/sop";
import employeeOnboarding from "./employee-onboarding.json";
import loanApplication from "./loan-application.json";
import procurementPackage from "./procurement-package.json";

export const BUILTIN_SOPS: SOPDefinition[] = [
  employeeOnboarding as SOPDefinition,
  loanApplication as SOPDefinition,
  procurementPackage as SOPDefinition,
];

export function getSOPById(id: string): SOPDefinition | undefined {
  return BUILTIN_SOPS.find((sop) => sop.id === id);
}

export function getDefaultSOP(): SOPDefinition {
  return BUILTIN_SOPS[0];
}
