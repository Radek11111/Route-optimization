import prisma from "@/lib/prisma";
import { getRouteById } from "@/modules/routes/repositories/route-repository";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
      const { userId } = await auth();
      if (!userId) {
        return NextResponse.json(
          { success: false, message: "Unauthorized" },
          { status: 401 },
        );
      }

    const { id } = await params;

     const route = await getRouteById(id);
     if (!route || route.userId !== userId) {
       return NextResponse.json(
         { success: false, message: "Route not found" },
         { status: 404 },
       );
     }

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
      return NextResponse.json(
        { success: false, message: "No solution found for this route." },
        { status: 404 },
      );
    }
    return NextResponse.json({ success: true, data: solution });
  } catch (error) {
    console.error("Error fetching solution:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 500,
      },
    );
  }
}
