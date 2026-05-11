import { Constraints } from "@/domain/types/Constraints";
import { Point } from "@/domain/types/Point";
import { routeCostEvaluator } from "./routeCostEvaluator";
import { createEmptyBreakdown } from "../factories/createEmptyBreakdown";
import { CostResult } from "@/domain/types/costResult";

export function solutionCostEvaluator(
  routes: number[][],
  matrix: number[][],
  points: Point[],
  constraints: Constraints,
  depotIndex: number = 0,
): CostResult {
  let totalCost = 0;
  let feasible = true;

  const breakdown = createEmptyBreakdown();

  for (const route of routes) {
    const result = routeCostEvaluator(
      route,
      matrix,
      points,
      constraints,
      depotIndex,
    );
    totalCost += result.totalCost;

    breakdown.travelTime += result.breakdown.travelTime;
    breakdown.workTimePenalty += result.breakdown.workTimePenalty;
    breakdown.timeWindowPenalty += result.breakdown.timeWindowPenalty;
    breakdown.returnToDepotPenalty += result.breakdown.returnToDepotPenalty;
    breakdown.priorityPenalty += result.breakdown.priorityPenalty;

    if (!result.feasible) {
      feasible = false;
    }
  }

  return { totalCost, feasible, breakdown };
}
