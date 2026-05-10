import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Question from "@/models/Question";
import Exam from "@/models/Exam";
import { requireSessionUser, toObjectId } from "@/app/api/_lib/phase12";

export async function POST(request: NextRequest) {
  try {
    const auth = await requireSessionUser(["admin", "instructor"]);
    if (auth.error) return auth.error;

    const body = (await request.json()) as { questions?: Array<Record<string, unknown>>; exam?: string };
    if (!Array.isArray(body.questions) || body.questions.length === 0) {
      return NextResponse.json({ success: false, error: "questions array is required" }, { status: 400 });
    }

    const examId =
      typeof body.exam === "string" && mongoose.Types.ObjectId.isValid(body.exam)
        ? new mongoose.Types.ObjectId(body.exam)
        : undefined;

    const docs = body.questions.map((q) => ({
      question: String(q.question || "").trim(),
      type:
        q.type === "written" || q.type === "true_false" || q.type === "fill_blank" || q.type === "essay"
          ? q.type
          : "mcq",
      marks: Number(q.marks || 1),
      difficulty: q.difficulty === "easy" || q.difficulty === "hard" ? q.difficulty : "medium",
      category: String(q.category || "").trim() || undefined,
      tags: Array.isArray(q.tags) ? q.tags : [],
      options: Array.isArray(q.options) ? q.options : [],
      correctAnswer: String(q.correctAnswer || "").trim() || undefined,
      explanation: String(q.explanation || "").trim() || undefined,
      hints: Array.isArray(q.hints) ? q.hints : [],
      timeLimit: Number(q.timeLimit || 0) || undefined,
      createdBy: toObjectId(auth.user.id),
      exam: examId,
      isActive: true,
    }));

    const inserted = await Question.insertMany(docs);
    if (examId && inserted.length > 0) {
      await Exam.findByIdAndUpdate(examId, { $addToSet: { questions: { $each: inserted.map((q) => q._id) } } });
    }
    return NextResponse.json({ success: true, data: inserted.map((x) => x.toObject()) });
  } catch (error) {
    console.error("Questions bulk POST error:", error);
    return NextResponse.json({ success: false, error: "Failed to import questions" }, { status: 500 });
  }
}
