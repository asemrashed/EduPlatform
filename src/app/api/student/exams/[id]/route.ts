import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Exam from "@/models/Exam";
import Question from "@/models/Question";
import Enrollment from "@/models/Enrollment";
import { isObjectId, requireSessionUser } from "@/app/api/_lib/phase12";

interface RouteCtx {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, ctx: RouteCtx) {
  try {
    const auth = await requireSessionUser(["student"]);
    if (auth.error) return auth.error;
    const { id } = await ctx.params;
    if (!isObjectId(id)) {
      return NextResponse.json({ success: false, error: "Invalid exam id" }, { status: 400 });
    }

    const exam = await Exam.findById(id).lean();
    if (!exam || !exam.isActive || !exam.isPublished) {
      return NextResponse.json({ success: false, error: "Exam not found" }, { status: 404 });
    }
    if (exam.course) {
      const canAccess = await Enrollment.exists({
        student: auth.user.id,
        course: exam.course,
        status: { $in: ["enrolled", "in_progress", "completed"] },
      });
      if (!canAccess) {
        return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
      }
    }

    const questionFilter = exam.questions.length
      ? { _id: { $in: exam.questions } }
      : { exam: new mongoose.Types.ObjectId(id) };
    const questions = await Question.find(questionFilter).sort({ createdAt: 1 }).lean();
    const cleanedQuestions = questions.map((q) => ({
      _id: String(q._id),
      question: q.question,
      type: q.type,
      marks: q.marks,
      difficulty: q.difficulty,
      timeLimit: q.timeLimit,
      options: Array.isArray(q.options)
        ? q.options.map((o: any, i: number) => ({
            _id: `${q._id}-${i}`,
            text: o.text,
            isCorrect: false,
          }))
        : [],
      correctAnswer: undefined,
      explanation: q.explanation || undefined,
      hints: Array.isArray(q.hints) ? q.hints : [],
      tags: Array.isArray(q.tags) ? q.tags : [],
      category: q.category || undefined,
    }));

    return NextResponse.json({
      success: true,
      data: {
        exam: {
          ...exam,
          _id: String(exam._id),
          questions: cleanedQuestions.map((q) => q._id),
        },
        questions: cleanedQuestions,
      },
    });
  } catch (error) {
    console.error("Student exam by id GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch exam" }, { status: 500 });
  }
}
