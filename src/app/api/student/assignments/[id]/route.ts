import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Assignment from "@/models/Assignment";
import AssignmentSubmission from "@/models/AssignmentSubmission";
import Enrollment from "@/models/Enrollment";
import { isObjectId, requireSessionUser, toObjectId } from "@/app/api/_lib/phase12";

interface RouteCtx {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, ctx: RouteCtx) {
  try {
    const auth = await requireSessionUser(["student"]);
    if (auth.error) return auth.error;
    const { id } = await ctx.params;
    if (!isObjectId(id)) {
      return NextResponse.json({ success: false, error: "Invalid assignment id" }, { status: 400 });
    }

    const assignment = await Assignment.findById(id).populate("course", "title").lean();
    if (!assignment || !assignment.isActive || !assignment.isPublished) {
      return NextResponse.json({ success: false, error: "Assignment not found" }, { status: 404 });
    }
    const allowed = await Enrollment.exists({
      student: toObjectId(auth.user.id),
      course: assignment.course?._id || assignment.course,
      status: { $in: ["enrolled", "in_progress", "completed"] },
    });
    if (!allowed) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const latestSubmission = await AssignmentSubmission.findOne({
      assignment: new mongoose.Types.ObjectId(id),
      student: new mongoose.Types.ObjectId(auth.user.id),
    })
      .sort({ createdAt: -1 })
      .lean();
    const attemptsUsed = Number(latestSubmission?.attemptNumber || 0);
    const maxAttempts = Number((assignment as any).maxAttempts || 1);

    return NextResponse.json({
      success: true,
      data: {
        assignment,
        latestSubmission: latestSubmission || null,
        attemptsUsed,
        attemptsRemaining: Math.max(maxAttempts - attemptsUsed, 0),
        canSubmit: Math.max(maxAttempts - attemptsUsed, 0) > 0,
      },
    });
  } catch (error) {
    console.error("Student assignment detail GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch student assignment detail" },
      { status: 500 },
    );
  }
}
