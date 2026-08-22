import { Point } from "@/domain/types/Point";
import { Solution } from "@/domain/types/Solution";

export type VehicleStatsDto = {
  vehicleIndex: number;
  totalServiceTime: number;
  totalTravelTime: number;
  totalWaitingTime: number;
  totalBreakTime: number;
  totalRestTime: number;
  totalWorkTime: number;
  totalDistanceKm: number;
  estimatedPrice: number | null;
  feasible: boolean;
};

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
  totalDistanceKm: number;
  estimatedPrice: number | null;
  vehicleStats: VehicleStatsDto[];
};

export function optimizeRouteDto(
  solution: Solution,
  points: Point[],
  totalDistanceKm: number,
  estimatedPrice: number | null,
  vehicleStats: VehicleStatsDto[],
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
    totalDistanceKm,
    estimatedPrice,
    vehicleStats,
  };
}
