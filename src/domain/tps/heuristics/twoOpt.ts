import { Constraints } from "@/domain/types/Constraints";
import { Point } from "@/domain/types/Point";
import { routeCostEvaluator } from "../evaluators/routeCostEvaluator";

type Input = {
  matrix: number[][];
  points: Point[];
  contraits: Constraints;
  depotIndex: number;
};

type TwoOptResult = {
  route: number[];
  improved: boolean;
};

export function twoOpt(route: number[], input: Input): TwoOptResult {
  let bestRoute = [...route];
  let bestCost = routeCostEvaluator(
    bestRoute,
    input.matrix,
    input.points,
    input.contraits,
    input.depotIndex,
  ).totalCost;

  let improved = false;

  const n = route.length;

  for (let i = 0; i < n - 1; i++) {
    for (let k = i + 1; k < n; k++) {
      const newRoute = twoOptSwap(bestRoute, i, k);

      const newCost = routeCostEvaluator(
        newRoute,
        input.matrix,
        input.points,
        input.contraits,
        input.depotIndex,
      ).totalCost;

      if (newCost < bestCost) {
        bestRoute = newRoute;
        bestCost = newCost;
        improved = true;
      }
    }
  }
  return {
    route: bestRoute,
    improved,
  };
}

function twoOptSwap(route: number[], i: number, k: number): number[] {
  return [
    ...route.slice(0, i),
    ...route.slice(i, k + 1).reverse(),
    ...route.slice(k + 1),
  ];
}
