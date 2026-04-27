import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import connectDB from "@/lib/mongodb";
import { authOptions } from "@/lib/auth";
import User from "@/models/User";
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

    if (role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    await connectDB();

    const [totalUsers, totalCourses, totalEnrollments, recentEnrollmentDocs] =
      await Promise.all([
        User.countDocuments(),
        Course.countDocuments(),
        Enrollment.countDocuments(),
        Enrollment.find({})
          .populate({ path: "student", select: "name firstName lastName" })
          .populate({ path: "course", select: "title" })
          .sort({ createdAt: -1 })
          .limit(10)
          .lean(),
      ]);

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
        totalUsers,
        totalCourses,
        totalEnrollments,
        recentEnrollments,
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
