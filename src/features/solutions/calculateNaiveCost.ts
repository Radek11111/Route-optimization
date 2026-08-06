import { naiveSolution } from "@/domain/tps/solver/naiveSolution";
import { Constraints } from "@/domain/types/Constraints";
import { sumSolutionDistance } from "./sumSolutionDistance";

export function calculateNaiveCost(
  pointCount: number,
  depotIndex: number,
  distanceMatrix: number[][],
  constraints: Constraints,
): number {
  const naive = naiveSolution(pointCount, depotIndex);
  return sumSolutionDistance(naive, distanceMatrix, depotIndex, constraints);
}
