import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ResourceNote from "@/models/ResourceNote";
import { requireSessionUser } from "@/app/api/_lib/phase12";
import {
  applyResourceNoteStaffScope,
  mapResourceNote,
  parseAccessPolicy,
  trimOptionalUrl,
} from "@/app/api/_lib/resourceNotes";
import {
  resolveParsedScope,
  resolveScopeLabels,
  scopeFieldsToDoc,
} from "@/app/api/_lib/resourceScope";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireSessionUser(["admin", "instructor"]);
    if (auth.error) return auth.error;

    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim();
    const subject = searchParams.get("subject")?.trim();
    const topic = searchParams.get("topic")?.trim();
    const isActive = searchParams.get("isActive");
    const page = Math.max(1, Number.parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(
      50,
      Math.max(1, Number.parseInt(searchParams.get("limit") || "20", 10)),
    );
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;

    const query: Record<string, unknown> = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
        { topic: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    if (subject) query.subject = { $regex: subject, $options: "i" };
    if (topic) query.topic = { $regex: topic, $options: "i" };
    if (isActive != null) query.isActive = isActive === "true";

    await applyResourceNoteStaffScope(query, auth.user.role, auth.user.id);

    const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder };
    const skip = (page - 1) * limit;

    const [rows, total] = await Promise.all([
      ResourceNote.find(query)
        .populate("uploadedBy", "fullName firstName lastName email")
        .populate("batchId", "name subject")
        .populate("batchClassId", "title")
        .populate("subjectModuleId", "title")
        .populate("subjectLessonId", "title")
        .populate("courseId", "title")
        .populate("chapterId", "title")
        .populate("lessonId", "title")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      ResourceNote.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        notes: rows.map((row) =>
          mapResourceNote(row as Record<string, unknown>, { canDownload: true }),
        ),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit) || 1,
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("List resource notes error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireSessionUser(["admin", "instructor"]);
    if (auth.error) return auth.error;

    await connectDB();
    const body = (await request.json()) as Record<string, unknown>;

    const title = typeof body.title === "string" ? body.title.trim() : "";
    const pdfUrl = trimOptionalUrl(body.pdfUrl);
    const scope = await resolveParsedScope(body);

    let subject = typeof body.subject === "string" ? body.subject.trim() : "";
    let topic = typeof body.topic === "string" ? body.topic.trim() : "";

    if (!scope) {
      return NextResponse.json(
        {
          success: false,
          error: "Scope (batch or course hierarchy) is required",
        },
        { status: 400 },
      );
    }

    const labels = await resolveScopeLabels(scope);
    subject = labels.subject;
    topic = labels.topic;

    if (!title || !subject || !topic || !pdfUrl) {
      return NextResponse.json(
        { success: false, error: "Title and PDF are required" },
        { status: 400 },
      );
    }

    const accessPolicy = parseAccessPolicy(body.accessPolicy) ?? "public";
    const isActive = typeof body.isActive === "boolean" ? body.isActive : true;

    const note = await ResourceNote.create({
      title,
      subject,
      topic,
      pdfUrl,
      pdfPublicId: trimOptionalUrl(body.pdfPublicId),
      description:
        typeof body.description === "string"
          ? body.description.trim() || undefined
          : undefined,
      isActive,
      accessPolicy,
      uploadedBy: auth.user.id,
      ...scopeFieldsToDoc(scope),
    });

    const created = await ResourceNote.findById(note._id)
      .populate("uploadedBy", "fullName firstName lastName email")
      .populate("batchId", "name subject")
      .populate("batchClassId", "title")
      .populate("subjectModuleId", "title")
      .populate("subjectLessonId", "title")
      .populate("courseId", "title")
      .populate("chapterId", "title")
      .populate("lessonId", "title")
      .lean();

    return NextResponse.json(
      {
        success: true,
        data: {
          note: mapResourceNote(created as Record<string, unknown>, {
            canDownload: true,
          }),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create resource note error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
