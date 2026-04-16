import { Constraints } from "@/domain/types/Constraints";
import { Point } from "@/domain/types/Point";
import { Solution } from "@/domain/types/Solution";
import { solutionCostEvaluator } from "../evaluators/solutionCostEvatuator";

type Input = {
  matrix: number[][];
  points: Point[];
  constraints: Constraints;
  depotIndex: number;
};

export function swapOperator(solution: Solution, input: Input) {
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

    outer: for (let r1 = 0; r1 < bestSolution.routes.length; r1++) {
      for (let r2 = r1; r2 < bestSolution.routes.length; r2++) {
        const route1 = bestSolution.routes[r1];
        const route2 = bestSolution.routes[r2];

        for (let i = 0; i < route1.length; i++) {
          for (let j = 0; j < route2.length; j++) {
            const pointA = route1[i];
            const pointB = route2[j];

            route1[i] = pointB;
            route2[j] = pointA;

            const newCost = solutionCostEvaluator(
              bestSolution.routes,
              input.matrix,
              input.points,
              input.constraints,
              input.depotIndex,
            ).totalCost;

            if (newCost < bestCost) {
              bestCost = newCost;
              improved = true;
              globalImproved = true;
              break outer;
            }
            route1[i] = pointA;
            route2[j] = pointB;
          }
        }
      }
    }
  } while (improved);

  return {
    solution: structuredClone(bestSolution),
    improved: globalImproved,
  };
}
