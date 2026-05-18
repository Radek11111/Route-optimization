import { z } from "zod";

export const createRouteSchema = z.object({
  name: z.string().min(1).max(255),

  description: z.string().max(1000).optional(),

  vehicleCount: z.number().int().min(1).max(1000),
});

export type CreateRouteInput = z.infer<typeof createRouteSchema>;
