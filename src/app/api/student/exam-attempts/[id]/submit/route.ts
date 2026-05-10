import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import ExamAttempt from "@/models/ExamAttempt";
import Question from "@/models/Question";
import Exam from "@/models/Exam";
import { isObjectId, requireSessionUser } from "@/app/api/_lib/phase12";

interface RouteCtx {
  params: Promise<{ id: string }>;
}

function normalizeAnswerValue(answer: unknown): string[] {
  if (Array.isArray(answer)) return answer.map((x) => String(x));
  if (typeof answer === "string") return [answer];
  return [];
}

function normalizeOptionIndexes(questionId: string, selected: string[]): string[] {
  return selected.map((value) => {
    const legacyPrefix = `${questionId}-`;
    return value.startsWith(legacyPrefix) ? value.slice(legacyPrefix.length) : value;
  });
}

export async function POST(request: NextRequest, ctx: RouteCtx) {
  try {
    const auth = await requireSessionUser(["student"]);
    if (auth.error) return auth.error;
    const { id } = await ctx.params;
    if (!isObjectId(id)) return NextResponse.json({ success: false, error: "Invalid id" }, { status: 400 });
    const body = (await request.json()) as { answers?: Array<{ questionId: string; answer: unknown }>; timeSpent?: number };

    const attempt = await ExamAttempt.findOne({ _id: id, student: auth.user.id });
    if (!attempt) return NextResponse.json({ success: false, error: "Attempt not found" }, { status: 404 });
    if (attempt.status !== "in_progress") {
      return NextResponse.json({ success: false, error: "Attempt already submitted" }, { status: 400 });
    }

    const answers = Array.isArray(body.answers) ? body.answers : [];
    const questionIds = answers
      .map((a) => a.questionId)
      .filter((x): x is string => typeof x === "string" && mongoose.Types.ObjectId.isValid(x))
      .map((x) => new mongoose.Types.ObjectId(x));

    const questionDocs = await Question.find({ _id: { $in: questionIds } }).lean();
    const questionById = new Map<string, any>();
    questionDocs.forEach((q) => questionById.set(String(q._id), q));

    let marksObtained = 0;
    const mappedAnswers = answers
      .filter((a) => typeof a.questionId === "string" && mongoose.Types.ObjectId.isValid(a.questionId))
      .map((a) => {
        const q = questionById.get(a.questionId);
        const selected = normalizeAnswerValue(a.answer);
        let isCorrect: boolean | undefined;
        let ansMarks = 0;
        let selectedForStorage = selected;
        if (q) {
          if (q.type === "mcq") {
            selectedForStorage = normalizeOptionIndexes(a.questionId, selected);
            const correct = Array.isArray(q.options)
              ? q.options
                  .map((opt: any, index: number) => (opt.isCorrect ? String(index) : null))
                  .filter((index: string | null): index is string => index !== null)
                  .sort()
              : [];
            const selectedSorted = [...selectedForStorage].sort();
            isCorrect =
              correct.length === selectedSorted.length &&
              correct.every((v: string, i: number) => selectedSorted[i] === v);
            ansMarks = isCorrect ? Number(q.marks || 0) : 0;
          } else if (q.type === "true_false") {
            const correct = Array.isArray(q.options)
              ? q.options
                  .filter((opt: any) => opt.isCorrect)
                  .map((opt: any) => String(opt.text).toLowerCase())
                  .sort()
              : [];
            const selectedSorted = selected.map((value) => value.toLowerCase()).sort();
            isCorrect =
              correct.length === selectedSorted.length &&
              correct.every((v: string, i: number) => selectedSorted[i] === v);
            ansMarks = isCorrect ? Number(q.marks || 0) : 0;
          } else {
            isCorrect = undefined;
            ansMarks = 0;
          }
        }
        marksObtained += ansMarks;
        return {
          question: new mongoose.Types.ObjectId(a.questionId),
          selectedOptions: selectedForStorage,
          writtenAnswer: selectedForStorage.length === 1 ? selectedForStorage[0] : undefined,
          isCorrect,
          marksObtained: ansMarks,
          isAnswered: true,
        };
      });

    const exam = await Exam.findById(attempt.exam).select("passingMarks totalMarks").lean();
    const totalMarks = Number(exam?.totalMarks || attempt.totalMarks || 0);
    const percentage = totalMarks > 0 ? Number(((marksObtained / totalMarks) * 100).toFixed(2)) : 0;
    const isPassed = percentage >= Number(exam?.passingMarks || 0);

    attempt.answers = mappedAnswers as any;
    attempt.marksObtained = marksObtained;
    attempt.percentage = percentage;
    attempt.isPassed = isPassed;
    attempt.status = "completed";
    attempt.endTime = new Date();
    attempt.isSubmitted = true;
    attempt.submittedAt = new Date();
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
          score: attempt.marksObtained,
          percentage: attempt.percentage,
          passed: attempt.isPassed,
          timeSpent: attempt.timeSpent,
          answers: mappedAnswers.map((a) => ({
            questionId: String(a.question),
            answer: a.selectedOptions?.length ? a.selectedOptions : a.writtenAnswer || "",
            isCorrect: a.isCorrect,
            marks: a.marksObtained,
          })),
          startedAt: attempt.startTime,
          completedAt: attempt.submittedAt,
        },
      },
    });
  } catch (error) {
    console.error("Student exam submit error:", error);
    return NextResponse.json({ success: false, error: "Failed to submit exam" }, { status: 500 });
  }
}
