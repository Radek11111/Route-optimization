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
    },
  });
}

export async function getRoutesByUserId(userId: string) {
  return prisma.route.findMany({
    where: {
      userId: userId,
    },

    include: {
      points: true,
      constraints: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}
