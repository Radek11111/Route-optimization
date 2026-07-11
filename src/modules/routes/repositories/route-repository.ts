import prisma from "@/lib/prisma";
import { CreateRouteInput } from "../schemas/create-route.schema";

type Input = CreateRouteInput & {
  userId: string;
};

export async function createRoute(input: Input) {
  return prisma.route.create({
    data: {
      name: input.name,
      description: input.description,
      vehicleCount: input.vehicleCount,
      userId: input.userId,
      workStartMinutes: input.workStartMinutes,
      workEndMinutes: input.workEndMinutes,
      maxWorkDurationMinutes: input.maxWorkDurationMinutes,
      breakAfterMinutes: input.breakAfterMinutes,
      breakDurationMinutes: input.breakDurationMinutes,
      returnToDepot: input.returnToDepot,
      ratePerKm: input.ratePerKm,
      estimatedPrice: input.estimatedPrice,
    },
  });
}

export async function getRoutesByUserId(userId: string) {
  return prisma.route.findMany({
    where: {
      userId: userId,
    },

    include: {
      _count: {
        select: {
          points: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getRouteById(routeId: string) {
  return prisma.route.findUnique({
    where: { id: routeId },
    include: {
      depotPoint: true,
      _count: { select: { points: true } },
    },
  });
}
