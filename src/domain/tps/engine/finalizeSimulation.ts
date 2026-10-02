import { Constraints } from "@/domain/types/Constraints";
import { RouteSimulationState } from "@/domain/types/RouteSimulationState";

export function finalizeSimulation(
  state: RouteSimulationState,
  constraints: Constraints,
  depotIndex: number,
) {
  const workedMinutes = state.currentTime - constraints.workStartMinutes;

  if (workedMinutes > constraints.maxWorkDurationMinutes) {
    state.violations.workTime =
      workedMinutes - constraints.maxWorkDurationMinutes;
  }

  if (state.currentTime > constraints.workEndMinutes) {
    state.violations.shiftEnd = state.currentTime - constraints.workEndMinutes;
  }

  if (constraints.returnToDepot && state.lastPointIndex !== depotIndex) {
    state.violations.returnViolation = true;
  }
}
