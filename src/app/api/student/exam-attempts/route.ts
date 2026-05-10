import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Exam from "@/models/Exam";
import ExamAttempt from "@/models/ExamAttempt";
import Enrollment from "@/models/Enrollment";
import { parseLimit, parsePage, pagination, requireSessionUser } from "@/app/api/_lib/phase12";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireSessionUser(["student"]);
    if (auth.error) return auth.error;

    const { searchParams } = new URL(request.url);
    const examId = (searchParams.get("examId") || "").trim();
    const status = (searchParams.get("status") || "").trim();
    const page = parsePage(searchParams);
    const limit = parseLimit(searchParams, 20, 200);
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = { student: new mongoose.Types.ObjectId(auth.user.id) };
    if (examId && mongoose.Types.ObjectId.isValid(examId)) {
      filter.exam = new mongoose.Types.ObjectId(examId);
    }
    if (status && status !== "all") filter.status = status;

    const [rows, total] = await Promise.all([
      ExamAttempt.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      ExamAttempt.countDocuments(filter),
    ]);

    const attempts = rows.map((a) => ({
      _id: String(a._id),
      exam: String(a.exam),
      student: String(a.student),
      status: a.status,
      score: a.marksObtained,
      percentage: a.percentage,
      passed: a.isPassed,
      timeSpent: a.timeSpent,
      answers: (a.answers || []).map((ans: any) => ({
        questionId: String(ans.question),
        answer: ans.selectedOptions?.length ? ans.selectedOptions : ans.writtenAnswer || "",
        isCorrect: ans.isCorrect,
        marks: ans.marksObtained,
      })),
      startedAt: a.startTime,
      completedAt: a.submittedAt,
    }));

    return NextResponse.json({
      success: true,
      data: {
        attempts,
        pagination: pagination(page, limit, total),
      },
    });
  } catch (error) {
    console.error("Student exam attempts GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch exam attempts" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireSessionUser(["student"]);
    if (auth.error) return auth.error;
    const body = (await request.json()) as { examId?: string };
    const examId = String(body.examId || "");
    if (!mongoose.Types.ObjectId.isValid(examId)) {
      return NextResponse.json({ success: false, error: "Invalid examId" }, { status: 400 });
    }

    const exam = await Exam.findById(examId).lean();
    if (!exam || !exam.isActive || !exam.isPublished) {
      return NextResponse.json({ success: false, error: "Exam not found" }, { status: 404 });
    }
    if (exam.course) {
      const allowed = await Enrollment.exists({
        student: auth.user.id,
        course: exam.course,
        status: { $in: ["enrolled", "in_progress", "completed"] },
      });
      if (!allowed) {
        return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
      }
    }

    const latest = await ExamAttempt.findOne({
      exam: exam._id,
      student: auth.user.id,
      status: "in_progress",
    })
      .sort({ createdAt: -1 })
      .lean();

    if (latest) {
      const totalSeconds = (exam.duration || 60) * 60;
      const spent = Number(latest.timeSpent || 0);
      return NextResponse.json({
        success: true,
        data: {
          attempt: {
            _id: String(latest._id),
            exam: String(latest.exam),
            student: String(latest.student),
            status: latest.status,
            answers: (latest.answers || []).map((ans: any) => ({
              questionId: String(ans.question),
              answer: ans.selectedOptions?.length ? ans.selectedOptions : ans.writtenAnswer || "",
            })),
            startedAt: latest.startTime,
            timeSpent: latest.timeSpent,
          },
          remainingSeconds: Math.max(0, totalSeconds - spent),
        },
      });
    }

    const previousAttempts = await ExamAttempt.countDocuments({
      exam: exam._id,
      student: auth.user.id,
    });
    const attemptNumber = previousAttempts + 1;

    const created = await ExamAttempt.create({
      exam: exam._id,
      student: auth.user.id,
      answers: [],
      totalMarks: exam.totalMarks,
      marksObtained: 0,
      percentage: 0,
      isPassed: false,
      status: "in_progress",
      startTime: new Date(),
      timeSpent: 0,
      isSubmitted: false,
      attemptNumber,
      ipAddress: request.headers.get("x-forwarded-for") || "",
      userAgent: request.headers.get("user-agent") || "",
    });

    await Exam.findByIdAndUpdate(exam._id, { $inc: { attempts: 1 } });
    return NextResponse.json({
      success: true,
      data: {
        attempt: {
          _id: String(created._id),
          exam: String(created.exam),
          student: String(created.student),
          status: created.status,
          answers: [],
          startedAt: created.startTime,
          timeSpent: created.timeSpent,
        },
        remainingSeconds: (exam.duration || 60) * 60,
      },
    });
  } catch (error: any) {
    if (error?.code === 11000) {
      return NextResponse.json(
        { success: false, error: "Attempt already exists for this attempt number" },
        { status: 409 },
      );
    }
    console.error("Student exam attempts POST error:", error);
    return NextResponse.json({ success: false, error: "Failed to create exam attempt" }, { status: 500 });
  }
}
