import { useMutation, useQueryClient } from "@tanstack/react-query";

async function optimizeRoute(routeId: string) {
  const response = await fetch(`/api/routes/${routeId}/optimize`, {
    method: "POST",
  });
  if (!response.ok) throw new Error("Failed to optimize route");
  return response.json();
}

export function useOptimize(routeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => optimizeRoute(routeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["solution", routeId] });
    },
  });
}
