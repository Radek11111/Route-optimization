import { mapIndicesToPoints } from "@/domain/application/mapIndicesToPoints";
import { expect, it } from "vitest";

it("should map indices to correct points", () => {
  const points = [
    { id: "A", latitude: 0, longitude: 0 },
    { id: "B", latitude: 1, longitude: 1 },
  ];
  const result = mapIndicesToPoints([1, 0], points);
  expect(result[0].id).toBe("B");
  expect(result[1].id).toBe("A");
});
