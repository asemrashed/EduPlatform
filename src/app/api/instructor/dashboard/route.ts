import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import connectDB from "@/lib/mongodb";
import { authOptions } from "@/lib/auth";
import Course from "@/models/Course";
import CourseProgress from "@/models/CourseProgress";
import Enrollment from "@/models/Enrollment";
import Payment from "@/models/Payment";
import User from "@/models/User";
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

    if (role !== "instructor") {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    await connectDB();

    const instructorCourses = await Course.find({ instructor: userId })
      .sort({ createdAt: -1 })
      .lean();
    const totalCourses = instructorCourses.length;
    const courseIds = instructorCourses.map((c: { _id: unknown }) => c._id);

    const [totalEnrollments, enrollmentStudentDocs, recentEnrollmentDocs] = await Promise.all([
      Enrollment.countDocuments({ course: { $in: courseIds } }),
      Enrollment.find({ course: { $in: courseIds } }).select("student").lean(),
      Enrollment.find({ course: { $in: courseIds } })
        .populate({ path: "student", select: "name firstName lastName email" })
        .populate({ path: "course", select: "title" })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
    ]);

    const studentIds = new Set<string>();
    for (const row of enrollmentStudentDocs as Array<{ student?: unknown }>) {
      if (row.student) {
        studentIds.add(String(row.student));
      }
    }

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

    const [weeklyCompletions, previousWeeklyCompletions, successfulPayments, revenueRows, enrollmentTrendRows] =
      await Promise.all([
        CourseProgress.countDocuments({
          course: { $in: courseIds },
          status: "completed",
          updatedAt: { $gte: sevenDaysAgo },
        }),
        CourseProgress.countDocuments({
          course: { $in: courseIds },
          status: "completed",
          updatedAt: { $gte: fourteenDaysAgo, $lt: sevenDaysAgo },
        }),
        Payment.countDocuments({
          course: { $in: courseIds },
          status: "success",
        }),
        Payment.aggregate([
          { $match: { course: { $in: courseIds }, status: "success" } },
          { $group: { _id: null, totalRevenue: { $sum: "$amount" } } },
        ]),
        Enrollment.aggregate([
          { $match: { course: { $in: courseIds } } },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: "$createdAt",
                },
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
          { $limit: 30 },
        ]),
      ]);

    const completionChange =
      previousWeeklyCompletions > 0
        ? Math.round(
            ((weeklyCompletions - previousWeeklyCompletions) /
              previousWeeklyCompletions) *
              100,
          )
        : weeklyCompletions > 0
          ? 100
          : 0;

    const enrollmentCounts = await Enrollment.aggregate<{
      _id: unknown;
      count: number;
    }>([
      { $match: { course: { $in: courseIds } } },
      { $group: { _id: "$course", count: { $sum: 1 } } },
    ]);
    const countByCourse = new Map(
      enrollmentCounts.map((row) => [String(row._id), Number(row.count || 0)]),
    );

    const courses = instructorCourses.map((course: Record<string, unknown>) => {
      const categoryRaw = course.category;
      const categoryName =
        typeof categoryRaw === "string" && categoryRaw.trim()
          ? categoryRaw.trim()
          : "General";
      return {
        _id: String(course._id ?? ""),
        title: String(course.title ?? ""),
        description: String(course.description ?? course.shortDescription ?? ""),
        thumbnailUrl: course.thumbnailUrl
          ? String(course.thumbnailUrl)
          : undefined,
        category: {
          _id: categoryName,
          name: categoryName,
        },
        studentCount: countByCourse.get(String(course._id)) ?? 0,
        averageRating: 0,
        totalLessons: Number(course.lessonCount ?? 0),
        createdAt: new Date(
          (course.createdAt as Date | string | undefined) ?? new Date(),
        ).toISOString(),
        status: String(course.status ?? "draft") as
          | "draft"
          | "published"
          | "archived",
      };
    });

    const studentRollups = await Enrollment.aggregate<{
      _id: unknown;
      enrolledCourses: number;
      lastActive: Date;
      lastEnrolled: Date;
    }>([
      { $match: { course: { $in: courseIds } } },
      {
        $group: {
          _id: "$student",
          enrolledCourses: { $sum: 1 },
          lastActive: {
            $max: { $ifNull: ["$lastAccessedAt", "$enrolledAt"] },
          },
          lastEnrolled: { $max: "$enrolledAt" },
        },
      },
      { $sort: { lastEnrolled: -1 } },
      { $limit: 12 },
    ]);

    const studentUserIds = studentRollups.map((r) => r._id);
    const studentUsers = await User.find({ _id: { $in: studentUserIds } })
      .select("firstName lastName email avatar name")
      .lean();
    const userById = new Map(
      studentUsers.map((u) => [String(u._id), u as Record<string, unknown>]),
    );

    const batchSummary = await loadStaffBatchDashboardSummary({
      instructorId: userId,
    });

    const students = studentRollups.map((rollup) => {
      const user = userById.get(String(rollup._id));
      const firstName = String(user?.firstName ?? "");
      const lastName = String(user?.lastName ?? "");
      const name = String(user?.name ?? "").trim();
      const [nameFirst = "", ...nameRest] = name.split(/\s+/);
      return {
        _id: String(rollup._id),
        firstName: firstName || nameFirst || "Student",
        lastName: lastName || nameRest.join(" "),
        email: String(user?.email ?? ""),
        avatar: user?.avatar ? String(user.avatar) : undefined,
        enrolledCourses: Number(rollup.enrolledCourses ?? 0),
        lastActive: new Date(
          (rollup.lastActive as Date | undefined) ?? new Date(),
        ).toISOString(),
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalCourses,
          totalStudents: studentIds.size,
          totalEnrollments,
          weeklyCompletions,
          completionChange,
          successfulPayments,
          totalRevenue: Number(revenueRows[0]?.totalRevenue || 0),
        },
        recentEnrollments,
        trends: {
          enrollments: enrollmentTrendRows.map((row) => ({
            _id: String(row._id || ""),
            count: Number(row.count || 0),
          })),
        },
        courses,
        students,
        batchSummary,
      },
    });
  } catch (error) {
    console.error("Instructor dashboard error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch instructor dashboard" },
      { status: 500 },
    );
  }
}
