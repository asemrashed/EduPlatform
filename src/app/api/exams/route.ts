import { NextRequest, NextResponse } from "next/server";
import Exam from "@/models/Exam";
import Question from "@/models/Question";
import Course from "@/models/Course";
import {
  isObjectId,
  pagination,
  parseLimit,
  parsePage,
  requireSessionUser,
  toObjectId,
} from "@/app/api/_lib/phase12";

function computeExamStatus(exam: { isPublished?: boolean; isActive?: boolean; startDate?: Date; endDate?: Date }) {
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

export async function GET(request: NextRequest) {
  try {
    const auth = await requireSessionUser(["admin", "instructor"]);
    if (auth.error) return auth.error;

    const { searchParams } = new URL(request.url);
    const page = parsePage(searchParams);
    const limit = parseLimit(searchParams, 10, 500);
    const skip = (page - 1) * limit;
    const search = (searchParams.get("search") || "").trim();
    const type = (searchParams.get("type") || "").trim();
    const status = (searchParams.get("status") || "").trim();
    const sortBy = (searchParams.get("sortBy") || "createdAt").trim();
    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;

    const filter: Record<string, unknown> = {};
    if (auth.user.role === "instructor") {
      filter.createdBy = toObjectId(auth.user.id);
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    if (type && type !== "all") filter.type = type;
    if (status === "draft") filter.isPublished = false;
    if (status === "published") filter.isPublished = true;
    if (status === "inactive") filter.isActive = false;
    if (status === "active") {
      filter.isPublished = true;
      filter.isActive = true;
    }
    const isPublishedParam = searchParams.get("isPublished");
    if (isPublishedParam === "true") filter.isPublished = true;
    if (isPublishedParam === "false") filter.isPublished = false;
    const isActiveParam = searchParams.get("isActive");
    if (isActiveParam === "true") filter.isActive = true;
    if (isActiveParam === "false") filter.isActive = false;
    const courseParam = (searchParams.get("course") || "").trim();
    if (courseParam && courseParam !== "all" && isObjectId(courseParam)) {
      filter.course = toObjectId(courseParam);
    }
    const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder };

    const [rows, total] = await Promise.all([
      Exam.find(filter).populate("course", "title").sort(sort).skip(skip).limit(limit).lean(),
      Exam.countDocuments(filter),
    ]);

    const exams = rows.map(mapExam);
    const ids = rows.map((r) => r._id);
    const questionCount = ids.length
      ? await Question.countDocuments({ exam: { $in: ids } })
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        exams,
        pagination: pagination(page, limit, total),
        stats: {
          totalExams: total,
          activeExams: exams.filter((e) => e.status === "active").length,
          draftExams: exams.filter((e) => e.status === "draft").length,
          publishedExams: exams.filter((e) => e.status !== "draft").length,
          totalQuestions: questionCount,
        },
      },
    });
  } catch (error) {
    console.error("Exams GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch exams" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireSessionUser(["admin", "instructor"]);
    if (auth.error) return auth.error;

    const body = (await request.json()) as Record<string, unknown>;
    const title = String(body.title || "").trim();
    if (!title) {
      return NextResponse.json({ success: false, error: "title is required" }, { status: 400 });
    }

    const totalMarks = Number(body.totalMarks || 0);
    const passingMarks = Number(body.passingMarks || 0);
    const duration = Number(body.duration || 0);
    if (totalMarks <= 0 || duration <= 0) {
      return NextResponse.json(
        { success: false, error: "duration and totalMarks must be greater than zero" },
        { status: 400 },
      );
    }
    if (passingMarks > totalMarks) {
      return NextResponse.json(
        { success: false, error: "passingMarks cannot be greater than totalMarks" },
        { status: 400 },
      );
    }

    const courseId = typeof body.course === "string" && body.course.trim() ? body.course : undefined;
    if (courseId) {
      const exists = await Course.exists({ _id: courseId });
      if (!exists) {
        return NextResponse.json({ success: false, error: "course not found" }, { status: 404 });
      }
    }

    const questionIds = Array.isArray(body.questions)
      ? body.questions.filter((x): x is string => typeof x === "string")
      : [];

    const created = await Exam.create({
      title,
      description: String(body.description || "").trim() || undefined,
      type:
        body.type === "written" || body.type === "mixed" || body.type === "mcq"
          ? body.type
          : "mcq",
      duration,
      totalMarks,
      passingMarks,
      instructions: String(body.instructions || "").trim() || undefined,
      startDate: body.startDate ? new Date(String(body.startDate)) : undefined,
      endDate: body.endDate ? new Date(String(body.endDate)) : undefined,
      course: courseId,
      createdBy: toObjectId(auth.user.id),
      questions: questionIds,
      attempts: Number(body.attempts || 1),
      shuffleQuestions: Boolean(body.shuffleQuestions),
      shuffleOptions: Boolean(body.shuffleOptions),
      showCorrectAnswers: body.showCorrectAnswers !== false,
      showResults: body.showResults !== false,
      allowReview: body.allowReview !== false,
      timeLimit: body.timeLimit !== false,
      isActive: body.isActive !== false,
      isPublished: Boolean(body.isPublished),
    });

    const row = await Exam.findById(created._id).populate("course", "title").lean();
    return NextResponse.json({ success: true, data: mapExam(row) });
  } catch (error) {
    console.error("Exams POST error:", error);
    return NextResponse.json({ success: false, error: "Failed to create exam" }, { status: 500 });
  }
}
