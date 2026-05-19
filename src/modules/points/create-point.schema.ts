import { z } from "zod";

export const createPointSchema = z.object({
  name: z.string().max(255).optional(),

  latitude: z.number().min(-90).max(90),

  longitude: z.number().min(-180).max(180),

  serviceTimeMinutes: z.number().int().min(0).default(0),

  priority: z.number().int().min(10).default(1),

  timeWindowStart: z.number().int().min(0).max(1440).optional(),
  timeWindowEnd: z.number().int().min(0).max(1440).optional(),

  isDepot: z.boolean().default(false),
});

export type CreatePointInput = z.infer<typeof createPointSchema>;
