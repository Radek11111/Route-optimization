import { Point } from "@/domain/types/Point";
import { Solution } from "@/domain/types/Solution";
import prisma from "@/lib/prisma";
import { VehicleStatsDto } from "../dto/optimizeRoute.dto";
import { CostBreakdown } from "@/domain/types/CostBreakdown";

export async function getRouteForOptimization(routeId: string) {
  return prisma.route.findUnique({
    where: {
      id: routeId,
    },

    include: {
      depotPoint: true,
      points: {
        where: {
          depotForRoutes: {
            none: {},
          },
        },
      },
    },
  });
}

export async function saveFullSolution(data: {
  routeId: string;
  solution: Solution;
  points: Point[];
  depotPoint: Point;
  totalDistanceKm?: number;
  estimatedPrice?: number | null;
  naiveDistanceKm?: number;
  savedDistanceKm?: number;
  savedPercent?: number;
  vehicleStats?: VehicleStatsDto[] | null;
  breakdown?: CostBreakdown;
}) {
  const {
    routeId,
    solution,
    points,
    depotPoint,
    totalDistanceKm,
    estimatedPrice,
    breakdown,
  } = data;

  const allPoints = [depotPoint, ...points];
  return prisma.$transaction(async (tx) => {
    

    const savedSolution = await tx.solution.create({
      data: {
        routeId,
        totalCost: solution.totalCost,
        feasible: solution.feasible,
        totalDistanceKm,
        estimatedPrice,
        status: "COMPLETED",
        naiveDistanceKm: data.naiveDistanceKm,
        savedDistanceKm: data.savedDistanceKm,
        savedPercent: data.savedPercent,

        travelTime: breakdown?.travelTime ?? 0,
        serviceTime: breakdown?.serviceTime ?? 0,
        waitingTime: breakdown?.waitingTime ?? 0,
        breakTime: breakdown?.breakTime ?? 0,
        restTime: breakdown?.restTime ?? 0,
        workTimePenalty: breakdown?.workTimePenalty ?? 0,
        shiftEndPenalty: breakdown?.shiftEndPenalty ?? 0,
        timeWindowPenalty: breakdown?.timeWindowPenalty ?? 0,
        returnToDepotPenalty: breakdown?.returnToDepotPenalty ?? 0,
        priorityPenalty: breakdown?.priorityPenalty ?? 0,
        drivingRulesPenalty: breakdown?.drivingRulesPenalty ?? 0,
      },
    });

    for (
      let vehicleIndex = 0;
      vehicleIndex < solution.routes.length;
      vehicleIndex++
    ) {
      const route = solution.routes[vehicleIndex];

      const stats = data.vehicleStats?.find(
        (s) => s.vehicleIndex === vehicleIndex,
      );

      const vehicleRoute = await tx.vehicleRoute.create({
        data: {
          solutionId: savedSolution.id,
          vehicleIndex,
          feasible: stats?.feasible ?? solution.feasible,
          totalTravelTime: stats?.totalTravelTime ?? 0,
          totalDistanceKm: stats?.totalDistanceKm ?? 0,
          estimatedPrice: stats?.estimatedPrice ?? null,
          totalServiceTime: stats?.totalServiceTime ?? 0,
          totalWaitingTime: stats?.totalWaitingTime ?? 0,
          totalBreakTime: stats?.totalBreakTime ?? 0,
          totalRestTime: stats?.totalRestTime ?? 0,
          totalWorkTime: stats?.totalWorkTime ?? 0,
        },
      });
      for (let order = 0; order < route.length; order++) {
        const pointIndex = route[order];
        const pointId = allPoints[pointIndex].id;

        if (!pointId) {
          throw new Error(
            `Invalid pointIndex ${pointIndex} for route on order ${order}`,
          );
        }

        await tx.routeStop.create({
          data: {
            vehicleRouteId: vehicleRoute.id,
            pointId,
            order,
          },
        });
      }
    }
    for (const pointIndex of solution.unassigned) {
      const pointId = allPoints[pointIndex].id;
      await tx.unassignedPoint.create({
        data: {
          solutionId: savedSolution.id,
          pointId,
        },
      });
    }
    return savedSolution;
  });
}

export async function saveFailedSolution(
  routeId: string,
  errorMessage: string,
) {
  return prisma.solution.create({
    data: {
      routeId,
      status: "FAILED",
      feasible: false,
      errorMessage: errorMessage.slice(0, 1000),
    },
  });
}
