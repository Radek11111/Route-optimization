import { Solution } from "@/domain/types/Solution";
import { solutionCostEvaluator } from "../evaluators/solutionCostEvatuator";
import { Point } from "@/domain/types/Point";
import { Constraints } from "@/domain/types/Constraints";

type Input = {
  matrix: number[][];
  points: Point[];
  constraints: Constraints;
  depotIndex: number;
};

export function relocateOperator(solution: Solution, input: Input) {
  let bestSolution = structuredClone(solution);
  let bestCost = solutionCostEvaluator(
    bestSolution.routes,
    input.matrix,
    input.points,
    input.constraints,
    input.depotIndex,
  ).totalCost;

  let globalImproved = false;
  let improved: boolean;

  do {
    improved = false;

    outer: for (
      let fromRouteIndex = 0;
      fromRouteIndex < bestSolution.routes.length;
      fromRouteIndex++
    ) {
      for (
        let toRouteIndex = 0;
        toRouteIndex < bestSolution.routes.length;
        toRouteIndex++
      ) {
        const fromRoute = bestSolution.routes[fromRouteIndex];
        const toRoute = bestSolution.routes[toRouteIndex];

        for (let i = 0; i < fromRoute.length; i++) {
          const pointToMove = fromRoute[i];

          for (let j = 0; j <= toRoute.length; j++) {
            if (fromRouteIndex === toRouteIndex && (j === i || j === i + 1)) {
              continue;
            }

            const candidate = structuredClone(bestSolution);
            candidate.routes[fromRouteIndex].splice(i, 1);

            const insertIndex =
              fromRouteIndex === toRouteIndex && j > i ? j - 1 : j;

            candidate.routes[toRouteIndex].splice(insertIndex, 0, pointToMove);

            const newCost = solutionCostEvaluator(
              candidate.routes,
              input.matrix,
              input.points,
              input.constraints,
              input.depotIndex,
            ).totalCost;

            if (newCost < bestCost) {
              bestSolution = candidate;
              bestCost = newCost;
              improved = true;
              globalImproved = true;
              break outer;
            }
          }
        }
      }
    }
  } while (improved);

  return {
    solution: bestSolution,
    improved: globalImproved,
  };
}
