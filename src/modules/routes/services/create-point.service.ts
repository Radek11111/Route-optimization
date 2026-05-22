import prisma from "@/lib/prisma";
import { CreatePointInput } from "@/modules/points/create-point.schema";
import { createPoint } from "../repositories/point-repository";

type Input = CreatePointInput & {
  routeId: string;
};

export async function createPointService(input: Input) {
  return createPoint(input);
}
