import { Point } from "../../types/Point";

export function buildPointIndexMap(points: Point[]) {
  const map = new Map<string, number>();

  points.forEach((point, index) => {
    map.set(point.id, index);
  });

  return map;
}
