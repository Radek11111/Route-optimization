import { deletePoint } from "@/modules/points/repositories/point-repository";
import { errorResponse, successResponse } from "@/shared/utils/api-response";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; pointId: string }> },
) {
  try {
    const { pointId } = await params;
    const deletedPoint = await deletePoint(pointId);
    return successResponse(deletedPoint, 200);
  } catch (error) {
    console.error("Error deleting point", error);
    return errorResponse("Failed to delete point", 500);
  }
}
