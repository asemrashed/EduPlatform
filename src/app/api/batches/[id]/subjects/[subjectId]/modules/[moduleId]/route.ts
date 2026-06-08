import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import SubjectModule from "@/models/SubjectModule";
import SubjectLesson from "@/models/SubjectLesson";
import { requireSubjectCurriculumManage } from "@/app/api/_lib/batchAccess";
import { mapSubjectModule } from "@/app/api/_lib/mapSubjectCurriculum";
import { requireModuleInSubject } from "@/app/api/_lib/subjectAccess";
import { requireSessionUser, toObjectId } from "@/app/api/_lib/phase12";

type RouteContext = {
  params: Promise<{ id: string; subjectId: string; moduleId: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    await connectDB();
    const auth = await requireSessionUser(["admin", "instructor"]);
    if (auth.error) return auth.error;

    const { id: batchId, subjectId, moduleId } = await context.params;
    const access = await requireSubjectCurriculumManage(batchId, subjectId, auth.user);
    if (access.error) return access.error;

    const resolved = await requireModuleInSubject(batchId, subjectId, moduleId);
    if (resolved.error) return resolved.error;

    const body = (await request.json()) as Record<string, unknown>;
    const updates: Record<string, unknown> = {};

    if (typeof body.title === "string") updates.title = body.title.trim();
    if (typeof body.description === "string") {
      updates.description = body.description.trim() || undefined;
    }
    if (typeof body.order === "number" && body.order > 0) updates.order = body.order;
    if (typeof body.isPublished === "boolean") updates.isPublished = body.isPublished;

    const row = await SubjectModule.findOneAndUpdate(
      { _id: toObjectId(moduleId), batchId: toObjectId(batchId), subjectId: toObjectId(subjectId) },
      { $set: updates },
      { new: true },
    ).lean();

    return NextResponse.json({
      success: true,
      data: { module: mapSubjectModule(row as Record<string, unknown>) },
    });
  } catch (error) {
    console.error("PATCH subject module", error);
    return NextResponse.json(
      { success: false, error: "Failed to update module" },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    await connectDB();
    const auth = await requireSessionUser(["admin", "instructor"]);
    if (auth.error) return auth.error;

    const { id: batchId, subjectId, moduleId } = await context.params;
    const access = await requireSubjectCurriculumManage(batchId, subjectId, auth.user);
    if (access.error) return access.error;

    const resolved = await requireModuleInSubject(batchId, subjectId, moduleId);
    if (resolved.error) return resolved.error;

    await SubjectLesson.deleteMany({
      batchId: toObjectId(batchId),
      subjectId: toObjectId(subjectId),
      moduleId: toObjectId(moduleId),
    });

    await SubjectModule.deleteOne({
      _id: toObjectId(moduleId),
      batchId: toObjectId(batchId),
      subjectId: toObjectId(subjectId),
    });

    return NextResponse.json({ success: true, data: { deleted: true } });
  } catch (error) {
    console.error("DELETE subject module", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete module" },
      { status: 500 },
    );
  }
}
