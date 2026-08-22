import { auth } from "@clerk/nextjs/server";
import { errorResponse } from "./api-response";
import { getRouteById } from "@/modules/routes/repositories/route-repository";

type RouteOwnerResult =
  | {
      ok: true;
      userId: string;
      route: NonNullable<Awaited<ReturnType<typeof getRouteById>>>;
    }
  | { ok: false; response: Response };

export async function requireRouteOwner(
  routeId: string,
): Promise<RouteOwnerResult> {
  const { userId } = await auth();

  if (!userId) {
    return { ok: false, response: errorResponse("Unauthorized", 401) };
  }

  const route = await getRouteById(routeId);
  if (!route || route.userId !== userId) {
    return { ok: false, response: errorResponse("Route not found", 404) };
  }
  return { ok: true, userId, route };
}

export async function requireAuth() {
  const { userId } = await auth();

  if (!userId) {
    return { ok: false as const, response: errorResponse("Unauthorized", 401) };
  }
  return { ok: true as const, userId };
}
