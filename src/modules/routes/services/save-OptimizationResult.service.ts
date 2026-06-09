import { Point } from "@/domain/types/Point";
import { Solution } from "@/domain/types/Solution";
import { saveFullSolution } from "@/modules/optimization/repositories/optimization-repository";

export async function saveOptimizationResultService(
  routeId: string,
  solution: Solution,
  points: Point[],
  depotPoint: Point,
) {
  return saveFullSolution({ routeId, solution, points, depotPoint });
}
