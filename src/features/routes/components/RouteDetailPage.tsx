"use client";

import { useState } from "react";

import { PointForm } from "./PointForm";
import { PointsListClient } from "./PointsListClient";
import { SolutionPanel } from "./SolutionPanel";
import { useOptimize } from "../api/useOptimize";
import { RouteMapWrapper } from "./map/RouteMapWrapper";

type Mode = "EDIT" | "SOLUTION";

type Props = {
  routeId: string;
};

export function RouteDetailPage({ routeId }: Props) {
  const [mode, setMode] = useState<Mode>("EDIT");
  const { mutateAsync, isPending } = useOptimize(routeId);

  async function handleOptimize() {
    await mutateAsync(undefined);
    setMode("SOLUTION");
  }
  return (
    <div className="flex h-screen">
      {/* LEWY PANEL */}
      <div className="w-96 shrink-0 border-r overflow-y-auto flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <h1 className="font-semibold text-lg">Trasa</h1>
          <span className="text-xs text-muted-foreground px-2 py-1 rouded-full bg-mutated">
            {mode === "EDIT" ? "Edycja " : "Rozwiązanie"}
          </span>
        </div>
        {mode === "EDIT" ? (
          <div className="flex flex-col gap-6 p-4">
            <div className="">
              <h2 className="font-medium mb-3">Dodaj punkt</h2>
              <PointForm routeId={routeId} />
            </div>
            <div className="">
              <h2 className="font-medium mb-3">Punkty Trasy</h2>
              <PointsListClient routeId={routeId} />
            </div>
            <button
              onClick={handleOptimize}
              disabled={isPending}
              className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {isPending ? "Optymalizowanie..." : "Optymalizuj"}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4 p-4">
            <SolutionPanel routeId={routeId} />
            <button
              onClick={() => setMode("EDIT")}
              className="w-full rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Edytuj ponownie
            </button>
          </div>
        )}
      </div>

      {/* MAPA */}
      <div className="flex-1">
        <RouteMapWrapper routeId={routeId} mode={mode} />
      </div>
    </div>
  );
}
