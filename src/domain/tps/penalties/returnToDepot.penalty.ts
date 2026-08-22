import { RouteSimulationState } from "@/domain/types/RouteSimulationState";
import { PENALTIES } from "../../../../penalty.config";


export function calculateReturnPenalty(state: RouteSimulationState): number {
  if (!state.violations.returnViolation) {
    return 0;
  }

  return PENALTIES.RETURN_VIOLATION;
}
