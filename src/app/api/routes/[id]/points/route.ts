import {
  deletePoint,
  getPointsByRouteId,
} from "@/modules/points/repositories/point-repository";
import { createPointSchema } from "@/modules/points/schemas/create-point.schema";
import { getRouteById } from "@/modules/routes/repositories/route-repository";
import { createPointService } from "@/modules/routes/services/create-point.service";
import { errorResponse, successResponse } from "@/shared/utils/api-response";
import { requireRouteOwner } from "@/shared/utils/require-route-owner";
import { auth } from "@clerk/nextjs/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const auth = await requireRouteOwner(id);

    if (!auth.ok) return auth.response;

    const body = await request.json();
    const parsed = createPointSchema.parse(body);

    const point = await createPointService({
      ...parsed,
      routeId: id,
    });

    return successResponse(point, 200);
  } catch (error) {
    console.error("Error creating point:", error);
    return errorResponse("Failed to create point. ", 500);
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const auth = await requireRouteOwner(id);

    if (!auth.ok) return auth.response;

    const points = await getPointsByRouteId(id);
    return successResponse(points, 200);
  } catch (error) {
    console.error("Error fetching points", error);
    return errorResponse("Failed to fetch points", 500);
  }
}
