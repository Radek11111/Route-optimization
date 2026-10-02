import prisma from "@/lib/prisma";
import { CreatePointInput } from "@/modules/points/schemas/create-point.schema";

type Input = CreatePointInput & {
  routeId: string;
};

export async function createPoint(input: Input) {
  return prisma.point.create({
    data: {
      routeId: input.routeId,
      name: input.name,
      latitude: input.latitude,
      longitude: input.longitude,
      serviceTimeMinutes: input.serviceTimeMinutes,
      priority: input.priority,
      timeWindowStart: input.timeWindowStart,
      timeWindowEnd: input.timeWindowEnd,
    },
  });
}

export async function getPointsByRouteId(routeId: string) {
  return prisma.point.findMany({
    where: { routeId },
    orderBy: { createdAt: "asc" },
  });
}

export async function deletePoint(pointId: string) {
  return prisma.point.delete({
    where: { id: pointId },
  });
}

export async function getPointWithRoute(pointId: string) {
  return prisma.point.findUnique({
    where: { id: pointId },
    include: { route: true },
  });
}
