import { Point } from "@/domain/types/Point";
import { Point as PrismaPoint } from "@/generated/prisma/client";

export function mapPointToDomain(point: PrismaPoint): Point {
  return {
    id: point.id,

    latitude: point.latitude,
    longitude: point.longitude,
    name: point.name ?? undefined,
    priority: point.priority,
    serviceTimeMinutes: point.serviceTimeMinutes,
    timeWindow:
      point.timeWindowStart !== null && point.timeWindowEnd !== null
        ? {
            start: point.timeWindowStart,

            end: point.timeWindowEnd,
          }
        : undefined,
  };
}
