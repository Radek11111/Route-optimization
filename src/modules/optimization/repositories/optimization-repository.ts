import prisma from "@/lib/prisma";

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

export async function deletePreviousSolutions(routeId: string) {
  return prisma.solution.deleteMany({
    where: {
      routeId: routeId,
    },
  });
}
