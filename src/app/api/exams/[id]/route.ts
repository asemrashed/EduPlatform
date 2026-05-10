import { NextRequest, NextResponse } from "next/server";
import Exam from "@/models/Exam";
import Question from "@/models/Question";
import { isObjectId, requireSessionUser, toObjectId } from "@/app/api/_lib/phase12";

interface RouteCtx {
  params: Promise<{ id: string }>;
}

function computeExamStatus(exam: {
  isPublished?: boolean;
  isActive?: boolean;
  startDate?: Date;
  endDate?: Date;
}) {
  if (!exam.isActive) return "inactive";
  if (!exam.isPublished) return "draft";
  const now = Date.now();
  if (exam.startDate && new Date(exam.startDate).getTime() > now) return "scheduled";
  if (exam.endDate && new Date(exam.endDate).getTime() < now) return "expired";
  return "active";
}

function mapExam(exam: any) {
  return {
    _id: String(exam._id),
    title: exam.title,
    description: exam.description || "",
    type: exam.type,
    duration: exam.duration,
    totalMarks: exam.totalMarks,
    passingMarks: exam.passingMarks,
    instructions: exam.instructions || "",
    startDate: exam.startDate || undefined,
    endDate: exam.endDate || undefined,
    course: exam.course || undefined,
    createdBy: exam.createdBy || undefined,
    questions: Array.isArray(exam.questions) ? exam.questions : [],
    attempts: typeof exam.attempts === "number" ? exam.attempts : 0,
    shuffleQuestions: Boolean(exam.shuffleQuestions),
    shuffleOptions: Boolean(exam.shuffleOptions),
    showCorrectAnswers: Boolean(exam.showCorrectAnswers),
    showResults: exam.showResults !== false,
    allowReview: exam.allowReview !== false,
    timeLimit: exam.timeLimit !== false,
    isActive: exam.isActive !== false,
    isPublished: Boolean(exam.isPublished),
    status: computeExamStatus(exam),
    questionCount: Array.isArray(exam.questions) ? exam.questions.length : 0,
    createdAt: exam.createdAt,
    updatedAt: exam.updatedAt,
  };
}

export async function GET(_request: NextRequest, ctx: RouteCtx) {
  try {
    const auth = await requireSessionUser(["admin", "instructor"]);
    if (auth.error) return auth.error;

    const { id } = await ctx.params;
    if (!isObjectId(id)) {
      return NextResponse.json({ success: false, error: "Invalid exam id" }, { status: 400 });
    }

    const filter: Record<string, unknown> = { _id: id };
    if (auth.user.role === "instructor") filter.createdBy = toObjectId(auth.user.id);

    const exam = await Exam.findOne(filter).populate("course", "title").lean();
    if (!exam) {
      return NextResponse.json({ success: false, error: "Exam not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: { exam: mapExam(exam) } });
  } catch (error) {
    console.error("Exams by id GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch exam" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, ctx: RouteCtx) {
  try {
    const auth = await requireSessionUser(["admin", "instructor"]);
    if (auth.error) return auth.error;

    const { id } = await ctx.params;
    if (!isObjectId(id)) {
      return NextResponse.json({ success: false, error: "Invalid exam id" }, { status: 400 });
    }

    const filter: Record<string, unknown> = { _id: id };
    if (auth.user.role === "instructor") filter.createdBy = toObjectId(auth.user.id);
    const existing = await Exam.findOne(filter).lean();
    if (!existing) {
      return NextResponse.json({ success: false, error: "Exam not found" }, { status: 404 });
    }

    const body = (await request.json()) as Record<string, unknown>;
    const update: Record<string, unknown> = {};
    const copy = [
      "title",
      "description",
      "type",
      "instructions",
      "startDate",
      "endDate",
      "shuffleQuestions",
      "shuffleOptions",
      "showCorrectAnswers",
      "showResults",
      "allowReview",
      "timeLimit",
      "isActive",
      "isPublished",
      "course",
    ] as const;
    for (const key of copy) {
      if (key in body) update[key] = body[key];
    }
    if ("duration" in body) update.duration = Number(body.duration || 0);
    if ("totalMarks" in body) update.totalMarks = Number(body.totalMarks || 0);
    if ("passingMarks" in body) update.passingMarks = Number(body.passingMarks || 0);
    if ("attempts" in body) update.attempts = Number(body.attempts || 1);
    if (Array.isArray(body.questions)) {
      update.questions = body.questions.filter((x): x is string => typeof x === "string");
    }
    if (
      typeof update.totalMarks === "number" &&
      typeof update.passingMarks === "number" &&
      update.passingMarks > update.totalMarks
    ) {
      return NextResponse.json(
        { success: false, error: "passingMarks cannot be greater than totalMarks" },
        { status: 400 },
      );
    }

    const updated = await Exam.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    })
      .populate("course", "title")
      .lean();
    return NextResponse.json({ success: true, data: mapExam(updated) });
  } catch (error) {
    console.error("Exams by id PUT error:", error);
    return NextResponse.json({ success: false, error: "Failed to update exam" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, ctx: RouteCtx) {
  try {
    const auth = await requireSessionUser(["admin", "instructor"]);
    if (auth.error) return auth.error;

    const { id } = await ctx.params;
    if (!isObjectId(id)) {
      return NextResponse.json({ success: false, error: "Invalid exam id" }, { status: 400 });
    }

    const filter: Record<string, unknown> = { _id: id };
    if (auth.user.role === "instructor") filter.createdBy = toObjectId(auth.user.id);

    const removed = await Exam.findOneAndDelete(filter).lean();
    if (!removed) {
      return NextResponse.json({ success: false, error: "Exam not found" }, { status: 404 });
    }
    await Question.deleteMany({ exam: removed._id });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Exams by id DELETE error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete exam" }, { status: 500 });
  }
}
