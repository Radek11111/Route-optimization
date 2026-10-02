import { useMutation, useQueryClient } from "@tanstack/react-query";

async function setDepot(routeId: string, pointId: string) {
  const response = await fetch(`/api/routes/${routeId}/depot`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pointId }),
  });
  if (!response.ok) throw new Error("Failed to set depot");
  return response.json();
}

export function useSetDepot(routeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (pointId: string) => setDepot(routeId, pointId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["routes", routeId] });
    },
  });
}
