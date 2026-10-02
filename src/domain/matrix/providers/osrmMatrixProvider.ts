import { MatrixProvider, MatrixResult } from "@/domain/types/MatrixProvider";
import { Point } from "@/domain/types/Point";

type OsrmResponse = {
  code: string;
  durations: number[][];
  distances: number[][];
  message?: string;
};

export function OsrmMatrixProvider(baseUrl: string): MatrixProvider {
  return {
    async getMatrix(points: Point[]): Promise<MatrixResult> {
      if (points.length < 2) {
        return { durationMatrix: [], distanceMatrix: [] };
      }

      const coordinates = points
        .map((point) => `${point.longitude},${point.latitude}`)
        .join(";");

      const url = `${baseUrl}/table/v1/driving/${coordinates}?annotations=duration,distance`;
     
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(
          `OSRM request failed: ${response.status} ${response.statusText}`,
        );
      }

      const data: OsrmResponse = await response.json();

      if (data.code !== "Ok" || !data.durations) {
        throw new Error(
          `OSRM error: ${data.code} — ${data.message ?? "missing durations/distances"}`,
        );
      }

      const durationMatrix = data.durations.map((row: number[]) =>
        row.map((seconds) => Math.round(seconds / 60)),
      );
      const distanceMatrix = data.distances;

      return { durationMatrix, distanceMatrix };
    },
  };
}
