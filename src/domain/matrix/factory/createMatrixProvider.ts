import { HaversineMatrixProvider } from "../providers/HaversineMatrixProvider";
import { OsrmMatrixProvider } from "../providers/osrmMatrixProvider";

export function createMatrixProvider() {
  const provider = process.env.MATRIX_PROVIDER;

  switch (provider) {
    case "osrm":
      return OsrmMatrixProvider(process.env.OSRM_URL!);
    default:
      return HaversineMatrixProvider();
  }
}
