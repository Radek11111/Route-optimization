import { RouteSimulationState } from "@/domain/types/RouteSimulationState";
import { PENALTIES } from "./penalty.config";

export function calculateDrivingRulesPenalty(
  state: RouteSimulationState,
): number {
  return (
    (state.totalBreakTime + state.totalRestTime) *
    PENALTIES.DRIVING_RULE_BREAK_WEIGHT
  );
}
