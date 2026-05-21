import prisma from "@/lib/prisma";

type Input = {
  routeId: string;

  workStartMinutes: number;
  workEndMinutes: number;

  maxWorkDurationMinutes: number;

  breakAfterMinutes?: number;
  breakDurationMinutes?: number;

  returnToDepot?: boolean;
};

export async function upsertConstraint(input: Input) {
  return await prisma.routeConstraint.upsert({
    where: { routeId: input.routeId },
    update: {
      workStartMinutes: input.workStartMinutes,
      workEndMinutes: input.workEndMinutes,
      maxWorkDurationMinutes: input.maxWorkDurationMinutes,
      breakAfterMinutes: input.breakAfterMinutes,
      breakDurationMinutes: input.breakDurationMinutes,
      returnToDepot: input.returnToDepot,
    },
    create: {
      routeId: input.routeId,
      workStartMinutes: input.workStartMinutes,
      workEndMinutes: input.workEndMinutes,
      maxWorkDurationMinutes: input.maxWorkDurationMinutes,
      breakAfterMinutes: input.breakAfterMinutes,
      breakDurationMinutes: input.breakDurationMinutes,
      returnToDepot: input.returnToDepot,
    },
  });
}

export async function getConstraintByRouteId(routeId: string) {
  return await prisma.routeConstraint.findUnique({
    where: { routeId },
  });
}
