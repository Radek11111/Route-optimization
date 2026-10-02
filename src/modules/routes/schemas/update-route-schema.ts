import { z } from "zod";
import { routeSchemaShape } from "./create-route.schema";

const partialRouteShape = routeSchemaShape.partial();

function courierBreakRulesRefinement(
  data: Pick<
    z.infer<typeof partialRouteShape>,
    "driverMode" | "courierBreakAfterMinutes" | "courierBreakDurationMinutes"
  >,
) {
  return (
    data.driverMode !== "COURIER" ||
    (data.courierBreakAfterMinutes != null &&
      data.courierBreakDurationMinutes != null)
  );
}

export const updateRouteSchema = partialRouteShape.refine(
  courierBreakRulesRefinement,
  {
    message: "Tryb kuriera wymaga podania przerwy po X minutach i jej długości",
    path: ["courierBreakAfterMinutes"],
  },
);

export type UpdateRouteInput = z.infer<typeof updateRouteSchema>;
