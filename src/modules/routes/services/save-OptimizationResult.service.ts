import { Solution } from "@/domain/types/Solution";
import {
  createSolution,
  deletePreviousSolutions,
} from "@/modules/optimization/repositories/optimization-repository";

export async function saveOptimizationResultService(
  routeId: string,
  solution: Solution,
) {
  await deletePreviousSolutions(routeId);

  return createSolution({
    routeId,
    totalCost: solution.totalCost,
    feasible: solution.feasible,
  });
}
