import { NextRequest, NextResponse } from "next/server";
import Batch from "@/models/Batch";
import {
  countActivePaidEnrollmentsByBatchIds,
  mapBatch,
  requireBatchManageAccess,
  requireBatchViewAccess,
} from "@/app/api/_lib/batchAccess";
import { parseInstructorIdsInput } from "@/app/api/_lib/batchInstructors";
import { parseBatchMarketingBody } from "@/app/api/_lib/batchMarketing";
import { normalizeBatchGrade } from "@/lib/batchGrades";
import { requireSessionUser } from "@/app/api/_lib/phase12";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const auth = await requireSessionUser(["admin", "instructor", "student"]);
    if (auth.error) return auth.error;

    const { id } = await context.params;
    const access = await requireBatchViewAccess(id, auth.user);
    if (access.error) return access.error;

    const countMap = await countActivePaidEnrollmentsByBatchIds([
      access.batch._id,
    ]);
    const batchId = String(access.batch._id);

    return NextResponse.json({
      success: true,
      data: {
        batch: mapBatch(access.batch as Record<string, unknown>, {
          enrolledCount: countMap.get(batchId) ?? 0,
        }),
        canManage: access.canManage,
        canManageRoutine: access.canManageRoutine,
        assignedSubjectIds: access.assignedSubjectIds ?? [],
      },
    });
  } catch (error) {
    console.error("GET /api/batches/[id]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch batch" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const auth = await requireSessionUser(["admin"]);
    if (auth.error) return auth.error;

    const { id } = await context.params;
    const access = await requireBatchManageAccess(id, auth.user);
    if (access.error) return access.error;

    const body = (await request.json()) as Record<string, unknown>;
    const updates: Record<string, unknown> = {};

    if (typeof body.name === "string") updates.name = body.name.trim();
    if (typeof body.subject === "string") updates.subject = body.subject.trim();
    const marketing = parseBatchMarketingBody(body);
    if (typeof body.description === "string") updates.description = body.description.trim();
    if (typeof body.shortDescription === "string") {
      updates.shortDescription = body.shortDescription.trim();
    }
    if (typeof body.thumbnailUrl === "string") updates.thumbnailUrl = body.thumbnailUrl.trim();
    if (typeof body.videoUrl === "string") updates.videoUrl = body.videoUrl.trim();
    if (body.features !== undefined) updates.features = marketing.features;
    if (body.grade !== undefined) updates.grade = normalizeBatchGrade(body.grade);
    if (typeof body.isActive === "boolean") updates.isActive = body.isActive;
    if (Array.isArray(body.schedule)) updates.schedule = body.schedule;

    if (body.instructorIds !== undefined || body.instructorId !== undefined) {
      const instructorParse = await parseInstructorIdsInput(body, auth.user);
      if (instructorParse.error) {
        return NextResponse.json(
          { success: false, error: instructorParse.error },
          { status: 400 },
        );
      }
      updates.instructorIds = instructorParse.ids;
      updates.instructorId = instructorParse.ids[0] ?? undefined;
    }
    if (body.startDate) updates.startDate = new Date(String(body.startDate));
    if (body.endDate) updates.endDate = new Date(String(body.endDate));
    if (body.maxStudents !== undefined) updates.maxStudents = Number(body.maxStudents);
    if (body.fee !== undefined) updates.fee = Number(body.fee);

    const batch = await Batch.findByIdAndUpdate(id, { $set: updates }, { new: true }).lean();
    if (!batch) {
      return NextResponse.json(
        { success: false, error: "Batch not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: { batch: mapBatch(batch as Record<string, unknown>) },
    });
  } catch (error) {
    console.error("PATCH /api/batches/[id]", error);
    return NextResponse.json(
      { success: false, error: "Failed to update batch" },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const auth = await requireSessionUser(["admin"]);
    if (auth.error) return auth.error;

    const { id } = await context.params;
    const access = await requireBatchManageAccess(id, auth.user);
    if (access.error) return access.error;

    await Batch.findByIdAndUpdate(id, { $set: { isActive: false } });

    return NextResponse.json({ success: true, data: { deactivated: true } });
  } catch (error) {
    console.error("DELETE /api/batches/[id]", error);
    return NextResponse.json(
      { success: false, error: "Failed to deactivate batch" },
      { status: 500 },
    );
  }
}
