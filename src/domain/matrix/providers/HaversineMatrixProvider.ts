import { MatrixProvider } from "@/domain/types/MatrixProvider";
import { Point } from "@/domain/types/Point";
import { haversineDistance } from "../helper/haversineDistance";
import { MatrixResult } from "../../../domain/types/MatrixProvider";

const AVG_SPEED_KMH = 50;

export function HaversineMatrixProvider(): MatrixProvider {
  return {
    async getMatrix(points: Point[]): Promise<MatrixResult> {
      const durationMatrix: number[][] = [];
      const distanceMatrix: number[][] = [];

      for (const from of points) {
        const durationRow: number[] = [];
        const distanceRow: number[] = [];

        for (const to of points) {
          if (from.id === to.id) {
            durationRow.push(0);
            distanceRow.push(0);
            continue;
          }
          const distanceKm = haversineDistance(from, to);
          const durationMinutes = distanceKm / (AVG_SPEED_KMH / 60);

          durationRow.push(Math.round(durationMinutes));
          distanceRow.push(Math.round(distanceKm * 1000));
        }
        durationMatrix.push(durationRow);
        distanceMatrix.push(distanceRow);
      }
      return { durationMatrix, distanceMatrix };
    },
  };
}
