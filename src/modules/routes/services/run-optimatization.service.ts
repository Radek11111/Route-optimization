import { multiStartSolver } from "@/domain/tps/solver/multiStartSolver";
import { MatrixProvider } from "@/domain/types/MatrixProvider";
import { mapConstraintsToDomain } from "@/modules/optimization/mappers/mapConstraintsToDomain";
import { mapPointToDomain } from "@/modules/optimization/mappers/mapPointToDomain";
import { getRouteForOptimization } from "../../optimization/repositories/optimization-repository";
import prisma from "@/lib/prisma";
import { optimizeRouteDto } from "@/modules/optimization/dto/optimizeRoute.dto";

export async function runOptimizationService(
  routeId: string,
  matrixProvider: MatrixProvider,
) {
  const route = await getRouteForOptimization(routeId);

  if (!route) {
    throw new Error("Route not found");
  }

  if (!route.depotPoint) {
    throw new Error("Depot not configured");
  }

  if (route.points.length === 0) {
    throw new Error("Route has no points");
  }

 
  const allDomainPoints = [
    mapPointToDomain(route.depotPoint),
    ...route.points.map(mapPointToDomain),
  ];

  const depotIndex = 0;

  const matrix = await matrixProvider.getMatrix(allDomainPoints);

  const solution = multiStartSolver({
    matrix,
    points: allDomainPoints,
    constraints: mapConstraintsToDomain(route),
    depotIndex,
    vehicleCount: route.vehicleCount,
  });

  return { dto: optimizeRouteDto(solution, allDomainPoints), solution };
}
