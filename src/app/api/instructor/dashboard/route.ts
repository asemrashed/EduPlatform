import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import connectDB from "@/lib/mongodb";
import { authOptions } from "@/lib/auth";
import Course from "@/models/Course";
import CourseProgress from "@/models/CourseProgress";
import Enrollment from "@/models/Enrollment";
import Payment from "@/models/Payment";

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

    const totalCourses = await Course.countDocuments({ instructor: userId });
    const instructorCourses = await Course.find({ instructor: userId })
      .select("_id")
      .sort({ createdAt: -1 })
      .lean();
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
