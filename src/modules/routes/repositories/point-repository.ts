import prisma from "@/lib/prisma";
import { CreatePointInput } from "@/modules/routes/schemas/create-point.schema";

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
