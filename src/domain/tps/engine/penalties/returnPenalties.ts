import { Constraints } from "@/domain/types/Constraints";
import { RouteSimulationState } from "@/domain/types/RouteSimulationState";
import { PENALTIES } from "./pentalties.config";

export function calculateReturnPenalty(
  state: RouteSimulationState,
  constraints: Constraints,
  depotIndex: number,
): number {
  if (!constraints.returnToDepot) return 0;

  if (state.lastPointIndex === depotIndex) return 0;

  state.violations.returnViolation = true;

  return PENALTIES.RETURN_VIOLATION;
}
