import { getRouteById } from "@/modules/routes/repositories/route-repository";
import { errorResponse, successResponse } from "@/shared/utils/api-response";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const route = await getRouteById(id);
    if (!route) return errorResponse("Route not found", 404);
    return successResponse(route, 200);
  } catch (error) {
    console.error("Route fetch error:", error);
    return errorResponse("Failed to fetch route", 500);
  }
}
