import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import connectDB from "@/lib/mongodb";
import "@/lib/registerMongooseModels";
import { authOptions } from "@/lib/auth";
import { INSTRUCTOR_USER_SELECT } from "@/app/api/_lib/instructorProfile";
import Enrollment from "@/models/Enrollment";
import CourseProgress from "@/models/CourseProgress";
import { loadStudentBatchDashboardData } from "@/app/api/_lib/studentBatchDashboard";
import type {
  StudentDashboardComposite,
  StudentDashboardCourse,
  StudentDashboardCourseProgress,
  StudentDashboardEnrollment,
} from "@/types/studentDashboard";

const COURSE_SELECT =
  "title shortDescription description thumbnailUrl category isPaid price instructor createdAt updatedAt";

function courseIdFromRef(courseField: unknown): string {
  if (
    courseField &&
    typeof courseField === "object" &&
    "_id" in (courseField as object)
  ) {
    return String((courseField as { _id: unknown })._id);
  }
  return String(courseField ?? "");
}

function mapCategory(
  category: string | undefined,
): StudentDashboardCourse["category"] {
  const name = category?.trim() || "General";
  return {
    _id: name.toLowerCase().replace(/\s+/g, "-") || "general",
    name,
  };
}

function mapInstructor(
  instructor: unknown,
): StudentDashboardCourse["instructor"] {
  if (instructor && typeof instructor === "object" && "_id" in instructor) {
    const user = instructor as Record<string, unknown>;
    return {
      _id: String(user._id ?? ""),
      firstName: String(user.firstName ?? ""),
      lastName: String(user.lastName ?? ""),
    };
  }
  return { _id: "", firstName: "", lastName: "" };
}

function mapCourse(coursePop: Record<string, unknown>): StudentDashboardCourse {
  return {
    _id: String(coursePop._id ?? ""),
    title: String(coursePop.title ?? ""),
    description: String(
      coursePop.description ?? coursePop.shortDescription ?? "",
    ),
    thumbnailUrl: coursePop.thumbnailUrl
      ? String(coursePop.thumbnailUrl)
      : undefined,
    price: Number(coursePop.price) || 0,
    isPaid: Boolean(coursePop.isPaid),
    category: mapCategory(
      typeof coursePop.category === "string" ? coursePop.category : undefined,
    ),
    instructor: mapInstructor(coursePop.instructor),
    createdAt:
      coursePop.createdAt instanceof Date
        ? coursePop.createdAt.toISOString()
        : String(coursePop.createdAt ?? new Date(0).toISOString()),
    updatedAt:
      coursePop.updatedAt instanceof Date
        ? coursePop.updatedAt.toISOString()
        : String(coursePop.updatedAt ?? new Date(0).toISOString()),
  };
}

function mapEnrollment(row: Record<string, unknown>): StudentDashboardEnrollment {
  const coursePop =
    row.course && typeof row.course === "object"
      ? (row.course as Record<string, unknown>)
      : null;

  const enrolledAt =
    row.enrolledAt instanceof Date
      ? row.enrolledAt.toISOString()
      : String(row.enrolledAt ?? new Date(0).toISOString());

  const lastAccessedAt =
    row.lastAccessedAt instanceof Date
      ? row.lastAccessedAt.toISOString()
      : enrolledAt;

  return {
    _id: String(row._id ?? ""),
    course: coursePop ? mapCourse(coursePop) : mapCourse({}),
    enrolledAt,
    status: (row.status as StudentDashboardEnrollment["status"]) ?? "enrolled",
    progress: Number(row.progress) || 0,
    lastAccessedAt,
    paymentStatus:
      (row.paymentStatus as StudentDashboardEnrollment["paymentStatus"]) ??
      "pending",
  };
}

function mapCourseProgress(
  row: Record<string, unknown>,
): StudentDashboardCourseProgress {
  const status = row.status === "completed" ? "completed" : "in_progress";
  const isCompleted = status === "completed";
  const updatedAt =
    row.updatedAt instanceof Date
      ? row.updatedAt.toISOString()
      : String(row.updatedAt ?? new Date(0).toISOString());
  const createdAt =
    row.createdAt instanceof Date
      ? row.createdAt.toISOString()
      : String(row.createdAt ?? new Date(0).toISOString());

  return {
    _id: String(row._id ?? ""),
    course: courseIdFromRef(row.course),
    isCompleted,
    completedAt: isCompleted ? updatedAt : undefined,
    progressPercentage: Number(row.progressPercentage) || 0,
    totalLessons: Number(row.totalLessons) || 0,
    completedLessons: Number(row.completedLessons) || 0,
    totalTimeSpent: 0,
    lastAccessedAt: updatedAt,
    startedAt: createdAt,
  };
}

/** GET /api/student/dashboard — enrollments + course progress for the signed-in student. */
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

    if (role !== "student") {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    await connectDB();

    const [enrollmentRows, progressRows, batchData] = await Promise.all([
      Enrollment.find({ student: userId })
        .populate({
          path: "course",
          select: COURSE_SELECT,
          populate: { path: "instructor", select: INSTRUCTOR_USER_SELECT },
        })
        .sort({ enrolledAt: -1 })
        .lean(),
      CourseProgress.find({ student: userId })
        .populate({ path: "course", select: "_id" })
        .sort({ updatedAt: -1 })
        .lean(),
      loadStudentBatchDashboardData(userId),
    ]);

    const courseProgress = progressRows.map((row) =>
      mapCourseProgress(row as Record<string, unknown>),
    );
    const progressByCourseId = new Map(
      courseProgress.map((cp) => [cp.course, cp]),
    );

    const enrollments = enrollmentRows.map((row) => {
      const enrollment = mapEnrollment(row as Record<string, unknown>);
      const cp = progressByCourseId.get(enrollment.course._id);
      if (!cp) return enrollment;

      const status = cp.isCompleted
        ? ("completed" as const)
        : cp.progressPercentage > 0
          ? ("in_progress" as const)
          : enrollment.status;

      return {
        ...enrollment,
        progress: cp.progressPercentage,
        status,
        lastAccessedAt: cp.lastAccessedAt || enrollment.lastAccessedAt,
      };
    });

    const data: StudentDashboardComposite = {
      enrollments,
      courseProgress,
      batches: batchData.batches,
      upcomingClasses: batchData.upcomingClasses,
      weeklyRoutine: batchData.weeklyRoutine,
    };

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("GET /api/student/dashboard error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch student dashboard" },
      { status: 500 },
    );
  }
}
