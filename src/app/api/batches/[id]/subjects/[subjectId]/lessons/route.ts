import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import SubjectLesson from "@/models/SubjectLesson";
import { requireSubjectCurriculumManage } from "@/app/api/_lib/batchAccess";
import { mapSubjectLesson } from "@/app/api/_lib/mapSubjectCurriculum";
import { requireModuleInSubject } from "@/app/api/_lib/subjectAccess";
import { extractYoutubeVideoId } from "@/lib/youtube";
import { isObjectId, requireSessionUser, toObjectId } from "@/app/api/_lib/phase12";

type RouteContext = { params: Promise<{ id: string; subjectId: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    await connectDB();
    const auth = await requireSessionUser(["admin", "instructor"]);
    if (auth.error) return auth.error;

    const { id: batchId, subjectId } = await context.params;
    const access = await requireSubjectCurriculumManage(batchId, subjectId, auth.user);
    if (access.error) return access.error;

    const body = (await request.json()) as Record<string, unknown>;
    const moduleId = typeof body.moduleId === "string" ? body.moduleId : "";
    if (!isObjectId(moduleId)) {
      return NextResponse.json(
        { success: false, error: "Valid moduleId is required" },
        { status: 400 },
      );
    }

    const moduleResolved = await requireModuleInSubject(batchId, subjectId, moduleId);
    if (moduleResolved.error) return moduleResolved.error;

    const title = typeof body.title === "string" ? body.title.trim() : "";
    if (!title) {
      return NextResponse.json(
        { success: false, error: "title is required" },
        { status: 400 },
      );
    }

    const type =
      auth.user.role === "admin" && body.type === "live" ? "live" : "recorded";
    const count = await SubjectLesson.countDocuments({
      batchId: toObjectId(batchId),
      moduleId: toObjectId(moduleId),
    });

    let scheduledAt: Date | undefined;
    if (
      auth.user.role === "admin" &&
      typeof body.scheduledAt === "string" &&
      body.scheduledAt.trim()
    ) {
      scheduledAt = new Date(body.scheduledAt);
      if (Number.isNaN(scheduledAt.getTime())) {
        return NextResponse.json(
          { success: false, error: "Invalid scheduledAt" },
          { status: 400 },
        );
      }
    }

    const youtubeInput =
      typeof body.youtubeVideoId === "string"
        ? body.youtubeVideoId
        : typeof body.videoUrl === "string"
          ? body.videoUrl
          : "";
    const youtubeVideoId = extractYoutubeVideoId(youtubeInput);

    const row = await SubjectLesson.create({
      batchId: toObjectId(batchId),
      subjectId: toObjectId(subjectId),
      moduleId: toObjectId(moduleId),
      title,
      description:
        typeof body.description === "string" ? body.description.trim() : undefined,
      order:
        typeof body.order === "number" && body.order > 0 ? body.order : count + 1,
      type,
      scheduledAt: type === "live" ? scheduledAt : undefined,
      durationMinutes:
        auth.user.role === "admin" &&
        type === "live" &&
        body.durationMinutes != null
          ? Math.max(1, Number(body.durationMinutes))
          : undefined,
      meetLink:
        auth.user.role === "admin" && typeof body.meetLink === "string"
          ? body.meetLink.trim() || undefined
          : undefined,
      recordingUrl:
        typeof body.recordingUrl === "string"
          ? body.recordingUrl.trim() || undefined
          : undefined,
      videoUrl:
        typeof body.videoUrl === "string" ? body.videoUrl.trim() || undefined : undefined,
      youtubeVideoId: youtubeVideoId || undefined,
      isPublished: body.isPublished !== false,
    });

    return NextResponse.json(
      {
        success: true,
        data: { lesson: mapSubjectLesson(row.toObject() as Record<string, unknown>) },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST subject lesson", error);
    return NextResponse.json(
      { success: false, error: "Failed to create lesson" },
      { status: 500 },
    );
  }
}
