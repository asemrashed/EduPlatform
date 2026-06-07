import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ResourceNote from "@/models/ResourceNote";
import { requireSessionUser } from "@/app/api/_lib/phase12";
import {
  assertResourceNoteStaffAccess,
  mapResourceNote,
  pickResourceNoteUpdate,
} from "@/app/api/_lib/resourceNotes";
import { applyScopeLabelsToUpdate } from "@/app/api/_lib/resourceWorksheets";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await requireSessionUser(["admin", "instructor"]);
    if (auth.error) return auth.error;

    await connectDB();
    const { id } = await params;
    const access = await assertResourceNoteStaffAccess(id, auth.user);
    if (access.error) {
      return NextResponse.json(
        { success: false, error: access.error },
        { status: access.status ?? 403 },
      );
    }

    const note = await ResourceNote.findById(id)
      .populate("uploadedBy", "fullName firstName lastName email")
      .populate("batchId", "name subject")
      .populate("batchClassId", "title")
      .populate("subjectModuleId", "title")
      .populate("subjectLessonId", "title")
      .populate("courseId", "title")
      .populate("chapterId", "title")
      .populate("lessonId", "title")
      .lean();

    return NextResponse.json({
      success: true,
      data: {
        note: mapResourceNote(note as Record<string, unknown>, { canDownload: true }),
      },
    });
  } catch (error) {
    console.error("Get resource note error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await requireSessionUser(["admin", "instructor"]);
    if (auth.error) return auth.error;

    await connectDB();
    const { id } = await params;
    const access = await assertResourceNoteStaffAccess(id, auth.user);
    if (access.error) {
      return NextResponse.json(
        { success: false, error: access.error },
        { status: access.status ?? 403 },
      );
    }

    const body = (await request.json()) as Record<string, unknown>;
    const update = await pickResourceNoteUpdate(body);
    await applyScopeLabelsToUpdate(body, update);
    if (Object.keys(update).length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid fields to update" },
        { status: 400 },
      );
    }

    const updated = await ResourceNote.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    })
      .populate("uploadedBy", "fullName firstName lastName email")
      .populate("batchId", "name subject")
      .populate("batchClassId", "title")
      .populate("subjectModuleId", "title")
      .populate("subjectLessonId", "title")
      .populate("courseId", "title")
      .populate("chapterId", "title")
      .populate("lessonId", "title")
      .lean();

    return NextResponse.json({
      success: true,
      data: {
        note: mapResourceNote(updated as Record<string, unknown>, {
          canDownload: true,
        }),
      },
    });
  } catch (error) {
    console.error("Update resource note error:", error);
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
    const access = await assertResourceNoteStaffAccess(id, auth.user);
    if (access.error) {
      return NextResponse.json(
        { success: false, error: access.error },
        { status: access.status ?? 403 },
      );
    }

    await ResourceNote.findByIdAndUpdate(id, { isActive: false });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete resource note error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
