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

  if (!route.depotPointId) {
    throw new Error("Depot not configured");
  }

  if (route.points.length === 0) {
    throw new Error("Route has no points");
  }

  const domainPoints = route.points.map(mapPointToDomain);

  const depotIndex = route.points.findIndex(
    (point) => point.id === route.depotPointId,
  );

  if (depotIndex === -1) {
    throw new Error("Depot point not found");
  }

  const matrix = await matrixProvider.getMatrix(domainPoints);

  const solution = multiStartSolver({
    matrix,

    points: domainPoints,

    constraints: mapConstraintsToDomain(route),

    depotIndex,

    vehicleCount: route.vehicleCount,
  });

  return optimizeRouteDto(solution, domainPoints);
}

export async function createSolution(data: {
  routeId: string;
  totalCost: number;
  feasible: boolean;
}) {
  return prisma.solution.create({
    data: {
      routeId: data.routeId,
      totalCost: data.totalCost,
      feasible: data.feasible,
      status: "COMPLETED",
    },
  });
}
