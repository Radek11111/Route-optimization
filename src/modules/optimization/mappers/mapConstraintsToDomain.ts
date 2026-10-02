import { Constraints } from "@/domain/types/Constraints";
import { Route } from "@/generated/prisma/client";
import { DEFAULT_EU_DRIVING_RULES } from "@/lib/drivingRules";

export function mapConstraintsToDomain(route: Route): Constraints {
  const base: Constraints = {
    workStartMinutes: route.workStartMinutes,
    workEndMinutes: route.workEndMinutes,
    maxWorkDurationMinutes: route.maxWorkDurationMinutes,
    returnToDepot: route.returnToDepot,
  };

  switch (route.driverMode) {
    case "TRUCK":
      return { ...base, drivingRules: DEFAULT_EU_DRIVING_RULES };
    case "COURIER":
      return {
        ...base,
        breakRules:
          route.courierBreakAfterMinutes != null &&
          route.courierBreakDurationMinutes != null
            ? {
                afterMinutes: route.courierBreakAfterMinutes,
                breakDurationMinutes: route.courierBreakDurationMinutes,
              }
            : undefined,
      };

    case "NONE":
      return base;
    default:
      throw new Error(
        `Unhandled driverMode: ${route.driverMode satisfies never}`,
      );
  }
}
