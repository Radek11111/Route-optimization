import { auth } from "@clerk/nextjs/server";
import { errorResponse } from "./api-response";
import { getRouteById } from "@/modules/routes/repositories/route-repository";

export async function requireRouteOwner(routeId: string) {
  const { userId } = await auth();

  if (!userId) {
    return { response: errorResponse("Unauthorized", 401) } as const;
  }

  const route = await getRouteById(routeId);
  if (!route || route.userId !== userId) {
    return { response: errorResponse("Route not found", 404) } as const;
  }
  return { userId, route } as const;
}
