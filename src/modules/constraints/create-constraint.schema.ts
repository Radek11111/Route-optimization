import { z } from "zod";

export const createConstraintSchema = z.object({
  workStartMinutes: z.number().int().min(0).max(1440),
  workEndMinutes: z.number().int().min(0).max(1440),

  maxWorkDurationMinutes: z.number().int().min(0).max(1440),

  breakAfterMinutes: z.number().int().positive().optional(),
  breakDurationMinutes: z.number().int().positive().optional(),

  returnToDepot: z.boolean().optional(),
});
