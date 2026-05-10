import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import ExamAttempt from "@/models/ExamAttempt";
import { isObjectId, requireSessionUser } from "@/app/api/_lib/phase12";

interface RouteCtx {
  params: Promise<{ id: string }>;
}

function mapIncomingAnswers(answers: any[]) {
  return answers
    .filter((a) => a && typeof a.questionId === "string")
    .map((a) => ({
      question: new mongoose.Types.ObjectId(a.questionId),
      selectedOptions: Array.isArray(a.answer)
        ? a.answer.map((x: unknown) => String(x))
        : typeof a.answer === "string"
          ? [a.answer]
          : [],
      writtenAnswer: typeof a.answer === "string" ? a.answer : undefined,
      isAnswered: true,
    }));
}

export async function GET(_request: NextRequest, ctx: RouteCtx) {
  try {
    const auth = await requireSessionUser(["student"]);
    if (auth.error) return auth.error;
    const { id } = await ctx.params;
    if (!isObjectId(id)) return NextResponse.json({ success: false, error: "Invalid id" }, { status: 400 });

    const attempt = await ExamAttempt.findOne({ _id: id, student: auth.user.id }).lean();
    if (!attempt) return NextResponse.json({ success: false, error: "Attempt not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: { attempt } });
  } catch (error) {
    console.error("Student exam attempt GET by id error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch attempt" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, ctx: RouteCtx) {
  try {
    const auth = await requireSessionUser(["student"]);
    if (auth.error) return auth.error;
    const { id } = await ctx.params;
    if (!isObjectId(id)) return NextResponse.json({ success: false, error: "Invalid id" }, { status: 400 });
    const body = (await request.json()) as { answers?: any[]; timeSpent?: number };

    const attempt = await ExamAttempt.findOne({ _id: id, student: auth.user.id });
    if (!attempt) return NextResponse.json({ success: false, error: "Attempt not found" }, { status: 404 });
    if (attempt.status !== "in_progress") {
      return NextResponse.json({ success: false, error: "Attempt is not editable" }, { status: 400 });
    }

    if (Array.isArray(body.answers)) {
      attempt.answers = mapIncomingAnswers(body.answers) as any;
    }
    if (typeof body.timeSpent === "number" && Number.isFinite(body.timeSpent) && body.timeSpent >= 0) {
      attempt.timeSpent = Math.floor(body.timeSpent);
    }
    await attempt.save();

    return NextResponse.json({
      success: true,
      data: {
        attempt: {
          _id: String(attempt._id),
          exam: String(attempt.exam),
          student: String(attempt.student),
          status: attempt.status,
          answers: (attempt.answers || []).map((ans: any) => ({
            questionId: String(ans.question),
            answer: ans.selectedOptions?.length ? ans.selectedOptions : ans.writtenAnswer || "",
          })),
          timeSpent: attempt.timeSpent,
          startedAt: attempt.startTime,
        },
      },
    });
  } catch (error) {
    console.error("Student exam attempt PUT by id error:", error);
    return NextResponse.json({ success: false, error: "Failed to update attempt" }, { status: 500 });
  }
}
