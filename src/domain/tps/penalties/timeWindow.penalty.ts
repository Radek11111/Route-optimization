import { RouteSimulationState } from "@/domain/types/RouteSimulationState";
import { PENALTIES } from "./penalty.config";

export function calculateTimeWindowPenalty(
  state: RouteSimulationState,
): number {
  return state.violations.timeWindows.reduce(
    (sum, v) => sum + v.violation * PENALTIES.WINDOW_PENALTY_PER_MINUTE,
    0,
  );
}
