import { Constraints } from "@/domain/types/Constraints";
import { Point } from "@/domain/types/Point";
import { routeCostEvaluator } from "./routeCostEvaluator";

export function solutionCostEvaluator(
  routes: number[][],
  matrix: number[][],
  points: Point[],
  constraints: Constraints,
  depotIndex: number = 0,
) {
  let totalCost = 0;
  let feasible = true;

  for (const route of routes) {
    const result = routeCostEvaluator(
      route,
      matrix,
      points,
      constraints,
      depotIndex,
    );
    totalCost += result.totalCost;
    if (!result.feasible) {
      feasible = false;
    }
  }

  return { totalCost, feasible };
}
