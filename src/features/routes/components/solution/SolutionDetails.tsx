"use client";

import { useSolution } from "../../api/useSolution";
import { ComparisonTable } from "./ComparisonTable";
import { ConstraintsPanel } from "./ConstraintsPanel";
import { VehicleTable } from "./VehicleTable";

type Props = { routeId: string };

export function SolutionDetails({ routeId }: Props) {
  const { data: solution } = useSolution(routeId);

  if (!solution) return null;
  return (
    <div className="grid grid-col-3 gap-6 p-6">
      <ComparisonTable solution={solution} />
      <VehicleTable solution={solution} />
      <ConstraintsPanel solution={solution} />
    </div>
  );
}
