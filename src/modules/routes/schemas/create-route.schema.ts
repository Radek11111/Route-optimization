import { z } from "zod";

export const createRouteSchema = z
  .object({
    name: z.string().min(1).max(255),
    description: z.string().max(1000).optional(),
    vehicleCount: z.number().int().min(1).max(1000),
    workStartMinutes: z.number().int().min(0),
    workEndMinutes: z.number().int().min(0),
    maxWorkDurationMinutes: z.number().int().min(0),
    returnToDepot: z.boolean(),
    ratePerKm: z.number().optional(),
    driverMode: z.enum(["TRUCK", "COURIER", "NONE"]).default("TRUCK"),
    courierBreakAfterMinutes: z.number().int().min(1).optional(),
    courierBreakDurationMinutes: z.number().int().min(1).optional(),
  })
  .refine(
    (data) =>
      data.driverMode !== "COURIER" ||
      (data.courierBreakAfterMinutes != null &&
        data.courierBreakDurationMinutes != null),
    {
      message:
        "Tryb kuriera wymaga podania przerwy po X minutach i jej długości",
      path: ["courierBreakAfterMinutes"],
    },
  );

export type CreateRouteInput = z.infer<typeof createRouteSchema>;
