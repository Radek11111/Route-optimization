import { useQuery } from "@tanstack/react-query";

async function fetchRoutes() {
  const response = await fetch("/api/routes");
  if (!response.ok) throw new Error("Failed to fetch routes");
  const data = await response.json();
  return data.data;
}

export function useRoutes() {
  return useQuery({
    queryKey: ["routes"],
    queryFn: fetchRoutes,
  });
}
