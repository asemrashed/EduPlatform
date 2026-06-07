import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ResourceWorksheet from "@/models/ResourceWorksheet";
import { requireSessionUser } from "@/app/api/_lib/phase12";
import {
  applyScopeLabelsToUpdate,
  assertResourceWorksheetStaffAccess,
  mapResourceWorksheet,
  pickResourceWorksheetUpdate,
} from "@/app/api/_lib/resourceWorksheets";

interface RouteParams {
  params: Promise<{ id: string }>;
}

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

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await requireSessionUser(["admin", "instructor"]);
    if (auth.error) return auth.error;

    await connectDB();
    const { id } = await params;
    const access = await assertResourceWorksheetStaffAccess(id, auth.user);
    if (access.error) {
      return NextResponse.json(
        { success: false, error: access.error },
        { status: access.status ?? 403 },
      );
    }

    const body = (await request.json()) as Record<string, unknown>;
    const update = await pickResourceWorksheetUpdate(body);
    await applyScopeLabelsToUpdate(body, update);

    if (Object.keys(update).length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid fields to update" },
        { status: 400 },
      );
    }

    const updated = await ResourceWorksheet.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    })
      .populate(populateScope)
      .lean();

    return NextResponse.json({
      success: true,
      data: {
        worksheet: mapResourceWorksheet(updated as Record<string, unknown>, {
          canDownload: true,
        }),
      },
    });
  } catch (error) {
    console.error("Update resource worksheet error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await requireSessionUser(["admin", "instructor"]);
    if (auth.error) return auth.error;

    await connectDB();
    const { id } = await params;
    const access = await assertResourceWorksheetStaffAccess(id, auth.user);
    if (access.error) {
      return NextResponse.json(
        { success: false, error: access.error },
        { status: access.status ?? 403 },
      );
    }

    await ResourceWorksheet.findByIdAndUpdate(id, { isActive: false });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete resource worksheet error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
