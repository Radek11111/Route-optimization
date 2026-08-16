import { Constraints } from "@/domain/types/Constraints";
import { Route } from "@/generated/prisma/client";
import { DEFAULT_EU_DRIVING_RULES } from "@/lib/drivingRules";

export function mapConstraintsToDomain(route: Route): Constraints {
  return {
    workStartMinutes: route.workStartMinutes,
    workEndMinutes: route.workEndMinutes,
    maxWorkDurationMinutes: route.maxWorkDurationMinutes,
    breakRules:
      route.breakAfterMinutes !== null && route.breakDurationMinutes !== null
        ? {
            afterMinutes: route.breakAfterMinutes,
            breakDurationMinutes: route.breakDurationMinutes,
          }
        : undefined,
    returnToDepot: route.returnToDepot,
    drivingRules: DEFAULT_EU_DRIVING_RULES,
  };
}
