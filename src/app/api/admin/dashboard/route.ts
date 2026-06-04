import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import connectDB from "@/lib/mongodb";
import { authOptions } from "@/lib/auth";
import User from "@/models/User";
import Course from "@/models/Course";
import CourseProgress from "@/models/CourseProgress";
import Enrollment from "@/models/Enrollment";
import Exam from "@/models/Exam";
import ExamAttempt from "@/models/ExamAttempt";
import Payment from "@/models/Payment";
import { loadStaffBatchDashboardSummary } from "@/app/api/_lib/staffBatchDashboard";

type RecentEnrollmentItem = {
  id: string;
  studentName: string;
  studentEmail: string;
  courseTitle: string;
  enrolledAt: string;
  status: string;
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    const role = session?.user?.role;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    if (role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    await connectDB();

    const [totalStudents, totalCourses, totalEnrollments, totalTeachers, recentEnrollmentDocs] =
      await Promise.all([
        User.countDocuments({ role: "student" }),
        Course.countDocuments(),
        Enrollment.countDocuments(),
        User.countDocuments({ role: "instructor" }),
        Enrollment.find({})
          .populate({ path: "student", select: "name firstName lastName email" })
          .populate({ path: "course", select: "title" })
          .sort({ createdAt: -1 })
          .limit(10)
          .lean(),
      ]);

    const recentEnrollments: RecentEnrollmentItem[] = recentEnrollmentDocs.map(
      (row: Record<string, unknown>) => {
        const student = row.student as
          | { name?: string; firstName?: string; lastName?: string; email?: string }
          | undefined;
        const studentName =
          student?.name ||
          `${student?.firstName ?? ""} ${student?.lastName ?? ""}`.trim() ||
          "Unknown";
        const course = row.course as { title?: string } | undefined;

        return {
          id: String(row._id ?? ""),
          studentName,
          studentEmail: student?.email || "",
          courseTitle: course?.title || "Unknown",
          enrolledAt: new Date(
            (row.enrolledAt as Date | string | undefined) ?? new Date(),
          ).toISOString(),
          status: String(row.status ?? ""),
        };
      },
    );

    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);
    const fourteenDaysAgo = new Date(now);
    fourteenDaysAgo.setDate(now.getDate() - 14);
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const [
      activeStudents,
      completedCourses,
      newEnrollmentsThisWeek,
      previousWeekEnrollments,
      courseCompletionsThisWeek,
      previousWeekCompletions,
      leaderboardRows,
      courseDocs,
      paymentStatsRows,
      examStatsRows,
      enrollmentsTrendRows,
      completionsTrendRows,
      revenueTrendRows,
    ] = await Promise.all([
      Enrollment.distinct("student", {
        status: { $in: ["enrolled", "in_progress", "completed"] },
      }),
      CourseProgress.countDocuments({ status: "completed" }),
      Enrollment.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Enrollment.countDocuments({
        createdAt: { $gte: fourteenDaysAgo, $lt: sevenDaysAgo },
      }),
      CourseProgress.countDocuments({
        status: "completed",
        updatedAt: { $gte: sevenDaysAgo },
      }),
      CourseProgress.countDocuments({
        status: "completed",
        updatedAt: { $gte: fourteenDaysAgo, $lt: sevenDaysAgo },
      }),
      CourseProgress.aggregate([
        { $match: { status: "completed" } },
        {
          $group: {
            _id: "$student",
            completedCourses: { $sum: 1 },
            averageProgress: { $avg: "$progressPercentage" },
          },
        },
        { $sort: { completedCourses: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      ]),
      Course.find({})
        .select("_id title price status createdAt enrollmentCount")
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      Payment.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            totalRevenue: {
              $sum: {
                $cond: [{ $eq: ["$status", "success"] }, "$amount", 0],
              },
            },
          },
        },
      ]),
      Exam.find({})
        .select("_id title createdAt")
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      Enrollment.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      CourseProgress.aggregate([
        {
          $match: {
            status: "completed",
            updatedAt: { $gte: thirtyDaysAgo },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Payment.aggregate([
        {
          $match: {
            status: "success",
            createdAt: { $gte: thirtyDaysAgo },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            total: { $sum: "$amount" },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const paymentStatsMap = new Map<string, { count: number; totalRevenue: number }>();
    for (const row of paymentStatsRows as Array<{ _id?: string; count?: number; totalRevenue?: number }>) {
      paymentStatsMap.set(String(row._id || ""), {
        count: Number(row.count || 0),
        totalRevenue: Number(row.totalRevenue || 0),
      });
    }

    const successfulPayments = paymentStatsMap.get("success")?.count || 0;
    const pendingPayments = paymentStatsMap.get("pending")?.count || 0;
    const failedPayments = paymentStatsMap.get("failed")?.count || 0;
    const totalTransactions = successfulPayments + pendingPayments + failedPayments;
    const totalRevenue = paymentStatsMap.get("success")?.totalRevenue || 0;

    const enrollmentChange =
      previousWeekEnrollments > 0
        ? Math.round(
            ((newEnrollmentsThisWeek - previousWeekEnrollments) /
              previousWeekEnrollments) *
              100,
          )
        : newEnrollmentsThisWeek > 0
          ? 100
          : 0;

    const completionChange =
      previousWeekCompletions > 0
        ? Math.round(
            ((courseCompletionsThisWeek - previousWeekCompletions) /
              previousWeekCompletions) *
              100,
          )
        : courseCompletionsThisWeek > 0
          ? 100
          : 0;

    const examIds = (examStatsRows as Array<{ _id: unknown }>).map((exam) => exam._id);
    const examAttemptStats = examIds.length
      ? await ExamAttempt.aggregate([
          { $match: { exam: { $in: examIds } } },
          {
            $group: {
              _id: "$exam",
              totalAttempts: { $sum: 1 },
              averageScore: { $avg: "$percentage" },
            },
          },
        ])
      : [];
    const examAttemptMap = new Map(
      (examAttemptStats as Array<{ _id: unknown; totalAttempts?: number; averageScore?: number }>).map((row) => [
        String(row._id),
        {
          totalAttempts: Number(row.totalAttempts || 0),
          averageScore: Number(row.averageScore || 0),
        },
      ]),
    );

    const batchSummary = await loadStaffBatchDashboardSummary({});

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalStudents,
          totalCourses,
          totalEnrollments,
          totalTeachers,
          activeStudents: activeStudents.length,
          completedCourses,
          newEnrollmentsThisWeek,
          enrollmentChange,
          courseCompletionsThisWeek,
          completionChange,
        },
        leaderboard: (leaderboardRows as Array<Record<string, unknown>>).map((row) => {
          const user = row.user as Record<string, unknown> | undefined;
          const fullName = [user?.firstName, user?.lastName]
            .filter(Boolean)
            .join(" ")
            .trim();
          return {
            _id: String(row._id || ""),
            name: fullName || String(user?.name || "Unknown"),
            email: String(user?.email || ""),
            completedCourses: Number(row.completedCourses || 0),
            averageProgress: Math.round(Number(row.averageProgress || 0)),
            totalTimeSpent: 0,
          };
        }),
        recentEnrollments,
        courseStats: (courseDocs as Array<Record<string, unknown>>).map((course) => ({
          id: String(course._id || ""),
          title: String(course.title || ""),
          price: typeof course.price === "number" ? course.price : 0,
          status: String(course.status || ""),
          enrollmentCount:
            typeof course.enrollmentCount === "number" ? course.enrollmentCount : 0,
          completionRate: 0,
          createdAt: new Date(
            (course.createdAt as Date | string | undefined) ?? new Date(),
          ).toISOString(),
        })),
        paymentStats: {
          totalRevenue,
          totalTransactions,
          successfulPayments,
          pendingPayments,
          failedPayments,
          successRate:
            totalTransactions > 0
              ? Math.round((successfulPayments / totalTransactions) * 100)
              : 0,
        },
        examStats: (examStatsRows as Array<Record<string, unknown>>).map((exam) => {
          const stats = examAttemptMap.get(String(exam._id)) || {
            totalAttempts: 0,
            averageScore: 0,
          };
          return {
            id: String(exam._id || ""),
            title: String(exam.title || ""),
            totalAttempts: stats.totalAttempts,
            averageScore: Math.round(stats.averageScore),
            createdAt: new Date(
              (exam.createdAt as Date | string | undefined) ?? new Date(),
            ).toISOString(),
          };
        }),
        trends: {
          enrollments: (enrollmentsTrendRows as Array<{ _id?: string; count?: number }>).map(
            (row) => ({
              _id: String(row._id || ""),
              count: Number(row.count || 0),
            }),
          ),
          completions: (completionsTrendRows as Array<{ _id?: string; count?: number }>).map(
            (row) => ({
              _id: String(row._id || ""),
              count: Number(row.count || 0),
            }),
          ),
          revenue: (revenueTrendRows as Array<{ _id?: string; total?: number }>).map((row) => ({
            _id: String(row._id || ""),
            total: Number(row.total || 0),
          })),
        },
        batchSummary,
      },
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch admin dashboard" },
      { status: 500 },
    );
  }
}
