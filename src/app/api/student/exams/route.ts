import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Exam from "@/models/Exam";
import Enrollment from "@/models/Enrollment";
import ExamAttempt from "@/models/ExamAttempt";
import { pagination, parseLimit, parsePage, requireSessionUser, toObjectId } from "@/app/api/_lib/phase12";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireSessionUser(["student"]);
    if (auth.error) return auth.error;

    const { searchParams } = new URL(request.url);
    const page = parsePage(searchParams);
    const limit = parseLimit(searchParams, 12, 100);
    const skip = (page - 1) * limit;
    const search = (searchParams.get("search") || "").trim();
    const now = new Date();

    const enrolledCourseIds = await Enrollment.find({
      student: toObjectId(auth.user.id),
      status: { $in: ["enrolled", "in_progress", "completed"] },
    })
      .select("course")
      .lean();
    const courseIds = enrolledCourseIds.map((x) => x.course).filter(Boolean);

    const filter: Record<string, unknown> = {
      isActive: true,
      isPublished: true,
      $or: [{ course: { $in: courseIds } }, { course: { $exists: false } }, { course: null }],
      $and: [
        { $or: [{ startDate: { $exists: false } }, { startDate: null }, { startDate: { $lte: now } }] },
        { $or: [{ endDate: { $exists: false } }, { endDate: null }, { endDate: { $gte: now } }] },
      ],
    };
    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }

    const [rows, total] = await Promise.all([
      Exam.find(filter).populate("course", "title").sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Exam.countDocuments(filter),
    ]);

    const examIds = rows.map((x) => x._id);
    const attempts = examIds.length
      ? await ExamAttempt.find({
          exam: { $in: examIds },
          student: new mongoose.Types.ObjectId(auth.user.id),
          status: "completed",
        })
          .select("exam percentage isPassed submittedAt")
          .sort({ submittedAt: -1 })
          .lean()
      : [];

    const attemptsByExam = new Map<string, any>();
    for (const attempt of attempts) {
      const key = String(attempt.exam);
      if (!attemptsByExam.has(key)) attemptsByExam.set(key, attempt);
    }

    const exams = rows.map((exam) => {
      const latest = attemptsByExam.get(String(exam._id));
      return {
        ...exam,
        courseTitle: (exam as any).course?.title || "",
        questionCount: Array.isArray(exam.questions) ? exam.questions.length : 0,
        latestResult: latest
          ? {
              percentage: latest.percentage,
              isPassed: latest.isPassed,
              submittedAt: latest.submittedAt,
            }
          : undefined,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        exams,
        pagination: pagination(page, limit, total),
        stats: { availableExams: total },
      },
    });
  } catch (error) {
    console.error("Student exams GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch exams" }, { status: 500 });
  }
}
