import {
  getRoutesByUserId,
  updateRoute,
} from "@/modules/routes/repositories/route-repository";
import { createRouteSchema } from "@/modules/routes/schemas/create-route.schema";
import { createRouteService } from "@/modules/routes/services/create-route.service";
import { errorResponse, successResponse } from "@/shared/utils/api-response";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await request.json();
    const parsed = createRouteSchema.parse(body);

    const route = await createRouteService({
      ...parsed,
      userId,
    });
    return successResponse(route, 200);
  } catch (error) {
    console.error("Error creating route:", error);

    return errorResponse("Failed to create route", 500);
  }
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return errorResponse("Unauthorized", 401);
    }

    const routes = await getRoutesByUserId(userId);

    return successResponse(routes, 200);
  } catch (error) {
    console.error("Error fetching routes:", error);

    return errorResponse("Failed to fetch routes", 400);
  }
}
