import { upsertConstraint } from "../repositories/constraint-repository";

type Input = {
  routeId: string;

  workStartMinutes: number;
  workEndMinutes: number;

  maxWorkDurationMinutes: number;

  breakAfterMinutes?: number;
  breakDurationMinutes?: number;

  returnToDepot?: boolean;
};

export async function upsertConstraintService(input: Input) {
  if (input.workEndMinutes <= input.workStartMinutes) {
    throw new Error("workEndMinutes must be greater than workStartMinutes");
  }
  return upsertConstraint(input);
}
