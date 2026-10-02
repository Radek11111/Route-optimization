import { twoOpt } from "@/domain/tps/heuristics/twoOpt";
import { describe, expect, it } from "vitest";

describe("twoOpt", () => {
  it("improved route when possible", () => {
    const route = [1, 3, 2];
      const matrix = [
        [0, 10, 1, 1],
        [10, 0, 1, 10],
        [1, 1, 0, 1],
        [1, 10, 5, 0],
      ];
    const input = {
      matrix,
      points: [
        { id: "depot", latitude: 0, longitude: 0 },
        { id: "A", latitude: 0, longitude: 0 },
        { id: "B", latitude: 0, longitude: 0 },
        { id: "C", latitude: 0, longitude: 0 },
      ],
      constraints: {
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
      },
      depotIndex: 0,
    };

    const result = twoOpt(route, input);
    expect(result.improved).toBe(true);
  });

  it("does not change optimal route", () => {
    const route = [1, 2, 3];

    const matrix = [
      [0, 1, 2, 3],
      [1, 0, 1, 2],
      [2, 1, 0, 1],
      [3, 2, 1, 0],
    ];
    const input = {
      matrix,
      points: [
        { id: "depot", latitude: 0, longitude: 0 },
        { id: "A", latitude: 0, longitude: 0 },
        { id: "B", latitude: 0, longitude: 0 },
        { id: "C", latitude: 0, longitude: 0 },
      ],
      constraints: {
        workStartMinutes: 0,
        workEndMinutes: 1000,
        maxWorkDurationMinutes: 1000,
        returnToDepot: true,
      },
      depotIndex: 0,
    };

    const result = twoOpt(route, input);
    expect(result.improved).toBe(false);
  });

  it("keeps same number of points", () => {
    const route = [1, 2, 3];

    const matrix = [
      [0, 1, 2, 3],
      [1, 0, 1, 2],
      [2, 1, 0, 1],
      [3, 2, 1, 0],
    ];
    const input = {
      matrix,
      points: [
        { id: "depot", latitude: 0, longitude: 0 },
        { id: "A", latitude: 0, longitude: 0 },
        { id: "B", latitude: 0, longitude: 0 },
        { id: "C", latitude: 0, longitude: 0 },
      ],
      constraints: {
        workStartMinutes: 0,
        workEndMinutes: 1000,
        maxWorkDurationMinutes: 1000,
        returnToDepot: true,
      },
      depotIndex: 0,
    };
    const result = twoOpt(route, input);

    expect(result.route.length).toBe(route.length);
  });
});
