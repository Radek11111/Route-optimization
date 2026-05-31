import { createPointSchema } from "@/modules/points/schemas/create-point.schema";
import { createPointService } from "@/modules/routes/services/create-point.service";
import { errorResponse, successResponse } from "@/shared/utils/api-response";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const body = await request.json();

    const parsed = createPointSchema.parse(body);

    const { id } = await params;

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
