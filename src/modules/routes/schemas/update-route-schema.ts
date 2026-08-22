import { z } from "zod";
import { createRouteSchema } from "./create-route.schema";

export const updateRouteSchema = createRouteSchema.partial();
export type UpdateRouteInput = z.infer<typeof updateRouteSchema>;
