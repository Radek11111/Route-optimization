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

export function relocateRoute(solution: Solution, input: Input) {
  let bestSolution = structuredClone(solution);

  let bestCost = solutionCostEvaluator(
    bestSolution.routes,
    input.matrix,
    input.points,
    input.constraints,
    input.depotIndex,
  ).totalCost;

  let improved = false;

  const routes = bestSolution.routes;

  for (
    let fromRouteIndex = 0;
    fromRouteIndex < routes.length;
    fromRouteIndex++
  ) {
    for (let toRouteIndex = 0; toRouteIndex < routes.length; toRouteIndex++) {
      const fromRoute = routes[fromRouteIndex];
      const toRoute = routes[toRouteIndex];

      for (let i = 0; i < fromRoute.length; i++) {
        const pointToMove = fromRoute[i];

        for (let j = 0; j <= toRoute.length; j++) {
          if (fromRouteIndex === toRouteIndex && (j === i || j === i + 1)) {
            continue;
          }
          const newSolution = structuredClone(bestSolution);

          newSolution.routes[fromRouteIndex].splice(i, 1);

          newSolution.routes[toRouteIndex].splice(j, 0, pointToMove);

          const newCost = solutionCostEvaluator(
            newSolution.routes,
            input.matrix,
            input.points,
            input.constraints,
            input.depotIndex,
          ).totalCost;

          if (newCost < bestCost) {
            bestSolution = newSolution;
            bestCost = newCost;
            improved = true;
          }
        }
      }
    }
  }
  return {
    solution: bestSolution,
    improved,
  };
}
