import { multiStartSolver } from "@/domain/tps/solver/multiStartSolver";
import { MatrixProvider } from "@/domain/types/MatrixProvider";
import prisma from "@/lib/prisma";
import { mapConstraintsToDomain } from "@/modules/optimization/mappers/mapConstraintsToDomain";
import { mapPointToDomain } from "@/modules/optimization/mappers/mapPointToDomain";


export async function runOptimizationService(
  routeId: string,
  matrixProvider: MatrixProvider,
) {
  const route = await prisma.route.findUnique({
    where: {
      id: routeId,
    },

    include: {
      points: true,
    },
  });

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

  const depotIndex = route.points.findIndex((point) => point.id === route.depotPointId);

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

  return solution;
}
