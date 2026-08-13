import { Point } from "@/domain/types/Point";
import { Solution } from "@/domain/types/Solution";
import prisma from "@/lib/prisma";
import { VehicleStatsDto } from "../dto/optimizeRoute.dto";

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
}) {
  const {
    routeId,
    solution,
    points,
    depotPoint,
    totalDistanceKm,
    estimatedPrice,
  } = data;

  const allPoints = [depotPoint, ...points];
  return prisma.$transaction(async (tx) => {
    await tx.solution.deleteMany({ where: { routeId } });

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
          feasible: solution.feasible,
          totalTravelTime: stats?.totalTravelTime ?? 0,
          totalDistanceKm: stats?.totalDistanceKm ?? 0,
          estimatedPrice: stats?.estimatedPrice ?? null,
          totalServiceTime: stats?.totalServiceTime ?? 0,
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
