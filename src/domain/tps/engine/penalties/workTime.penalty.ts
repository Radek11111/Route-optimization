import { Constraints } from "@/domain/types/Constraints";
import { RouteSimulationState } from "@/domain/types/RouteSimulationState";
import { PENALTIES } from "./pentalties.config";


export function calculateWorkTimePenalty( state: RouteSimulationState, constraints: Constraints): number {
    const totalWork = state.totalServiceTime + state.totalTravelTime;

    if(totalWork <= constraints.maxWorkDurationMinutes) {
        return 0;
    }

    const violation = totalWork - constraints.maxWorkDurationMinutes;
    state.violations.workTime = violation;

    return violation * PENALTIES.HARD_PENALTY_PER_MINUTE;
}