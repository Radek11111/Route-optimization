type Props = { solution: any };

function ConstraintRow({
  label,
  ok,
  detail,
}: {
  label: string;
  ok: boolean;
  detail: string;
}) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b last:border-0 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className={ok ? "text-green-600" : "text-red-500"}>
          {ok ? "✓" : "✗"}
        </span>
        <span className={ok ? "text-green-700" : "text-red-600"}>{detail}</span>
      </div>
    </div>
  );
}

export function ConstraintsPanel({ solution }: Props) {
  const allFeasible = solution.feasible;
  const unassigned = solution.unassignedPoints?.length ?? 0;
  const activeVehicles = solution.vehicleRoutes.filter(
    (vr: any) => vr.stops.length > 0,
  ).length;

  return (
    <div>
      <h3 className="text-sm font-semibold mb-3">3. Ograniczenia</h3>
      <ConstraintRow
        label="Czas pracy kierowcy"
        ok={allFeasible}
        detail={
          allFeasible ? "Wszystkie pojazdy w limicie" : "Przekroczono limit"
        }
      />
      <ConstraintRow
        label="Wykorzystanie pojazdów"
        ok={activeVehicles > 0}
        detail={`${activeVehicles}/${solution.vehicleRoutes.length} aktywnych`}
      />
      <ConstraintRow
        label="Punkty nieprzypisane"
        ok={unassigned === 0}
        detail={unassigned === 0 ? "0 punktów" : `${unassigned} punktów`}
      />
      <ConstraintRow
        label="Rozwiązanie"
        ok={allFeasible}
        detail={allFeasible ? "Rozwiązanie poprawne" : "Naruszenia ograniczeń"}
      />
    </div>
  );
}
