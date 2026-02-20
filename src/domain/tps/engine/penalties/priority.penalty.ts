import { Point } from "@/domain/types/Point";
import { PENALTIES } from "./pentalties.config";

export function calculatePriorityPenalty(
  route: string[],
  points: Point[],
  pointIndex: Map<string, number>,
): number {
  let penalty = 0;

  route.forEach((id, position) => {
    const index = pointIndex.get(id);
    if (index === undefined) return;

    const point = points[index];
    if (!point.priority || point.priority <= 5) return;

    const normalizedPriority = (point.priority - 5) / 5;
    const timeFactor = position / route.length;

    penalty += normalizedPriority * timeFactor * PENALTIES.PRIORITY_BASE * 60;
  });

  return penalty;
}
