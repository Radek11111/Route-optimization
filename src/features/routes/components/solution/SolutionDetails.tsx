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
    <div className="grid grid-cols-[1fr_1.5fr_1fr] gap-6 p-6">
      <ComparisonTable solution={solution} />
      <VehicleTable solution={solution} />
      <ConstraintsPanel solution={solution} />
    </div>
  );
}
