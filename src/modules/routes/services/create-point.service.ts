import prisma from "@/lib/prisma";
import { CreatePointInput } from "@/modules/points/schemas/create-point.schema";
import { createPoint } from "../../points/repositories/point-repository";

type Input = CreatePointInput & {
  routeId: string;
};

export async function createPointService(input: Input) {
  return createPoint(input);
}
