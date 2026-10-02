import { useMutation, useQueryClient } from "@tanstack/react-query";

async function deletePoint(routeId: string, pointId: string) {
  const response = await fetch(`/api/routes/${routeId}/points/${pointId}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete point");
  return response.json();
}
export function useDeletePoint(routeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (pointId: string) => deletePoint(routeId, pointId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["points", routeId] });
    },
  });
}
