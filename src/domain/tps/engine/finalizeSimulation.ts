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

  if (constraints.returnToDepot && state.lastPointIndex !== depotIndex) {
    state.violations.returnViolation = true;
  }
}
