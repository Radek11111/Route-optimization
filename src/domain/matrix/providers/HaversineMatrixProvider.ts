import { MatrixProvider } from "@/domain/types/MatrixProvider";
import { Point } from "@/domain/types/Point";
import { haversineDistance } from "../helper/haversineDistance";

const AVG_SPEED_KMH = 50;

export function HaversineMatrixProvider(): MatrixProvider {
  return {
    async getMatrix(points: Point[]): Promise<number[][]> {
      return points.map((from) =>
        points.map((to) => {
          if (from.id === to.id) {
            return 0;
          }
          const distance = haversineDistance(from, to);

          const durationMinutes = (distance / AVG_SPEED_KMH) * 60;
          return Math.round(durationMinutes);
        }),
      );
    },
  };
}
