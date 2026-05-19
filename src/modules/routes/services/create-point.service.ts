import prisma from "@/lib/prisma";
import { CreatePointInput } from "@/modules/points/create-point.schema";
import { createPoint } from "../repositories/point-repository";

type Input = CreatePointInput & {
  routeId: string;
};

export async function createPointService(input: Input) {
  if (input.isDepot) {
    const existingDepot = await prisma.point.findFirst({
      where: {
        routeId: input.routeId,
        isDepot: true,
      },
    });

    if (existingDepot) {
      throw new Error(
        "A depot already exists for this route. Only one depot is allowed per route.",
      );
    }
  }
  return createPoint(input);
}
