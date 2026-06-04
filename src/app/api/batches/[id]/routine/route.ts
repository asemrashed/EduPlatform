import { NextRequest, NextResponse } from "next/server";
import { buildWeeklyRoutine, mapBatch, requireBatchViewAccess } from "@/app/api/_lib/batchAccess";
import { requireSessionUser } from "@/app/api/_lib/phase12";

type RouteContext = { params: Promise<{ id: string }> };

/** GET /api/batches/[id]/routine — weekly grid from Batch.schedule */
export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const auth = await requireSessionUser(["admin", "instructor", "student"]);
    if (auth.error) return auth.error;

    const { id } = await context.params;
    const access = await requireBatchViewAccess(id, auth.user);
    if (access.error) return access.error;

    const schedule = Array.isArray(access.batch!.schedule) ? access.batch!.schedule : [];

    return NextResponse.json({
      success: true,
      data: {
        batchId: id,
        batchName: access.batch!.name,
        schedule,
        weekly: buildWeeklyRoutine(schedule),
        batch: mapBatch(access.batch as Record<string, unknown>),
      },
    });
  } catch (error) {
    console.error("GET /api/batches/[id]/routine", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch routine" },
      { status: 500 },
    );
  }
}
