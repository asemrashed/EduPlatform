import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Assignment from "@/models/Assignment";
import AssignmentSubmission from "@/models/AssignmentSubmission";
import Enrollment from "@/models/Enrollment";
import { isObjectId, requireSessionUser, toObjectId } from "@/app/api/_lib/phase12";

interface RouteCtx {
  params: Promise<{ id: string }>;
}

function parseSubmissionBody(body: Record<string, unknown>) {
  return {
    content: String(body.content || "").trim() || undefined,
    files: Array.isArray(body.files) ? body.files : [],
    answers: Array.isArray(body.answers) ? body.answers : [],
    timeSpent:
      typeof body.timeSpent === "number" && Number.isFinite(body.timeSpent) ? body.timeSpent : undefined,
  };
}

export async function POST(request: NextRequest, ctx: RouteCtx) {
  try {
    const auth = await requireSessionUser(["student"]);
    if (auth.error) return auth.error;
    const { id } = await ctx.params;
    if (!isObjectId(id)) return NextResponse.json({ success: false, error: "Invalid id" }, { status: 400 });

    const assignment = await Assignment.findById(id).lean();
    if (!assignment || !assignment.isActive || !assignment.isPublished) {
      return NextResponse.json({ success: false, error: "Assignment not found" }, { status: 404 });
    }
    const canAccess = await Enrollment.exists({
      student: toObjectId(auth.user.id),
      course: assignment.course,
      status: { $in: ["enrolled", "in_progress", "completed"] },
    });
    if (!canAccess) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });

    const body = (await request.json()) as Record<string, unknown>;
    const payload = parseSubmissionBody(body);
    if (!payload.content && payload.files.length === 0 && payload.answers.length === 0) {
      return NextResponse.json(
        { success: false, error: "Submission must include content, file, or answers" },
        { status: 400 },
      );
    }

    const attempts = await AssignmentSubmission.countDocuments({
      assignment: new mongoose.Types.ObjectId(id),
      student: new mongoose.Types.ObjectId(auth.user.id),
    });
    const latestSubmission = await AssignmentSubmission.findOne({
      assignment: new mongoose.Types.ObjectId(id),
      student: new mongoose.Types.ObjectId(auth.user.id),
    })
      .sort({ attemptNumber: -1 })
      .lean();
    const attemptNumber = attempts + 1;
    const maxAttempts = Number(assignment.maxAttempts || 1);
    if (attemptNumber > maxAttempts) {
      return NextResponse.json(
        {
          success: false,
          error: "Maximum assignment attempts exceeded",
          data: {
            attemptsUsed: attempts,
            maxAttempts,
            latestSubmission: latestSubmission || null,
          },
        },
        { status: 400 },
      );
    }

    const due = assignment.dueDate ? new Date(assignment.dueDate) : null;
    const isLate = Boolean(due && Date.now() > due.getTime());
    if (isLate && !assignment.allowLateSubmission) {
      return NextResponse.json({ success: false, error: "Late submission is not allowed" }, { status: 400 });
    }

    const submission = await AssignmentSubmission.create({
      assignment: new mongoose.Types.ObjectId(id),
      student: new mongoose.Types.ObjectId(auth.user.id),
      content: payload.content,
      files: payload.files,
      answers: payload.answers,
      status: "submitted",
      submittedAt: new Date(),
      maxScore: assignment.totalMarks,
      isLate,
      latePenaltyApplied: isLate ? Number(assignment.latePenaltyPercentage || 0) : 0,
      attemptNumber,
      timeSpent: payload.timeSpent,
    });

    return NextResponse.json({
      success: true,
      data: {
        submission: submission.toObject(),
        attemptNumber,
        attemptsRemaining: Math.max(maxAttempts - attemptNumber, 0),
      },
    });
  } catch (error: any) {
    if (error?.code === 11000) {
      return NextResponse.json({ success: false, error: "Duplicate attempt number" }, { status: 409 });
    }
    console.error("Student assignment submit error:", error);
    return NextResponse.json({ success: false, error: "Failed to submit assignment" }, { status: 500 });
  }
}
