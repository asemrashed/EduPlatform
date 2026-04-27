import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import connectDB from "@/lib/mongodb";
import { authOptions } from "@/lib/auth";
import Course from "@/models/Course";
import Enrollment from "@/models/Enrollment";

type RecentEnrollmentItem = {
  id: string;
  studentName: string;
  courseTitle: string;
  enrolledAt: Date;
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
        .populate({ path: "student", select: "name firstName lastName" })
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
          | { name?: string; firstName?: string; lastName?: string }
          | undefined;
        const studentName =
          student?.name ||
          `${student?.firstName ?? ""} ${student?.lastName ?? ""}`.trim() ||
          "Unknown";
        const course = row.course as { title?: string } | undefined;

        return {
          id: String(row._id ?? ""),
          studentName,
          courseTitle: course?.title || "Unknown",
          enrolledAt: new Date((row.enrolledAt as Date | string | undefined) ?? new Date()),
          status: String(row.status ?? ""),
        };
      },
    );

    return NextResponse.json({
      success: true,
      data: {
        totalCourses,
        totalStudents: studentIds.size,
        totalEnrollments,
        recentEnrollments,
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
