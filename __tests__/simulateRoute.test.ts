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

  drivingRules: {
    maxContinuousDrivingMinutes: 100,
    drivingBreakMinutes: 15,

    maxDailyDrivingMinutes: 500,
    maxDailyDrivingExceptionMinutes: 600,
    maxExceptionsPerWeek: 1,

    regularDailyRestMinutes: 600,
    reducedDailyRestMinutes: 540,
    maxReducedRestCount: 1,
  },
};

describe("simulateRoute", () => {
  it("calculates travel time correctly", () => {
    const points = createPoints();
    const route = [1, 2];

    const state = createSimulationState(0, baseConstraints);

    simulateRoute(route, matrix, points, baseConstraints, 0, state);

    // depot -> A = 10
    // A -> B = 15
    // B -> depot = 20
    expect(state.totalTravelTime).toBe(45);
  });

  it("adds service time to total time", () => {
    const points = createPoints();
    const route = [1, 2];

    const state = createSimulationState(0, baseConstraints);

    simulateRoute(route, matrix, points, baseConstraints, 0, state);

    expect(state.totalServiceTime).toBe(15);
  });

  it("waits for time window", () => {
    const points = createPoints();

    points[1].timeWindow = {
      start: 50,
      end: 200,
    };

    const route = [1];
    const state = createSimulationState(0, baseConstraints);

    simulateRoute(route, matrix, points, baseConstraints, 0, state);

    expect(state.currentTime).toBe(70);
  });

  it("detects time window violation", () => {
    const points = createPoints();

    points[1].timeWindow = {
      start: 0,
      end: 5,
    };

    const route = [1];
    const state = createSimulationState(0, baseConstraints);

    simulateRoute(route, matrix, points, baseConstraints, 0, state);

    expect(state.violations.timeWindows).toHaveLength(1);

    expect(state.violations.timeWindows[0]).toEqual({
      pointId: "A",
      violation: 5,
    });
  });

  it("handles return to depot", () => {
    const points = createPoints();
    const route = [1];

    const state = createSimulationState(0, baseConstraints);

    simulateRoute(route, matrix, points, baseConstraints, 0, state);

    expect(state.lastPointIndex).toBe(0);
  });

  it("counts return to depot as driving time", () => {
    const points = createPoints();
    const route = [1];

    const state = createSimulationState(0, baseConstraints);

    simulateRoute(route, matrix, points, baseConstraints, 0, state);

    // depot -> A = 10
    // A -> depot = 10
    expect(state.continuousDrivingMinutes).toBe(20);
    expect(state.drivingSinceRestMinutes).toBe(20);
  });

  it("detects work time violation", () => {
    const points = createPoints();

    const strictConstraints: Constraints = {
      ...baseConstraints,
      workStartMinutes: 0,
      workEndMinutes: 20,
      maxWorkDurationMinutes: 20,
    };

    const route = [1, 2];

    const state = createSimulationState(0, strictConstraints);

    simulateRoute(route, matrix, points, strictConstraints, 0, state);

    expect(state.violations.workTime).toBeGreaterThan(0);
  });

  it("adds driving break when continuous driving limit is exceeded", () => {
    const points = createPoints();

    const constraints: Constraints = {
      ...baseConstraints,
      drivingRules: {
        ...baseConstraints.drivingRules!,
        maxContinuousDrivingMinutes: 20,
        drivingBreakMinutes: 15,
      },
    };

    const route = [1, 2];

    const state = createSimulationState(0, constraints);

    simulateRoute(route, matrix, points, constraints, 0, state);

    expect(state.totalBreakTime).toBe(30);
    expect(state.totalRestTime).toBe(0);
  });

  it("resets continuous driving time after driving break", () => {
    const points = createPoints();

    const constraints: Constraints = {
      ...baseConstraints,
      drivingRules: {
        ...baseConstraints.drivingRules!,
        maxContinuousDrivingMinutes: 20,
        drivingBreakMinutes: 15,
      },
    };

    const route = [1, 2];

    const state = createSimulationState(0, constraints);

    simulateRoute(route, matrix, points, constraints, 0, state);

    expect(state.continuousDrivingMinutes).toBe(5);
  });

  it("does not add driving break when limit is not exceeded", () => {
    const points = createPoints();

    const constraints: Constraints = {
      ...baseConstraints,
      drivingRules: {
        ...baseConstraints.drivingRules!,
        maxContinuousDrivingMinutes: 100,
        drivingBreakMinutes: 15,
      },
    };

    const route = [1, 2];

    const state = createSimulationState(0, constraints);

    simulateRoute(route, matrix, points, constraints, 0, state);

    expect(state.totalBreakTime).toBe(0);
    expect(state.totalRestTime).toBe(0);
  });

  it("adds daily rest when daily driving limit is exceeded", () => {
    const points = createPoints();

    const constraints: Constraints = {
      ...baseConstraints,
      drivingRules: {
        ...baseConstraints.drivingRules!,
        maxContinuousDrivingMinutes: 100,

        maxDailyDrivingMinutes: 20,
        maxDailyDrivingExceptionMinutes: 20,
        maxExceptionsPerWeek: 0,

        regularDailyRestMinutes: 60,
        reducedDailyRestMinutes: 30,
        maxReducedRestCount: 0,
      },
    };

    const route = [1, 2];

    const state = createSimulationState(0, constraints);

    simulateRoute(route, matrix, points, constraints, 0, state);

    expect(state.totalRestTime).toBe(120);
    expect(state.totalBreakTime).toBe(0);
  });

  it("uses daily driving exception when available", () => {
    const points = createPoints();

    const constraints: Constraints = {
      ...baseConstraints,
      drivingRules: {
        ...baseConstraints.drivingRules!,
        maxContinuousDrivingMinutes: 100,

        maxDailyDrivingMinutes: 20,
        maxDailyDrivingExceptionMinutes: 30,
        maxExceptionsPerWeek: 1,

        regularDailyRestMinutes: 60,
        reducedDailyRestMinutes: 30,
        maxReducedRestCount: 0,
      },
    };

    const route = [1, 2];

    const state = createSimulationState(0, constraints);

    simulateRoute(route, matrix, points, constraints, 0, state);

    expect(state.exceptionsUsed).toBe(1);
    expect(state.totalRestTime).toBe(60);
  });

  it("uses reduced daily rest when available", () => {
    const points = createPoints();

    const constraints: Constraints = {
      ...baseConstraints,
      drivingRules: {
        ...baseConstraints.drivingRules!,
        maxContinuousDrivingMinutes: 100,

        maxDailyDrivingMinutes: 20,
        maxDailyDrivingExceptionMinutes: 20,
        maxExceptionsPerWeek: 0,

        regularDailyRestMinutes: 60,
        reducedDailyRestMinutes: 30,
        maxReducedRestCount: 1,
      },
    };

    const route = [1, 2];

    const state = createSimulationState(0, constraints);

    simulateRoute(route, matrix, points, constraints, 0, state);

    expect(state.reducedRestUsed).toBe(1);
    expect(state.totalRestTime).toBe(90);
  });

  it("uses regular daily rest when reduced rest is no longer available", () => {
    const points = createPoints();

    const constraints: Constraints = {
      ...baseConstraints,
      drivingRules: {
        ...baseConstraints.drivingRules!,
        maxContinuousDrivingMinutes: 100,

        maxDailyDrivingMinutes: 20,
        maxDailyDrivingExceptionMinutes: 20,
        maxExceptionsPerWeek: 0,

        regularDailyRestMinutes: 60,
        reducedDailyRestMinutes: 30,
        maxReducedRestCount: 0,
      },
    };

    const route = [1, 2];

    const state = createSimulationState(0, constraints);

    simulateRoute(route, matrix, points, constraints, 0, state);

    expect(state.reducedRestUsed).toBe(0);
    expect(state.totalRestTime).toBe(120);
  });

  it("does not use driving rules when drivingRules are undefined", () => {
    const points = createPoints();

    const constraints: Constraints = {
      ...baseConstraints,
      drivingRules: undefined,
    };

    const route = [1, 2];

    const state = createSimulationState(0, constraints);

    simulateRoute(route, matrix, points, constraints, 0, state);

    expect(state.totalBreakTime).toBe(0);
    expect(state.totalRestTime).toBe(0);
  });

  it("advances currentTime to the window start using clock time, not raw cumulative time", () => {
    const depotIndex = 0;

    const points: Point[] = [
      {
        id: "depot",
        latitude: 0,
        longitude: 0,
      },
      {
        id: "client-a",
        latitude: 0,
        longitude: 0,
        timeWindow: {
          start: 480,
          end: 600,
        },
      },
    ];

    const matrix = [
      [0, 1500],
      [1500, 0],
    ];

    const constraints: Constraints = {
      workStartMinutes: 0,
      workEndMinutes: 1440,
      maxWorkDurationMinutes: 100000,
    };

    const state = createSimulationState(depotIndex, constraints);

    simulateRoute([1], matrix, points, constraints, depotIndex, state);

    expect(state.currentTime).toBe(1920);
    expect(state.violations.timeWindows).toHaveLength(0);
  });

  it("flags a violation based on clock time even after multiple elapsed days", () => {
    const depotIndex = 0;

    const points: Point[] = [
      {
        id: "depot",
        latitude: 0,
        longitude: 0,
      },
      {
        id: "client-a",
        latitude: 0,
        longitude: 0,
        timeWindow: {
          start: 480,
          end: 600,
        },
      },
    ];

    const matrix = [
      [0, 2140],
      [2140, 0],
    ];

    const constraints: Constraints = {
      workStartMinutes: 0,
      workEndMinutes: 1440,
      maxWorkDurationMinutes: 100000,
    };

    const state = createSimulationState(depotIndex, constraints);

    simulateRoute([1], matrix, points, constraints, depotIndex, state);

    expect(state.violations.timeWindows).toHaveLength(1);

    expect(state.violations.timeWindows[0]).toEqual({
      pointId: "client-a",
      violation: 100,
    });
  });

  it("inserts a break before an over-limit leg back to the depot", () => {
    const depotIndex = 0;

    const points: Point[] = [
      {
        id: "depot",
        latitude: 0,
        longitude: 0,
      },
      {
        id: "client-a",
        latitude: 0,
        longitude: 0,
      },
    ];

    const matrix = [
      [0, 10],
      [500, 0],
    ];

    const constraints: Constraints = {
      workStartMinutes: 0,
      workEndMinutes: 1440,
      maxWorkDurationMinutes: 100000,
      returnToDepot: true,

      drivingRules: {
        maxContinuousDrivingMinutes: 270,
        drivingBreakMinutes: 45,

        maxDailyDrivingMinutes: 540,
        maxDailyDrivingExceptionMinutes: 600,
        maxExceptionsPerWeek: 2,

        regularDailyRestMinutes: 660,
        reducedDailyRestMinutes: 540,
        maxReducedRestCount: 3,
      },
    };

    const state = createSimulationState(depotIndex, constraints);

    simulateRoute([1], matrix, points, constraints, depotIndex, state);

    expect(state.totalBreakTime + state.totalRestTime).toBeGreaterThanOrEqual(
      45,
    );
  });

  it("splits a single very long leg into breaks AND a daily rest", () => {
    const points: Point[] = [
      { id: "depot", latitude: 0, longitude: 0 },
      { id: "A", latitude: 0, longitude: 0 },
    ];
    const matrix = [
      [0, 600],
      [600, 0],
    ];
    const constraints: Constraints = {
      workStartMinutes: 0,
      workEndMinutes: 100000,
      maxWorkDurationMinutes: 100000,
      returnToDepot: false,

      drivingRules: {
        maxContinuousDrivingMinutes: 270,
        drivingBreakMinutes: 45,

        maxDailyDrivingMinutes: 540,
        maxDailyDrivingExceptionMinutes: 540,
        maxExceptionsPerWeek: 0,

        regularDailyRestMinutes: 660,
        reducedDailyRestMinutes: 540,
        maxReducedRestCount: 0,
      },
    };

    const state = createSimulationState(0, constraints);
    simulateRoute([1], matrix, points, constraints, 0, state);

    expect(state.totalTravelTime).toBe(600);
    expect(state.totalBreakTime).toBe(90);
    expect(state.totalRestTime).toBe(660);
    expect(state.drivingSinceRestMinutes).toBe(60);
  });

  it("does not insert a break when a leg exactly consumes remaining capacity", () => {
    const points: Point[] = [
      { id: "depot", latitude: 0, longitude: 0 },
      { id: "A", latitude: 0, longitude: 0 },
      { id: "B", latitude: 0, longitude: 0 },
    ];

    const matrix = [
      [0, 100, 0],
      [0, 0, 1],
      [0, 0, 0],
    ];

    const constraints: Constraints = {
      workStartMinutes: 0,
      workEndMinutes: 100000,
      maxWorkDurationMinutes: 100000,
      returnToDepot: false,

      drivingRules: {
        maxContinuousDrivingMinutes: 100,
        drivingBreakMinutes: 15,

        maxDailyDrivingMinutes: 500,
        maxDailyDrivingExceptionMinutes: 500,
        maxExceptionsPerWeek: 0,

        regularDailyRestMinutes: 600,
        reducedDailyRestMinutes: 600,
        maxReducedRestCount: 0,
      },
    };

    const state = createSimulationState(0, constraints);
    simulateRoute([1, 2], matrix, points, constraints, 0, state);

    expect(state.totalBreakTime).toBe(15);
    expect(state.continuousDrivingMinutes).toBe(1);
  });

  it("inserts generic break based on breakRules when drivingRules is undefined", () => {
    const points: Point[] = [
      { id: "depot", latitude: 0, longitude: 0 },
      { id: "A", latitude: 0, longitude: 0, serviceTimeMinutes: 20 },
      { id: "B", latitude: 0, longitude: 0 },
    ];

    const matrix = [
      [0, 50, 0],
      [0, 0, 50],
      [0, 0, 0],
    ];

    const constraints: Constraints = {
      workStartMinutes: 0,
      workEndMinutes: 100000,
      maxWorkDurationMinutes: 100000,
      drivingRules: undefined,
      breakRules: { afterMinutes: 60, breakDurationMinutes: 10 },
    };

    const state = createSimulationState(0, constraints);
    simulateRoute([1, 2], matrix, points, constraints, 0, state);

    expect(state.totalBreakTime).toBe(10);
  });

  it("flags shiftEnd violation when currentTime exceeds workEndMinutes", () => {
    const constraints: Constraints = {
      workStartMinutes: 0,
      workEndMinutes: 30,
      maxWorkDurationMinutes: 100000,
    };

    const state = createSimulationState(0, constraints);

    const matrix = [
      [0, 40],
      [40, 0],
    ];

    const points: Point[] = [
      {
        id: "depot",
        latitude: 0,
        longitude: 0,
      },
      {
        id: "point-1",
        latitude: 1,
        longitude: 1,
      },
    ];

    simulateRoute([1], matrix, points, constraints, 0, state);

    expect(state.currentTime).toBe(40);
    expect(state.violations.shiftEnd).toBeGreaterThan(0);
  });

  it("handles overnight time windows crossing midnight", () => {
    const constraints: Constraints = {
      workStartMinutes: 0,
      workEndMinutes: 30,
      maxWorkDurationMinutes: 100000,
    };

    const state = createSimulationState(0, constraints);
    const points: Point[] = [
      { id: "depot", latitude: 0, longitude: 0 },
      {
        id: "A",
        latitude: 0,
        longitude: 0,
        timeWindow: { start: 1320, end: 120 },
      },
    ];
    const matrix = [
      [0, 1380],
      [1380, 0],
    ];

    simulateRoute([0], matrix, points, constraints, 0, state);

    expect(state.violations.timeWindows).toHaveLength(0);
  });
});
