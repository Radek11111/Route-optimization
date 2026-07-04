import {useQuery } from "@tanstack/react-query";

async function fetchSolution(routeId: string) {
  const response = await fetch(`/api/routes/${routeId}/solution`);
  if (!response.ok) throw new Error("Failed to fetch solution");
  const data = await response.json();
  return data.data;
}

export function useSolution(routeId: string) {
  return useQuery({
    queryKey: ["solution", routeId],
    queryFn: () => fetchSolution(routeId),
  });
}
