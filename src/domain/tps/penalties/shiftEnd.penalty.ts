import { RouteSimulationState } from "@/domain/types/RouteSimulationState";
import { PENALTIES } from "../../../../penalty.config";


export function calculateShiftEndPenalty(state: RouteSimulationState): number {
  if (state.violations.shiftEnd === 0) return 0;

  return state.violations.shiftEnd * PENALTIES.HARD_PENALTY_PER_MINUTE;
}
