import { Point } from "@/domain/types/Point";

export function haversineMatrixDistanceProvider(
  from: Point,
  to: Point,
): number {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(to.latitude - from.latitude);
  const dLon = toRad(to.longitude - from.longitude);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(from.latitude)) *
      Math.cos(toRad(to.latitude)) *
      Math.sin(dLon / 2) ** 2;

  const distance = 2 * R * Math.asin(Math.sqrt(a));
  const avgSpeedKmh = 50;

  return (distance / avgSpeedKmh) * 60;
}
