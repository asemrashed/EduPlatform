import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ResourceWorksheet from "@/models/ResourceWorksheet";
import { requireSessionUser } from "@/app/api/_lib/phase12";
import {
  resolveParsedScope,
  resolveScopeLabels,
  scopeFieldsToDoc,
} from "@/app/api/_lib/resourceScope";
import {
  applyResourceWorksheetStaffScope,
  mapResourceWorksheet,
  parseAccessPolicy,
  trimOptionalUrl,
} from "@/app/api/_lib/resourceWorksheets";

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

export async function GET(request: NextRequest) {
  try {
    const auth = await requireSessionUser(["admin", "instructor"]);
    if (auth.error) return auth.error;

    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim();
    const page = Math.max(1, Number.parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(
      50,
      Math.max(1, Number.parseInt(searchParams.get("limit") || "20", 10)),
    );
    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;

    const query: Record<string, unknown> = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
        { topic: { $regex: search, $options: "i" } },
      ];
    }

    await applyResourceWorksheetStaffScope(query, auth.user.role, auth.user.id);

    const skip = (page - 1) * limit;
    const [rows, total] = await Promise.all([
      ResourceWorksheet.find(query)
        .populate(populateScope)
        .sort({ createdAt: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      ResourceWorksheet.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        worksheets: rows.map((row) =>
          mapResourceWorksheet(row as Record<string, unknown>, { canDownload: true }),
        ),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit) || 1,
        },
      },
    });
  } catch (error) {
    console.error("List resource worksheets error:", error);
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

    if (!scope) {
      return NextResponse.json(
        { success: false, error: "Scope (batch or course hierarchy) is required" },
        { status: 400 },
      );
    }

    const labels = await resolveScopeLabels(scope);
    if (!title || !pdfUrl) {
      return NextResponse.json(
        { success: false, error: "Title and PDF are required" },
        { status: 400 },
      );
    }

    const accessPolicy = parseAccessPolicy(body.accessPolicy) ?? "public";
    const isActive = typeof body.isActive === "boolean" ? body.isActive : true;

    const row = await ResourceWorksheet.create({
      title,
      subject: labels.subject,
      topic: labels.topic,
      pdfUrl,
      pdfPublicId: trimOptionalUrl(body.pdfPublicId),
      description:
        typeof body.description === "string"
          ? body.description.trim() || undefined
          : undefined,
      isActive,
      accessPolicy,
      uploadedBy: auth.user.id,
      sourceType: "upload",
      ...scopeFieldsToDoc(scope),
    });

    const created = await ResourceWorksheet.findById(row._id)
      .populate(populateScope)
      .lean();

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
    console.error("Create resource worksheet error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
