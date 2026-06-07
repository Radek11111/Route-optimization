import { Point } from "@/domain/types/Point";
import { Solution } from "@/domain/types/Solution";

export type OptimalizationResponseDto = {
  routes: {
    id: string;
    name?: string;
  }[][];
  unassigned: {
    id: string;
    name?: string;
  }[];
  totalCost: number;
  feasible: boolean;
};

export function optimizeRouteDto(
  solution: Solution,
  points: Point[],
): OptimalizationResponseDto {
  return {
    routes: solution.routes.map((route) =>
      route.map((pointIndex) => ({
        id: points[pointIndex].id,
        name: points[pointIndex].name,
      })),
    ),
    unassigned: solution.unassigned.map((pointIndex) => ({
      id: points[pointIndex].id,
      name: points[pointIndex].name,
    })),
    totalCost: solution.totalCost,
    feasible: solution.feasible,
  };
}
