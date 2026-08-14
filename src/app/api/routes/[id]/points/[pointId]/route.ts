import { deletePoint, getPointWithRoute } from "@/modules/points/repositories/point-repository";
import { errorResponse, successResponse } from "@/shared/utils/api-response";
import { auth } from "@clerk/nextjs/server";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; pointId: string }> },
) {
  try {
     const { userId } = await auth();
     if (!userId) return errorResponse("Unauthorized", 401);

    const { pointId } = await params;

     const point = await getPointWithRoute(pointId);
     if (!point || point.route.userId !== userId) {
       return errorResponse("Point not found", 404);
     }

    const deletedPoint = await deletePoint(pointId);
    return successResponse(deletedPoint, 200);
  } catch (error) {
    console.error("Error deleting point", error);
    return errorResponse("Failed to delete point", 500);
  }
}
