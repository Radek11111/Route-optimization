
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

    simulateRoute(
      route,
      matrix,
      points,
      baseConstraints,
      0,
      state,
    );

    // depot -> A = 10
    // A -> B = 15
    // B -> depot = 20
    expect(state.totalTravelTime).toBe(45);
  });

  it("adds service time to total time", () => {
    const points = createPoints();
    const route = [1, 2];

    const state = createSimulationState(0, baseConstraints);

    simulateRoute(
      route,
      matrix,
      points,
      baseConstraints,
      0,
      state,
    );

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

    simulateRoute(
      route,
      matrix,
      points,
      baseConstraints,
      0,
      state,
    );

    // depot -> A = 10
    // wait until 50
    // service = 10
    expect(state.currentTime).toBe(60);
  });

  it("detects time window violation", () => {
    const points = createPoints();

    points[1].timeWindow = {
      start: 0,
      end: 5,
    };

    const route = [1];
    const state = createSimulationState(0, baseConstraints);

    simulateRoute(
      route,
      matrix,
      points,
      baseConstraints,
      0,
      state,
    );

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

    simulateRoute(
      route,
      matrix,
      points,
      baseConstraints,
      0,
      state,
    );

    expect(state.lastPointIndex).toBe(0);
  });

  it("counts return to depot as driving time", () => {
    const points = createPoints();
    const route = [1];

    const state = createSimulationState(0, baseConstraints);

    simulateRoute(
      route,
      matrix,
      points,
      baseConstraints,
      0,
      state,
    );

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

    simulateRoute(
      route,
      matrix,
      points,
      strictConstraints,
      0,
      state,
    );

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

    simulateRoute(
      route,
      matrix,
      points,
      constraints,
      0,
      state,
    );

    /*
      depot -> A = 10
      A -> B = 15

      Przed A -> B:
      10 + 15 > 20

      Kierowca robi 15 min przerwy.
      Następnie jedzie 15 min.

      B -> depot = 20
      Ponieważ 15 + 20 > 20,
      kierowca ponownie robi 15 min przerwy.
    */

    expect(state.totalDrivingRuleBreaks).toBe(30);
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

    simulateRoute(
      route,
      matrix,
      points,
      constraints,
      0,
      state,
    );

    /*
      Po drugiej przerwie:

      B -> depot = 20

      continuousDrivingMinutes = 20
    */

    expect(state.continuousDrivingMinutes).toBe(20);
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

    simulateRoute(
      route,
      matrix,
      points,
      constraints,
      0,
      state,
    );

    expect(state.totalDrivingRuleBreaks).toBe(0);
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

  // depot -> A = 10
  // A -> B = 15 -> daily rest 60
  // B -> depot = 20 -> daily rest 60

  expect(state.totalDrivingRuleBreaks).toBe(120);
  expect(state.drivingSinceRestMinutes).toBe(20);
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
    expect(state.totalDrivingRuleBreaks).toBe(60);
  });
  it("uses daily exception when return to depot exceeds the limit", () => {
    const points = createPoints();

    const constraints: Constraints = {
      ...baseConstraints,
      drivingRules: {
        ...baseConstraints.drivingRules!,
        maxContinuousDrivingMinutes: 100,

        maxDailyDrivingMinutes: 20,
        maxDailyDrivingExceptionMinutes: 25,
        maxExceptionsPerWeek: 1,

        regularDailyRestMinutes: 60,
        reducedDailyRestMinutes: 30,
        maxReducedRestCount: 0,
      },
    };

    const route = [1];

    const state = createSimulationState(0, constraints);

    simulateRoute(
      route,
      matrix,
      points,
      constraints,
      0,
      state,
    );



    expect(state.drivingSinceRestMinutes).toBe(20);
    expect(state.exceptionsUsed).toBe(0);
    expect(state.totalDrivingRuleBreaks).toBe(0);
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

   // pierwszy odpoczynek = reduced 30
   // drugi odpoczynek = regular 60

   expect(state.reducedRestUsed).toBe(1);
   expect(state.totalDrivingRuleBreaks).toBe(90);
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
    expect(state.totalDrivingRuleBreaks).toBe(120);
  });

  it("does not use driving rules when drivingRules are undefined", () => {
    const points = createPoints();

    const constraints: Constraints = {
      ...baseConstraints,
      drivingRules: undefined,
    };

    const route = [1, 2];

    const state = createSimulationState(0, constraints);

    simulateRoute(
      route,
      matrix,
      points,
      constraints,
      0,
      state,
    );

    expect(state.totalDrivingRuleBreaks).toBe(0);
    expect(state.continuousDrivingMinutes).toBe(45);
    expect(state.drivingSinceRestMinutes).toBe(45);
  });
});

