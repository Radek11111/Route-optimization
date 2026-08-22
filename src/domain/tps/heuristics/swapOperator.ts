import { Solution } from "@/domain/types/Solution";
import { Constraints } from "@/domain/types/Constraints";
import { Point } from "@/domain/types/Point";
import { routeCostEvaluator } from "../evaluators/routeCostEvaluator";

type Input = {
  matrix: number[][];
  points: Point[];
  constraints: Constraints;
  depotIndex: number;
};

export function swapOperator(solution: Solution, input: Input) {
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
    let bestTotalCost = routeCosts.reduce((sum, c) => sum + c.totalCost, 0);

    outer: for (let r1 = 0; r1 < bestRoutes.length; r1++) {
      for (let r2 = r1; r2 < bestRoutes.length; r2++) {
        const route1 = bestRoutes[r1];
        const route2 = bestRoutes[r2];
        const sameRoute = r1 === r2;

        for (let i = 0; i < route1.length; i++) {
          for (let j = 0; j < route2.length; j++) {
            if (sameRoute && i === j) continue;

            if (sameRoute) {
              const candidate = [...route1];
              [candidate[i], candidate[j]] = [candidate[j], candidate[i]];

              const cost = routeCostEvaluator(
                candidate,
                input.matrix,
                input.points,
                input.constraints,
                input.depotIndex,
              );

              const candidateTotalCost =
                bestTotalCost - routeCosts[r1].totalCost + cost.totalCost;

              if (candidateTotalCost < bestTotalCost) {
                bestRoutes[r1] = candidate;
                routeCosts[r1] = cost;
                improved = true;
                globalImproved = true;
                break outer;
              }
              continue;
            }

            const candidate1 = [...route1];
            const candidate2 = [...route2];

            candidate1[i] = route2[j];
            candidate2[j] = route1[i];

            const cost1 = routeCostEvaluator(
              candidate1,
              input.matrix,
              input.points,
              input.constraints,
              input.depotIndex,
            );
            const cost2 = routeCostEvaluator(
              candidate2,
              input.matrix,
              input.points,
              input.constraints,
              input.depotIndex,
            );

            const candidateTotalCost =
              bestTotalCost -
              routeCosts[r1].totalCost -
              routeCosts[r2].totalCost +
              cost1.totalCost +
              cost2.totalCost;

            if (candidateTotalCost < bestTotalCost) {
              bestRoutes[r1] = candidate1;
              bestRoutes[r2] = candidate2;
              routeCosts[r1] = cost1;
              routeCosts[r2] = cost2;
              improved = true;
              globalImproved = true;
              break outer;
            }
          }
        }
      }
    }
  } while (improved);

  const finalTotalCost = routeCosts.reduce((sum, c) => sum + c.totalCost, 0);

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
