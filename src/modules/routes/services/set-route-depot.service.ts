import prisma from "@/lib/prisma";

export async function setRouteDepotService(routeId: string, pointId: string) {
  const point = await prisma.point.findUnique({
    where: {
      id: pointId,
    },
  });
  if (!point) {
    throw new Error("Point not found");
  }
  if (point.routeId !== routeId) {
    throw new Error("Point does not belong to the route");
  }

  return prisma.route.update({
    where: {
      id: routeId,
    },
    data: {
      depotPointId: pointId,
    },
  });
}
