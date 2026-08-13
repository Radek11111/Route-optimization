import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

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
