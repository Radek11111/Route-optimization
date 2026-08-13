import { RouteSimulationState } from "@/domain/types/RouteSimulationState";
import { PENALTIES } from "./penalty.config";

export function calculateDrivingRulesPenalty(
  state: RouteSimulationState,
): number {
  return state.totalDrivingRuleBreaks * PENALTIES.DRIVING_RULE_BREAK_WEIGHT;
}
