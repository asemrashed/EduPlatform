import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ResourceWorksheet from "@/models/ResourceWorksheet";
import { requireSessionUser, toObjectId } from "@/app/api/_lib/phase12";
import {
  mapResourceWorksheet,
  parseAccessPolicy,
  trimOptionalUrl,
} from "@/app/api/_lib/resourceWorksheets";
import {
  resolveParsedScope,
  resolveScopeLabels,
  scopeFieldsToDoc,
} from "@/app/api/_lib/resourceScope";
import {
  assertStaffCanUseQuestions,
  generateWorksheetPdfFromQuestions,
} from "@/app/api/_lib/worksheetGenerate";

const populateScope = [
  { path: "uploadedBy", select: "fullName firstName lastName email" },
  { path: "batchId", select: "name subject" },
  { path: "batchClassId", select: "title" },
  { path: "subjectModuleId", select: "title" },
  { path: "subjectLessonId", select: "title" },
  { path: "courseId", select: "title" },
  { path: "chapterId", select: "title" },
  { path: "lessonId", select: "title" },
];

export async function POST(request: NextRequest) {
  try {
    const auth = await requireSessionUser(["admin", "instructor"]);
    if (auth.error) return auth.error;

    await connectDB();
    const body = (await request.json()) as Record<string, unknown>;

    const title = typeof body.title === "string" ? body.title.trim() : "";
    const scope = await resolveParsedScope(body);
    const rawIds = Array.isArray(body.questionIds) ? body.questionIds : [];
    const questionIds = rawIds
      .filter((id): id is string => typeof id === "string" && id.trim().length > 0)
      .map((id) => id.trim());
    const includeAnswers = body.includeAnswers === true;

    if (!scope) {
      return NextResponse.json(
        { success: false, error: "Scope (batch or course hierarchy) is required" },
        { status: 400 },
      );
    }

    if (!title) {
      return NextResponse.json(
        { success: false, error: "Title is required" },
        { status: 400 },
      );
    }

    const access = await assertStaffCanUseQuestions(
      auth.user.role,
      auth.user.id,
      questionIds,
    );
    if (access.error || !access.questions) {
      return NextResponse.json(
        { success: false, error: access.error || "Invalid questions" },
        { status: 400 },
      );
    }

    const labels = await resolveScopeLabels(scope);
    const stored = await generateWorksheetPdfFromQuestions({
      title,
      subtitle: labels.topic,
      questions: access.questions as Array<Record<string, unknown>>,
      includeAnswers,
    });

    const accessPolicy = parseAccessPolicy(body.accessPolicy) ?? "public";
    const isActive = typeof body.isActive === "boolean" ? body.isActive : true;

    const row = await ResourceWorksheet.create({
      title,
      subject: labels.subject,
      topic: labels.topic,
      pdfUrl: stored.url,
      pdfPublicId: stored.publicId,
      sourceType: "course_qb",
      questionIds: questionIds.map((id) => toObjectId(id)),
      description:
        typeof body.description === "string"
          ? body.description.trim() || undefined
          : undefined,
      isActive,
      accessPolicy,
      uploadedBy: auth.user.id,
      ...scopeFieldsToDoc(scope),
    });

    const created = await ResourceWorksheet.findById(row._id).populate(populateScope).lean();

    return NextResponse.json(
      {
        success: true,
        data: {
          worksheet: mapResourceWorksheet(created as Record<string, unknown>, {
            canDownload: true,
          }),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Generate resource worksheet error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate worksheet PDF" },
      { status: 500 },
    );
  }
}
