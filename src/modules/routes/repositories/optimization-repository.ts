import prisma from "@/lib/prisma";

export async function getRouteForOptimization(routeId: string) {
  return prisma.route.findUnique({
    where: {
      id: routeId,
    },

    include: {
      points: true,
    },
  });
}
