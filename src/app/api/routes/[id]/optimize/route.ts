import { createMatrixProvider } from "@/domain/matrix/factory/createMatrixProvider";
import { runOptimizationService } from "@/modules/routes/services/run-optimatization.service";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  },
) {
  try {
    const { id } = await params;

    const matrixProvider = createMatrixProvider();

    const solution = await runOptimizationService(id, matrixProvider);
    return NextResponse.json({
      success: true,
      data: solution,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 400,
      },
    );
  }
}
