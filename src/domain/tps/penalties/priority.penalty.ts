import { Point } from "@/domain/types/Point";
import { PENALTIES } from "../../../../penalty.config";


export function calculatePriorityPenalty(
  route: number[],
  points: Point[],
): number {
  let penalty = 0;

  route.forEach((pointIndex, position) => {
    const point = points[pointIndex];

    if (!point.priority || point.priority <= 5) return;

    const normalizedPriority = (point.priority - 5) / 5;
    const timeFactor = position / route.length;

    penalty += normalizedPriority * timeFactor * PENALTIES.PRIORITY_BASE * 60;
  });

  return penalty;
}
