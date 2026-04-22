import { Constraints } from "@/domain/types/Constraints";
import { Point } from "@/domain/types/Point";
import { Solution } from "@/domain/types/Solution";
import { relocateOperator } from "../heuristics/relocateOperator";
import { solutionCostEvaluator } from "../evaluators/solutionCostEvaluator";
import { swapOperator } from "../heuristics/swapOperator";
import { twoOpt } from "../heuristics/twoOpt";

type Input = {
  matrix: number[][];
  points: Point[];
  constraints: Constraints;
  depotIndex: number;
  maxIterations: number;
};

export function localSearch(initialSolution: Solution, input: Input) {
  let currentSolution = structuredClone(initialSolution);

  const maxIterations = input.maxIterations ?? 50;

  let improved = true;
  let iteration = 0;

  while (improved && iteration < maxIterations) {
    improved = false;
    iteration++;

    const relocateResult = relocateOperator(currentSolution, input);

    if (relocateResult.improved) {
      currentSolution = relocateResult.solution;
      improved = true;
      continue;
    }

    const swapResult = swapOperator(currentSolution, input);

    if (swapResult.improved) {
      currentSolution = swapResult.solution;
      improved = true;
      continue;
    }

    for (let r = 0; r < currentSolution.routes.length; r++) {
      const result = twoOpt(currentSolution.routes[r], input);
      if (result.improved) {
        currentSolution.routes[r] = result.route;
        improved = true;
      }
    }
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
