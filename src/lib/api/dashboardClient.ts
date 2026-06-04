import {
  getMockAdminDashboardFull,
  getMockInstructorDashboard,
} from "@/mock/dashboard";
import { API_ENDPOINTS } from "./endpoints";
import type {
  AdminDashboardApiPayload,
  DashboardRole,
  InstructorDashboardApiPayload,
  StaffBatchDashboardSummary,
} from "@/types/dashboard";
import { emptyBatchSummary } from "@/mock/dashboard/emptyBatchSummary";
import type { StudentDashboardComposite } from "@/types/studentDashboard";
import { isMockApiEnabled } from "@/lib/mockApi/isMockApiEnabled";

function isMockFallbackEnabled(): boolean {
  return isMockApiEnabled();
}

function normalizeBatchSummary(
  raw: Partial<StaffBatchDashboardSummary> | undefined,
): StaffBatchDashboardSummary {
  if (!raw) return emptyBatchSummary;
  return {
    totalBatches: raw.totalBatches ?? 0,
    batches: Array.isArray(raw.batches)
      ? raw.batches.map((b) => ({
          _id: b._id ?? "",
          name: b.name ?? "",
          grade: b.grade ?? "O",
          shortDescription: b.shortDescription,
          thumbnailUrl: b.thumbnailUrl,
          fee: b.fee ?? 0,
          maxStudents: b.maxStudents ?? 0,
          enrolledCount: b.enrolledCount ?? 0,
          nextClassAt: b.nextClassAt,
        }))
      : [],
    upcomingClasses: Array.isArray(raw.upcomingClasses)
      ? raw.upcomingClasses.map((c) => ({
          _id: c._id ?? "",
          batchId: c.batchId ?? "",
          batchName: c.batchName ?? "",
          title: c.title ?? "",
          scheduledAt: c.scheduledAt ?? "",
          type: c.type === "recorded" ? "recorded" : "live",
        }))
      : [],
  };
}

function normalizeStudentDashboard(
  raw: Partial<StudentDashboardComposite>,
): StudentDashboardComposite {
  return {
    enrollments: Array.isArray(raw.enrollments)
      ? raw.enrollments.map((item) => ({
          _id: item._id ?? "",
          course: {
            _id: item.course?._id ?? "",
            title: item.course?.title ?? "",
            description: item.course?.description ?? "",
            thumbnailUrl: item.course?.thumbnailUrl,
            price: item.course?.price ?? 0,
            isPaid: item.course?.isPaid ?? false,
            category: {
              _id: item.course?.category?._id ?? "general",
              name: item.course?.category?.name ?? "General",
            },
            instructor: {
              _id: item.course?.instructor?._id ?? "",
              firstName: item.course?.instructor?.firstName ?? "",
              lastName: item.course?.instructor?.lastName ?? "",
            },
            createdAt: item.course?.createdAt ?? "",
            updatedAt: item.course?.updatedAt ?? "",
          },
          enrolledAt: item.enrolledAt ?? "",
          status: item.status ?? "enrolled",
          progress: item.progress ?? 0,
          lastAccessedAt: item.lastAccessedAt ?? "",
          paymentStatus: item.paymentStatus ?? "pending",
        }))
      : [],
    courseProgress: Array.isArray(raw.courseProgress)
      ? raw.courseProgress.map((item) => ({
          _id: item._id ?? "",
          course: item.course ?? "",
          isCompleted: item.isCompleted ?? false,
          completedAt: item.completedAt,
          progressPercentage: item.progressPercentage ?? 0,
          totalLessons: item.totalLessons ?? 0,
          completedLessons: item.completedLessons ?? 0,
          totalTimeSpent: item.totalTimeSpent ?? 0,
          lastAccessedAt: item.lastAccessedAt ?? "",
          startedAt: item.startedAt ?? "",
        }))
      : [],
    batches: Array.isArray(raw.batches)
      ? raw.batches.map((b) => ({
          _id: b._id ?? "",
          name: b.name ?? "",
          grade: b.grade ?? "O",
          shortDescription: b.shortDescription,
          thumbnailUrl: b.thumbnailUrl,
          fee: b.fee ?? 0,
          maxStudents: b.maxStudents ?? 0,
          enrolledCount: b.enrolledCount ?? 0,
        }))
      : [],
    upcomingClasses: Array.isArray(raw.upcomingClasses)
      ? raw.upcomingClasses.map((c) => ({
          _id: c._id ?? "",
          batchId: c.batchId ?? "",
          batchName: c.batchName ?? "",
          title: c.title ?? "",
          scheduledAt: c.scheduledAt ?? "",
          durationMinutes: c.durationMinutes ?? 0,
          type: c.type === "recorded" ? "recorded" : "live",
          joinUrl: c.joinUrl,
        }))
      : [],
    weeklyRoutine: Array.isArray(raw.weeklyRoutine)
      ? raw.weeklyRoutine.map((batch) => ({
          batchId: batch.batchId ?? "",
          batchName: batch.batchName ?? "",
          days: Array.isArray(batch.days)
            ? batch.days.map((d) => ({
                dayOfWeek: d.dayOfWeek ?? 0,
                label: d.label ?? "",
                slots: Array.isArray(d.slots)
                  ? d.slots.map((s) => ({
                      startTime: s.startTime ?? "",
                      endTime: s.endTime ?? "",
                      title: s.title,
                    }))
                  : [],
              }))
            : [],
        }))
      : [],
  };
}

/** Always uses `GET /api/student/dashboard` — never mock (Phase 15 / 17.7). */
export async function getStudentDashboard(): Promise<StudentDashboardComposite> {
  const response = await fetch(API_ENDPOINTS.STUDENT_DASHBOARD, {
    method: "GET",
    credentials: "include",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  const body = await parseJsonSafe(response);
  if (!response.ok) {
    throw new Error("Failed to load student dashboard");
  }
  const data =
    body && typeof body === "object"
      ? (body as { success?: unknown; data?: unknown }).success === true
        ? (body as { data?: unknown }).data
        : body
      : null;
  if (!data || typeof data !== "object") {
    throw new Error("Invalid student dashboard response");
  }
  return normalizeStudentDashboard(data as Partial<StudentDashboardComposite>);
}

async function parseJsonSafe(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function getInstructorDashboard(): Promise<InstructorDashboardApiPayload> {
  try {
    const response = await fetch(API_ENDPOINTS.INSTRUCTOR_DASHBOARD, {
      method: "GET",
      credentials: "include",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    const body = await parseJsonSafe(response);
    if (!response.ok) {
      throw new Error("Failed to load instructor dashboard");
    }
    const data =
      body && typeof body === "object"
        ? (body as { success?: unknown; data?: unknown }).success === true
          ? (body as { data?: unknown }).data
          : body
        : null;
    if (!data || typeof data !== "object") {
      throw new Error("Invalid instructor dashboard response");
    }
    const raw = data as Partial<InstructorDashboardApiPayload>;
    return {
      overview: {
        totalCourses: raw.overview?.totalCourses ?? 0,
        totalStudents: raw.overview?.totalStudents ?? 0,
        totalEnrollments: raw.overview?.totalEnrollments ?? 0,
        weeklyCompletions: raw.overview?.weeklyCompletions ?? 0,
        completionChange: raw.overview?.completionChange ?? 0,
        successfulPayments: raw.overview?.successfulPayments ?? 0,
        totalRevenue: raw.overview?.totalRevenue ?? 0,
      },
      recentEnrollments: Array.isArray(raw.recentEnrollments)
        ? raw.recentEnrollments.map((item) => ({
            id: item.id ?? "",
            studentName: item.studentName ?? "",
            studentEmail: item.studentEmail ?? "",
            courseTitle: item.courseTitle ?? "",
            enrolledAt: item.enrolledAt ?? "",
            status: item.status ?? "",
          }))
        : [],
      trends: {
        enrollments: Array.isArray(raw.trends?.enrollments)
          ? raw.trends.enrollments.map((item) => ({
              _id: item._id ?? "",
              count: item.count ?? 0,
            }))
          : [],
      },
      courses: Array.isArray(raw.courses)
        ? raw.courses.map((item) => ({
            _id: item._id ?? "",
            title: item.title ?? "",
            description: item.description ?? "",
            thumbnailUrl: item.thumbnailUrl,
            category: {
              _id: item.category?._id ?? "general",
              name: item.category?.name ?? "General",
            },
            studentCount: item.studentCount ?? 0,
            averageRating: item.averageRating ?? 0,
            totalLessons: item.totalLessons ?? 0,
            createdAt: item.createdAt ?? "",
            status: item.status ?? "draft",
          }))
        : [],
      students: Array.isArray(raw.students)
        ? raw.students.map((item) => ({
            _id: item._id ?? "",
            firstName: item.firstName ?? "",
            lastName: item.lastName ?? "",
            email: item.email ?? "",
            avatar: item.avatar,
            enrolledCourses: item.enrolledCourses ?? 0,
            lastActive: item.lastActive ?? "",
          }))
        : [],
      batchSummary: normalizeBatchSummary(raw.batchSummary),
    };
  } catch (error) {
    if (isMockFallbackEnabled()) {
      return getMockInstructorDashboard();
    }
    throw error instanceof Error
      ? error
      : new Error("Failed to load instructor dashboard");
  }
}

export async function getAdminDashboard(): Promise<AdminDashboardApiPayload> {
  try {
    const response = await fetch(API_ENDPOINTS.ADMIN_DASHBOARD, {
      method: "GET",
      credentials: "include",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    const body = await parseJsonSafe(response);
    if (!response.ok) {
      throw new Error("Failed to load admin dashboard");
    }
    const data =
      body && typeof body === "object"
        ? (body as { success?: unknown; data?: unknown }).success === true
          ? (body as { data?: unknown }).data
          : body
        : null;
    if (!data || typeof data !== "object") {
      throw new Error("Invalid admin dashboard response");
    }
    const raw = data as Partial<AdminDashboardApiPayload>;
    return {
      overview: {
        totalStudents: raw.overview?.totalStudents ?? 0,
        totalCourses: raw.overview?.totalCourses ?? 0,
        totalEnrollments: raw.overview?.totalEnrollments ?? 0,
        totalTeachers: raw.overview?.totalTeachers ?? 0,
        activeStudents: raw.overview?.activeStudents ?? 0,
        completedCourses: raw.overview?.completedCourses ?? 0,
        newEnrollmentsThisWeek: raw.overview?.newEnrollmentsThisWeek ?? 0,
        enrollmentChange: raw.overview?.enrollmentChange ?? 0,
        courseCompletionsThisWeek: raw.overview?.courseCompletionsThisWeek ?? 0,
        completionChange: raw.overview?.completionChange ?? 0,
      },
      leaderboard: Array.isArray(raw.leaderboard)
        ? raw.leaderboard.map((item) => ({
            _id: item._id ?? "",
            name: item.name ?? "",
            email: item.email ?? "",
            completedCourses: item.completedCourses ?? 0,
            averageProgress: item.averageProgress ?? 0,
            totalTimeSpent: item.totalTimeSpent ?? 0,
          }))
        : [],
      recentEnrollments: Array.isArray(raw.recentEnrollments)
        ? raw.recentEnrollments.map((item) => ({
            id: item.id ?? "",
            studentName: item.studentName ?? "",
            studentEmail: item.studentEmail ?? "",
            courseTitle: item.courseTitle ?? "",
            enrolledAt: item.enrolledAt ?? "",
            status: item.status ?? "",
          }))
        : [],
      courseStats: Array.isArray(raw.courseStats)
        ? raw.courseStats.map((item) => ({
            id: item.id ?? "",
            title: item.title ?? "",
            price: item.price ?? 0,
            status: item.status ?? "",
            enrollmentCount: item.enrollmentCount ?? 0,
            completionRate: item.completionRate ?? 0,
            createdAt: item.createdAt ?? "",
          }))
        : [],
      paymentStats: {
        totalRevenue: raw.paymentStats?.totalRevenue ?? 0,
        totalTransactions: raw.paymentStats?.totalTransactions ?? 0,
        successfulPayments: raw.paymentStats?.successfulPayments ?? 0,
        pendingPayments: raw.paymentStats?.pendingPayments ?? 0,
        failedPayments: raw.paymentStats?.failedPayments ?? 0,
        successRate: raw.paymentStats?.successRate ?? 0,
      },
      examStats: Array.isArray(raw.examStats)
        ? raw.examStats.map((item) => ({
            id: item.id ?? "",
            title: item.title ?? "",
            totalAttempts: item.totalAttempts ?? 0,
            averageScore: item.averageScore ?? 0,
            createdAt: item.createdAt ?? "",
          }))
        : [],
      trends: {
        enrollments: Array.isArray(raw.trends?.enrollments)
          ? raw.trends.enrollments.map((item) => ({
              _id: item._id ?? "",
              count: item.count ?? 0,
            }))
          : [],
        completions: Array.isArray(raw.trends?.completions)
          ? raw.trends.completions.map((item) => ({
              _id: item._id ?? "",
              count: item.count ?? 0,
            }))
          : [],
        revenue: Array.isArray(raw.trends?.revenue)
          ? raw.trends.revenue.map((item) => ({
              _id: item._id ?? "",
              total: item.total ?? 0,
            }))
          : [],
      },
      batchSummary: normalizeBatchSummary(raw.batchSummary),
    };
  } catch (error) {
    if (isMockFallbackEnabled()) {
      return getMockAdminDashboardFull();
    }
    throw error instanceof Error
      ? error
      : new Error("Failed to load admin dashboard");
  }
}

export async function getDashboardByRole(role: DashboardRole) {
  switch (role) {
    case "student":
      return { role, data: await getStudentDashboard() } as const;
    case "instructor":
      return { role, data: await getInstructorDashboard() } as const;
    case "admin":
      return { role, data: await getAdminDashboard() } as const;
    default: {
      const _exhaustive: never = role;
      return _exhaustive;
    }
  }
}
