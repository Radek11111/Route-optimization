import { MatrixProvider } from "@/domain/types/MatrixProvider";
import { Point } from "@/domain/types/Point";

type OsrmResponse = {
  code: string;
  durations: number[][];
  message?: string;
};

export function OsrmMatrixProvider(baseUrl: string): MatrixProvider {
  return {
    async getMatrix(points: Point[]): Promise<number[][]> {
      if (points.length < 2) {
        return [[0]];
      }

      const coordinates = points
        .map((point) => `${point.longitude},${point.latitude}`)
        .join(";");

      const url = `${baseUrl}/table/v1/driving/${coordinates}?annotations=duration`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(
          `OSRM request failed: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();

      if (data.code !== "Ok" || !data.durations) {
        throw new Error(
          `OSRM error: ${data.code} — ${data.message ?? "unknown"}`,
        );
      }

      return data.durations.map((row: number[]) =>
        row.map((seconds) => Math.round(seconds / 60)),
      );
    },
  };
}
