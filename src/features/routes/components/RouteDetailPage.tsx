"use client";

import { useState } from "react";
import { useOptimize } from "../api/useOptimize";
import { RouteMapWrapper } from "./map/RouteMapWrapper";
import { SolutionStatsBar } from "./SolutionStatsBar";
import { useRoute } from "../api/useRoute";
import { ConfigurationTab } from "./tabs/ConfigurationTab";
import { PointsTab } from "./tabs/PointsTab";
import { SolutionTab } from "./tabs/SolutionTab";

type Tab = "CONFIGURATION" | "POINTS" | "SOLUTION";

type Props = {
  routeId: string;
};

export function RouteDetailPage({ routeId }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("POINTS");
  const { mutateAsync, isPending } = useOptimize(routeId);
  const { data: route } = useRoute(routeId);

  async function handleOptimize() {
    await mutateAsync(undefined);
    setActiveTab("SOLUTION");
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "CONFIGURATION", label: "Konfiguracja" },
    { key: "POINTS", label: "Punkty" },
    { key: "SOLUTION", label: "Rozwiązanie" },
  ];

  return (
    <div className="flex h-screen">
      <div className="w-80 shrink-0 border-r flex flex-col bg-background">
        <div className="px-4 py-3 border-b flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-primary">⇄</span>
            <h1 className="font-semibold text-sm truncate">
              {route?.name ?? "Ładowanie..."}
            </h1>
          </div>
          <button
            onClick={handleOptimize}
            disabled={isPending}
            className="shrink-0 inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-50"
          >
            {isPending ? "Generowanie..." : "Rozpocznij optymalizację ↗"}
          </button>
        </div>

        <div className="flex border-b">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2 text-xs font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

      
        <div className="flex-1 overflow-y-auto">
          {activeTab === "CONFIGURATION" && (
            <ConfigurationTab routeId={routeId} />
          )}
          {activeTab === "POINTS" && <PointsTab routeId={routeId} />}
          {activeTab === "SOLUTION" && <SolutionTab routeId={routeId} />}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex-1">
          <RouteMapWrapper
            routeId={routeId}
            mode={activeTab === "SOLUTION" ? "SOLUTION" : "EDIT"}
          />
        </div>
        <SolutionStatsBar routeId={routeId} />
      </div>
    </div>
  );
}
