import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Assignment from "@/models/Assignment";
import AssignmentSubmission from "@/models/AssignmentSubmission";
import Course from "@/models/Course";
import Enrollment from "@/models/Enrollment";
import { isObjectId, requireSessionUser, toObjectId } from "@/app/api/_lib/phase12";

interface RouteCtx {
  params: Promise<{ id: string }>;
}

function computeAssignmentStatus(input: {
  isPublished?: boolean;
  isActive?: boolean;
  startDate?: Date | string;
  dueDate?: Date | string;
}) {
  if (!input.isPublished) return "draft";
  if (!input.isActive) return "inactive";
  const now = Date.now();
  if (input.startDate && new Date(input.startDate).getTime() > now) return "scheduled";
  if (input.dueDate && new Date(input.dueDate).getTime() < now) return "expired";
  return "active";
}

async function loadAssignmentForUser(id: string, userId: string, role: string) {
  const filter: Record<string, unknown> = { _id: id };
  if (role === "instructor") {
    const courses = await Course.find({
      $or: [{ instructor: toObjectId(userId) }, { createdBy: toObjectId(userId) }],
    })
      .select("_id")
      .lean();
    filter.course = { $in: courses.map((c) => c._id) };
  }
  return Assignment.findOne(filter);
}

export async function GET(_request: NextRequest, ctx: RouteCtx) {
  try {
    const auth = await requireSessionUser(["admin", "instructor", "student"]);
    if (auth.error) return auth.error;
    const { id } = await ctx.params;
    if (!isObjectId(id)) return NextResponse.json({ success: false, error: "Invalid id" }, { status: 400 });

    const assignment = await Assignment.findById(id)
      .populate("course", "title")
      .populate("createdBy", "name email")
      .lean();
    if (!assignment) return NextResponse.json({ success: false, error: "Assignment not found" }, { status: 404 });

    if (auth.user.role === "student") {
      const allowed = await Enrollment.exists({
        student: auth.user.id,
        course: assignment.course?._id || assignment.course,
        status: { $in: ["enrolled", "in_progress", "completed"] },
      });
      if (!allowed) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }
    if (auth.user.role === "instructor") {
      const allowedCourse = await Course.exists({
        _id: assignment.course?._id || assignment.course,
        $or: [{ instructor: auth.user.id }, { createdBy: auth.user.id }],
      });
      if (!allowedCourse) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: { assignment } });
  } catch (error) {
    console.error("Assignment by id GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch assignment" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, ctx: RouteCtx) {
  try {
    const auth = await requireSessionUser(["admin", "instructor"]);
    if (auth.error) return auth.error;
    const { id } = await ctx.params;
    if (!isObjectId(id)) return NextResponse.json({ success: false, error: "Invalid id" }, { status: 400 });

    const assignment = await loadAssignmentForUser(id, auth.user.id, auth.user.role);
    if (!assignment) return NextResponse.json({ success: false, error: "Assignment not found" }, { status: 404 });
    const body = (await request.json()) as Record<string, unknown>;

    const fields = [
      "title",
      "description",
      "instructions",
      "type",
      "course",
      "chapter",
      "lesson",
      "totalMarks",
      "passingMarks",
      "dueDate",
      "startDate",
      "isActive",
      "isPublished",
      "allowLateSubmission",
      "latePenaltyPercentage",
      "maxAttempts",
      "allowedFileTypes",
      "maxFileSize",
      "attachments",
      "rubric",
      "isGroupAssignment",
      "maxGroupSize",
      "autoGrade",
      "timeLimit",
      "showCorrectAnswers",
      "allowReview",
      "status",
    ] as const;
    for (const field of fields) {
      if (field in body) (assignment as any)[field] = body[field];
    }
    if (
      typeof assignment.totalMarks === "number" &&
      typeof assignment.passingMarks === "number" &&
      assignment.passingMarks > assignment.totalMarks
    ) {
      return NextResponse.json(
        { success: false, error: "passingMarks cannot be greater than totalMarks" },
        { status: 400 },
      );
    }
    if (!("status" in body)) {
      assignment.status = computeAssignmentStatus({
        isActive: assignment.isActive,
        isPublished: assignment.isPublished,
        startDate: assignment.startDate,
        dueDate: assignment.dueDate,
      }) as any;
    }
    await assignment.save();
    return NextResponse.json({ success: true, data: assignment.toObject() });
  } catch (error) {
    console.error("Assignment by id PUT error:", error);
    return NextResponse.json({ success: false, error: "Failed to update assignment" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, ctx: RouteCtx) {
  try {
    const auth = await requireSessionUser(["admin", "instructor"]);
    if (auth.error) return auth.error;
    const { id } = await ctx.params;
    if (!isObjectId(id)) return NextResponse.json({ success: false, error: "Invalid id" }, { status: 400 });

    const assignment = await loadAssignmentForUser(id, auth.user.id, auth.user.role);
    if (!assignment) return NextResponse.json({ success: false, error: "Assignment not found" }, { status: 404 });
    await AssignmentSubmission.deleteMany({ assignment: assignment._id });
    await Assignment.deleteOne({ _id: assignment._id });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Assignment by id DELETE error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete assignment" }, { status: 500 });
  }
}
