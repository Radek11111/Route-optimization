import { z } from "zod";

export const createRouteSchema = z.object({
  name: z.string().min(1).max(255),

  description: z.string().max(1000).optional(),

  vehicleCount: z.number().int().min(1).max(1000),
  workStartMinutes: z.number().int().min(0),
  workEndMinutes: z.number().int().min(0),
  maxWorkDurationMinutes: z.number().int().min(0),
  breakAfterMinutes: z.number().int().optional(),
  breakDurationMinutes: z.number().int().optional(),
  returnToDepot: z.boolean().default(false),
});

export type CreateRouteInput = z.infer<typeof createRouteSchema>;
