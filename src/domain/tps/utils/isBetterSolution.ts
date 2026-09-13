import { CostResult } from "@/domain/types/CostResult";

export function isBetterSolution(
  candidate: CostResult,
  currentBest: CostResult,
): boolean {
  return candidate.totalCost < currentBest.totalCost;
}
