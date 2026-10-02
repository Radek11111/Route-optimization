import prisma from "@/lib/prisma";
import { errorResponse, successResponse } from "@/shared/utils/api-response";
import { requireRouteOwner } from "@/shared/utils/require-route-owner";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const auth = await requireRouteOwner(id);
    if (!auth.ok) return auth.response;

    const solution = await prisma.solution.findFirst({
      where: {
        routeId: id,
      },
      orderBy: { createdAt: "desc" },
      include: {
        vehicleRoutes: {
          include: {
            stops: {
              orderBy: { order: "asc" },
              include: {
                point: true,
              },
            },
          },
        },
        unassignedPoints: {
          include: {
            point: true,
          },
        },
      },
    });

    if (!solution) {
      return errorResponse("No solution found for this route.", 404);
    }
    return successResponse(solution, 200);
  } catch (error) {
    console.error("Error fetching solution:", error);
    return errorResponse("Failed to fetch solution", 500);
  }
}
