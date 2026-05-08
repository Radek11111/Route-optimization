import { describe, it, expect } from "vitest";
import { simulateRoute } from "@/domain/tps/engine/simulateRoute";
import { createSimulationState } from "@/domain/tps/factories/createSimulationState";
import { Point } from "@/domain/types/Point";
import { Constraints } from "@/domain/types/Constraints";

function createPoints(): Point[] {
  return [
    {
      id: "depot",
      latitude: 0,
      longitude: 0,
    },
    {
      id: "A",
      latitude: 0,
      longitude: 0,
      serviceTimeMinutes: 10,
    },
    {
      id: "B",
      latitude: 0,
      longitude: 0,
      serviceTimeMinutes: 5,
    },
  ];
}

const matrix = [
  [0, 10, 20],
  [10, 0, 15],
  [20, 15, 0],
];

const baseConstraints: Constraints = {
  workStartMinutes: 0,
  workEndMinutes: 500,
  maxWorkDurationMinutes: 500,
  returnToDepot: true,
};

describe("simulateRoute", () => {
  it("calculates travel time correctly", () => {
    const points = createPoints();
    const route = [1, 2];

    const state = createSimulationState(0, baseConstraints);

    simulateRoute(route, matrix, points, baseConstraints, 0, state);

    expect(state.totalTravelTime).toBe(10 + 15 + 20);
  });

  it("adds service time to total time", () => {
    const points = createPoints();
    const route = [1, 2];

    const state = createSimulationState(0, baseConstraints);

    simulateRoute(route, matrix, points, baseConstraints, 0, state);

    expect(state.totalServiceTime).toBe(10 + 5);
  });

  it("waits for time window", () => {
    const points = createPoints();
    points[1].timeWindow = { start: 50, end: 200 };

    const route = [1];
    const state = createSimulationState(0, baseConstraints);

    simulateRoute(route, matrix, points, baseConstraints, 0, state);

    expect(state.currentTime).toBe(70);
  });

  it("detects time window violation", () => {
    const points = createPoints();
    points[1].timeWindow = { start: 0, end: 5 };

    const route = [1];
    const state = createSimulationState(0, baseConstraints);

    simulateRoute(route, matrix, points, baseConstraints, 0, state);

    expect(state.violations.timeWindows.length).toBe(1);
  });

  it("handles return to depot", () => {
    const points = createPoints();
    const route = [1];

    const state = createSimulationState(0, baseConstraints);

    simulateRoute(route, matrix, points, baseConstraints, 0, state);

    expect(state.lastPointIndex).toBe(0);
  });

  it("detects work time violation", () => {
    const points = createPoints();

    const strictConstraints: Constraints = {
      workStartMinutes: 0,
      workEndMinutes: 20,
      maxWorkDurationMinutes: 20,
      returnToDepot: true,
    };

    const route = [1, 2];

    const state = createSimulationState(0, strictConstraints);

    simulateRoute(route, matrix, points, strictConstraints, 0, state);

    expect(state.violations.workTime).toBeGreaterThan(0);
  });
});
