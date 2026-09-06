import { Solution } from "@/domain/types/Solution";
import { solutionCostEvaluator } from "../evaluators/solutionCostEvaluator";
import { Point } from "@/domain/types/Point";
import { Constraints } from "@/domain/types/Constraints";
import { isBetterSolution } from "../utils/isBetterSolution";
import { routeCostEvaluator } from "../evaluators/routeCostEvaluator";

type Input = {
  matrix: number[][];
  points: Point[];
  constraints: Constraints;
  depotIndex: number;
};

export function relocateOperator(solution: Solution, input: Input) {
  const bestRoutes = solution.routes.map((route) => [...route]);

  let routeCosts = bestRoutes.map((route) =>
    routeCostEvaluator(
      route,
      input.matrix,
      input.points,
      input.constraints,
      input.depotIndex,
    ),
  );

  let globalImproved = false;
  let improved: boolean;

  do {
    improved = false;

    let bestTotalCost = routeCosts.reduce(
      (sum, cost) => sum + cost.totalCost,
      0,
    );

    outer: for (
      let fromRouteIndex = 0;
      fromRouteIndex < bestRoutes.length;
      fromRouteIndex++
    ) {
      for (
        let toRouteIndex = 0;
        toRouteIndex < bestRoutes.length;
        toRouteIndex++
      ) {
        const fromRoute = bestRoutes[fromRouteIndex];
        const toRoute = bestRoutes[toRouteIndex];

        for (let i = 0; i < fromRoute.length; i++) {
          const pointToMove = fromRoute[i];

          for (let j = 0; j <= toRoute.length; j++) {
            if (fromRouteIndex === toRouteIndex && (j === i || j === i + 1)) {
              continue;
            }

            const sameRoute = fromRouteIndex === toRouteIndex;

            const candidateFrom = [...fromRoute];
            candidateFrom.splice(i, 1);

            const candidateTo = sameRoute ? candidateFrom : [...toRoute];

            const insertIndex = sameRoute && j > i ? j - 1 : j;
            candidateTo.splice(insertIndex, 0, pointToMove);

            const fromCost = routeCostEvaluator(
              candidateFrom,
              input.matrix,
              input.points,
              input.constraints,
              input.depotIndex,
            );
            const toCost = sameRoute
              ? fromCost
              : routeCostEvaluator(
                  candidateTo,
                  input.matrix,
                  input.points,
                  input.constraints,
                  input.depotIndex,
                );

            const candidateTotalCost =
              bestTotalCost -
              routeCosts[fromRouteIndex].totalCost -
              (sameRoute ? 0 : routeCosts[toRouteIndex].totalCost) +
              fromCost.totalCost +
              (sameRoute ? 0 : toCost.totalCost);

            if (candidateTotalCost < bestTotalCost) {
              bestRoutes[fromRouteIndex] = candidateFrom;
              if (!sameRoute) bestRoutes[toRouteIndex] = candidateTo;

              routeCosts[fromRouteIndex] = fromCost;
              if (!sameRoute) routeCosts[toRouteIndex] = toCost;

              improved = true;
              globalImproved = true;
              break outer;
            }
          }
        }
      }
    }
  } while (improved);

  const finalTotalCost = routeCosts.reduce(
    (sum, cost) => sum + cost.totalCost,
    0,
  );

  return {
    solution: {
      routes: bestRoutes,
      unassigned: solution.unassigned,
      totalCost: finalTotalCost,
      feasible: routeCosts.every((c) => c.feasible),
    },
    improved: globalImproved,
  };
}
