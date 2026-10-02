import { Solution } from "@/domain/types/Solution";
import { Constraints } from "@/domain/types/Constraints";
import { sumRouteDistance } from "./sumRouteDistance";

export function sumSolutionDistance(
  solution: Solution,
  distanceMatrix: number[][],
  depotIndex: number,
  constraints: Constraints,
): number {
  let totalMeters = 0;

  for (const route of solution.routes) {
    totalMeters += sumRouteDistance(
      route,
      distanceMatrix,
      depotIndex,
      constraints.returnToDepot ?? false,
    );
  }

  return totalMeters;
}
