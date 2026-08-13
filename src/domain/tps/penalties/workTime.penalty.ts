import { RouteSimulationState } from "@/domain/types/RouteSimulationState";
import { PENALTIES } from "./penalty.config";

export function calculateWorkTimePenalty(state: RouteSimulationState): number {
  if (state.violations.workTime === 0) {
    return 0;
  }

  return state.violations.workTime * PENALTIES.HARD_PENALTY_PER_MINUTE;
}
