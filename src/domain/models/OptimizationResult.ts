import { Route } from "./Route";

export interface OptimizationResult {
    route: Route;

    cost: number;
    feasible: boolean;

    meta: {
        algorithm: string;
        computationTimeMs: number;
    }
}