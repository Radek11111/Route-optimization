import {
  getRouteById,
  updateRoute,
} from "@/modules/routes/repositories/route-repository";
import { errorResponse, successResponse } from "@/shared/utils/api-response";
import { auth } from "@clerk/nextjs/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await auth();
    if (!userId) return errorResponse("Unauthorized", 401);

    const { id } = await params;
    const route = await getRouteById(id);

    if (!route) return errorResponse("Route not found", 404);
    if (route.userId !== userId)
      return errorResponse("Unauthorized access", 404);

    return successResponse(route, 200);
  } catch (error) {
    console.error("Route fetch error:", error);
    return errorResponse("Failed to fetch route", 500);
  }
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
    const updatedRoute = await updateRoute(id, body);
    
    return successResponse(updatedRoute, 200);
  } catch (error) {
    console.error("Route update error:", error);
    return errorResponse("Failed to update route", 500);
  }
}
