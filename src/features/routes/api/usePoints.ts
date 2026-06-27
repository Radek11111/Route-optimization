

import { Point } from "@/types/Point";
import { useQuery } from "@tanstack/react-query";

async function fetchPoints(routeId: string): Promise<Point[]> {
  const response = await fetch(`/api/routes/${routeId}/points`);
  if (!response.ok) throw new Error("Failed to fetch points");
  const data = await response.json();
  return data.data;
}

export function usePoints(routeId: string) {
  return useQuery({
    queryKey: ["points", routeId],
    queryFn: () => fetchPoints(routeId),
  });
}
