import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import SubjectLesson from "@/models/SubjectLesson";
import { requireBatchManageAccess } from "@/app/api/_lib/batchAccess";
import { mapSubjectLesson } from "@/app/api/_lib/mapSubjectCurriculum";
import { requireSubjectInBatch } from "@/app/api/_lib/subjectAccess";
import { extractYoutubeVideoId } from "@/lib/youtube";
import { isObjectId, requireSessionUser, toObjectId } from "@/app/api/_lib/phase12";

type RouteContext = {
  params: Promise<{ id: string; subjectId: string; lessonId: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    await connectDB();
    const auth = await requireSessionUser(["admin", "instructor"]);
    if (auth.error) return auth.error;

    const { id: batchId, subjectId, lessonId } = await context.params;
    const access = await requireBatchManageAccess(batchId, auth.user);
    if (access.error) return access.error;

    const subjectResolved = await requireSubjectInBatch(batchId, subjectId);
    if (subjectResolved.error) return subjectResolved.error;

    if (!isObjectId(lessonId)) {
      return NextResponse.json(
        { success: false, error: "Invalid lesson id" },
        { status: 400 },
      );
    }

    const body = (await request.json()) as Record<string, unknown>;
    const updates: Record<string, unknown> = {};

    if (typeof body.title === "string") updates.title = body.title.trim();
    if (typeof body.description === "string") {
      updates.description = body.description.trim() || undefined;
    }
    if (typeof body.order === "number" && body.order > 0) updates.order = body.order;
    if (typeof body.isPublished === "boolean") updates.isPublished = body.isPublished;

    if (body.type === "live" || body.type === "recorded") {
      updates.type = body.type;
    }

    if (typeof body.scheduledAt === "string") {
      if (!body.scheduledAt.trim()) {
        updates.scheduledAt = undefined;
      } else {
        const d = new Date(body.scheduledAt);
        if (Number.isNaN(d.getTime())) {
          return NextResponse.json(
            { success: false, error: "Invalid scheduledAt" },
            { status: 400 },
          );
        }
        updates.scheduledAt = d;
      }
    }

    if (body.durationMinutes !== undefined) {
      updates.durationMinutes =
        body.durationMinutes != null
          ? Math.max(1, Number(body.durationMinutes))
          : undefined;
    }

    if (typeof body.meetLink === "string") {
      updates.meetLink = body.meetLink.trim() || undefined;
    }
    if (typeof body.recordingUrl === "string") {
      updates.recordingUrl = body.recordingUrl.trim() || undefined;
    }
    if (typeof body.videoUrl === "string") {
      updates.videoUrl = body.videoUrl.trim() || undefined;
    }
    if (typeof body.youtubeVideoId === "string") {
      updates.youtubeVideoId =
        extractYoutubeVideoId(body.youtubeVideoId) || undefined;
    }

    const row = await SubjectLesson.findOneAndUpdate(
      {
        _id: toObjectId(lessonId),
        batchId: toObjectId(batchId),
        subjectId: toObjectId(subjectId),
      },
      { $set: updates },
      { new: true },
    ).lean();

    if (!row) {
      return NextResponse.json(
        { success: false, error: "Lesson not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: { lesson: mapSubjectLesson(row as Record<string, unknown>) },
    });
  } catch (error) {
    console.error("PATCH subject lesson", error);
    return NextResponse.json(
      { success: false, error: "Failed to update lesson" },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    await connectDB();
    const auth = await requireSessionUser(["admin", "instructor"]);
    if (auth.error) return auth.error;

    const { id: batchId, subjectId, lessonId } = await context.params;
    const access = await requireBatchManageAccess(batchId, auth.user);
    if (access.error) return access.error;

    const subjectResolved = await requireSubjectInBatch(batchId, subjectId);
    if (subjectResolved.error) return subjectResolved.error;

    const result = await SubjectLesson.deleteOne({
      _id: toObjectId(lessonId),
      batchId: toObjectId(batchId),
      subjectId: toObjectId(subjectId),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Lesson not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: { deleted: true } });
  } catch (error) {
    console.error("DELETE subject lesson", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete lesson" },
      { status: 500 },
    );
  }
}
