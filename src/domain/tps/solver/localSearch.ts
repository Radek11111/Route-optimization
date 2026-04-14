import { Constraints } from "@/domain/types/Constraints";
import { Point } from "@/domain/types/Point";
import { Solution } from "@/domain/types/Solution";
import { twoOpt } from "../heuristics/twoOpt";
import { relocateOperator } from "../heuristics/relocateOperator";
import { solutionCostEvaluator } from "../evaluators/solutionCostEvatuator";

type Input = {
  matrix: number[][];
  points: Point[];
  constraints: Constraints;
  depotIndex: number;
  maxIterations: number;
};

export function localSearch(initialSolution: Solution, input: Input) {
  let currentSolution = structuredClone(initialSolution);

  let iteration = 0;
  const maxIterations = input.maxIterations ?? 50;

  while (iteration < maxIterations) {
    let improved = false;

    const newRoutes = currentSolution.routes.map((route) => {
      const result = twoOpt(route, input);
      if (result.improved) improved = true;
      return result.route;
    });
    currentSolution.routes = newRoutes;

    const relocateResult = relocateOperator(currentSolution, input);

    if (relocateResult.improved) {
      currentSolution = relocateResult.solution;
      improved = true;
    }
    if (!improved) break;
    iteration++;
  }

  const finalCost = solutionCostEvaluator(
    currentSolution.routes,
    input.matrix,
    input.points,
    input.constraints,
    input.depotIndex,
  );

  return {
    solution: {
      ...currentSolution,
      totalCost: finalCost.totalCost,
      feasible: finalCost.feasible,
    },
    iterations: iteration,
  };
}
