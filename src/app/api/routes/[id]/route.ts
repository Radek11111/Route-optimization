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
  const result = await requireRouteOwner(id);
  if (result.response) return result.response;

  return successResponse(result.route, 200);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await auth();
    if(!userId) return errorResponse("Unauthorized", 401);

    const { id } = await params;
    const existingRoute = await getRouteById(id);

    if(!existingRoute) return errorResponse("Route not found", 404);
    if (existingRoute.userId !== userId) return errorResponse("Unauthorized access", 404);

    const body = await request.json();
    const parsed = updateRouteSchema.parse(body);
    const updatedRoute = await updateRoute(id, parsed);
    
    return successResponse(updatedRoute, 200);
  } catch (error) {
    console.error("Route update error:", error);
    return errorResponse("Failed to update route", 500);
  }
}
