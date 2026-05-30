import { MatrixProvider } from "@/domain/types/MatrixProvider";
import { Point } from "@/domain/types/Point";

export function OsrmMatrixProvider(baseUrl: string): MatrixProvider {
  return {
    async getMatrix(points: Point[]): Promise<number[][]> {
      if (points.length < 2) {
        throw new Error(
          "At least two points are required to calculate a matrix.",
        );
      }

      const coordinates = points
        .map((point) => `${point.longitude}, ${point.latitude}`)
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
        row.map((seconds: number) => seconds / 60),
      );
    },
  };
}
