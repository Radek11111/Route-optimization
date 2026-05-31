import { Point } from "@/domain/types/Point";
import { Solution } from "@/domain/types/Solution";

export function optimizeRouteDto(solution: Solution, points: Point[]) {
  return {
    routes: solution.routes.map((route) =>
      route.map((pointIndex) => ({
        id: points[pointIndex].id,
        name: points[pointIndex].name,
      })),
    ),
    totalCost: solution.totalCost,
    feasible: solution.feasible,
  };
}
