import { Point } from "@/domain/types/Point";
import { Solution } from "@/domain/types/Solution";
import { saveFullSolution } from "@/modules/optimization/repositories/optimization-repository";
import { VehicleStatsDto } from "../../optimization/dto/optimizeRoute.dto";

export async function saveOptimizationResultService(
  routeId: string,
  solution: Solution,
  points: Point[],
  depotPoint: Point,
  totalDistanceKm?: number,
  estimatedPrice?: number | null,
  naiveDistanceKm?: number,
  savedDistanceKm?: number,
  savedPercent?: number,
  vehicleStats?: VehicleStatsDto[],
) {

  return saveFullSolution({
    routeId,
    solution,
    points,
    depotPoint,
    totalDistanceKm,
    estimatedPrice,
    naiveDistanceKm,
    savedDistanceKm,
    savedPercent,
    vehicleStats,
  });
}
