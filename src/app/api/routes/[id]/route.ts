import {
  getRouteById,
  updateRoute,
} from "@/modules/routes/repositories/route-repository";
import { updateRouteSchema } from "@/modules/routes/schemas/update-route-schema";
import { errorResponse, successResponse } from "@/shared/utils/api-response";
import { requireRouteOwner } from "@/shared/utils/require-route-owner";
import { auth } from "@clerk/nextjs/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const auth = await requireRouteOwner(id);
  if (!auth.ok) return auth.response;

  return successResponse(auth.route, 200);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const auth = await requireRouteOwner(id);

    if (!auth.ok) return auth.response;

    const body = await request.json();
    const parsed = updateRouteSchema.parse(body);

    const updatedRoute = await updateRoute(id, parsed);

    return successResponse(updatedRoute, 200);
  } catch (error) {
    console.error("Route update error:", error);
    return errorResponse("Failed to update route", 500);
  }
}
