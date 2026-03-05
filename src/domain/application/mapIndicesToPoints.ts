import { Point } from "../types/Point";

export function mapIndicesToPoints(
  indices: number[],
  points: Point[],
): Point[] {
  return indices.map((index) => {
    if (index < 0 || index >= points.length) {
      throw new Error(`Invalid point index: ${index}`);
    }
    return points[index];
  });
}
