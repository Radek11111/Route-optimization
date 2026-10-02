import { multiStartSolver } from "@/domain/tps/solver/multiStartSolver";
import { MatrixProvider } from "@/domain/types/MatrixProvider";
import { mapConstraintsToDomain } from "@/modules/optimization/mappers/mapConstraintsToDomain";
import { mapPointToDomain } from "@/modules/optimization/mappers/mapPointToDomain";
import { getRouteForOptimization } from "../../optimization/repositories/optimization-repository";
import { optimizeRouteDto } from "@/modules/optimization/dto/optimizeRoute.dto";
import { sumSolutionDistance } from "@/features/solutions/sumSolutionDistance";
import { calculateNaiveCost } from "@/features/solutions/calculateNaiveCost";
import { routeCostEvaluator } from "@/domain/tps/evaluators/routeCostEvaluator";
import { sumRouteDistance } from "@/features/solutions/sumRouteDistance";
import { solutionCostEvaluator } from "@/domain/tps/evaluators/solutionCostEvaluator";

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

  const solutionBreakdown = solutionCostEvaluator(
    solution.routes,
    matrix.durationMatrix,
    allDomainPoints,
    constraints,
    depotIndex,
  ).breakdown;

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

  const naiveDistanceMeters = calculateNaiveCost(
    allDomainPoints.length,
    depotIndex,
    matrix.distanceMatrix,
    constraints,
  );

  const naiveDistanceKm = naiveDistanceMeters / 1000;
  const savedDistanceKm = naiveDistanceKm - totalDistanceKm;
  const savedPercent =
    naiveDistanceKm > 0
      ? Math.round((savedDistanceKm / naiveDistanceKm) * 100)
      : 0;

  const vehicleStats = solution.routes.map((vehicleRoute, vehicleIndex) => {
    const cost = routeCostEvaluator(
      vehicleRoute,
      matrix.durationMatrix,
      allDomainPoints,
      constraints,
      depotIndex,
    );

    const totalServiceTime = vehicleRoute.reduce((acc, pointIndex) => {
      const point = allDomainPoints[pointIndex];
      return acc + (point?.serviceTimeMinutes ?? 0);
    }, 0);

    const totalWorkTime =
      cost.breakdown.travelTime +
      cost.breakdown.serviceTime +
      cost.breakdown.waitingTime;

    const distanceMeters = sumRouteDistance(
      vehicleRoute,
      matrix.distanceMatrix,
      depotIndex,
      constraints.returnToDepot ?? false,
    );
    const distanceKm = distanceMeters / 1000;

    return {
      vehicleIndex,
      totalTravelTime: cost.breakdown.travelTime,
      totalServiceTime: cost.breakdown.serviceTime,
      totalWaitingTime: cost.breakdown.waitingTime,
      totalBreakTime: cost.breakdown.breakTime,
      totalRestTime: cost.breakdown.restTime,
      totalWorkTime,
      totalDistanceKm: distanceKm,
      estimatedPrice: route.ratePerKm ? distanceKm * route.ratePerKm : null,
      feasible: cost.feasible,
    };
  });

  return {
    dto: optimizeRouteDto(
      solution,
      allDomainPoints,
      totalDistanceKm,
      estimatedPrice,
      vehicleStats,
    ),
    solution,
    domainPoints,
    depotDomainPoint,
    totalDistanceKm,
    estimatedPrice,
    naiveDistanceKm,
    savedDistanceKm,
    savedPercent,
    vehicleStats,
    solutionBreakdown,
  };
}
