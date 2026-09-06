import { z } from "zod";

export const routeSchemaShape = z.object({
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
});

function courierBreakRulesRefinement(
  data: Pick<
    z.infer<typeof routeSchemaShape>,
    "driverMode" | "courierBreakAfterMinutes" | "courierBreakDurationMinutes"
  >,
) {
  return (
    data.driverMode !== "COURIER" ||
    (data.courierBreakAfterMinutes != null &&
      data.courierBreakDurationMinutes != null)
  );
}

const REFINE_OPTIONS = {
  message: "Tryb kuriera wymaga podania przerwy po X minutach i jej długości",
  path: ["courierBreakAfterMinutes"]
};

export const createRouteSchema = routeSchemaShape.refine(
  courierBreakRulesRefinement,
  REFINE_OPTIONS,
);

export type CreateRouteInput = z.infer<typeof createRouteSchema>;
