import { multiStartSolver } from "@/domain/tps/solver/multiStartSolver";
import { MatrixProvider } from "@/domain/types/MatrixProvider";
import { mapConstraintsToDomain } from "@/modules/optimization/mappers/mapConstraintsToDomain";
import { mapPointToDomain } from "@/modules/optimization/mappers/mapPointToDomain";
import { getRouteForOptimization } from "../../optimization/repositories/optimization-repository";
import { optimizeRouteDto } from "@/modules/optimization/dto/optimizeRoute.dto";
import { sumSolutionDistance } from "@/features/solutions/sumSolutionDistance";

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

  const depotDomainPoint = mapPointToDomain(route.depotPoint);
  const domainPoints = route.points.map(mapPointToDomain);
  const allDomainPoints = [depotDomainPoint, ...domainPoints];

  const depotIndex = 0;

  const constraints = mapConstraintsToDomain(route);

  const matrix = await matrixProvider.getMatrix(allDomainPoints);

  const solution = multiStartSolver({
    matrix: matrix.durationMatrix,
    points: allDomainPoints,
    constraints,
    depotIndex,
    vehicleCount: route.vehicleCount,
  });

  const totalDistanceMeters = sumSolutionDistance(
    solution,
    matrix.distanceMatrix,
    depotIndex,
    constraints,
  );

  const totalDistanceKm = totalDistanceMeters / 1000;

  const estimatedPrice = route.ratePerKm
    ? totalDistanceKm * route.ratePerKm
    : null;

  return {
    dto: optimizeRouteDto(
      solution,
      allDomainPoints,
      totalDistanceKm,
      estimatedPrice,
    ),
    solution,
    domainPoints,
    depotDomainPoint,
    totalDistanceKm,
    estimatedPrice,
  };
}
