import {
  getMockAdminDashboardFull,
  getMockInstructorDashboard,
  getMockStudentDashboardComposite,
} from "@/mock/dashboard";
import { API_ENDPOINTS } from "./endpoints";
import type {
  AdminDashboardApiPayload,
  DashboardRole,
  InstructorDashboardApiPayload,
} from "@/types/dashboard";
import type { StudentDashboardComposite } from "@/types/studentDashboard";

/** Mock-only dashboard reads — no `fetch` (Phase 4). */
export async function getStudentDashboard(): Promise<StudentDashboardComposite> {
  await Promise.resolve();
  // No dedicated `/api/student/dashboard` route in moynamoti-main.
  return getMockStudentDashboardComposite();
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
    };
  } catch {
    return getMockInstructorDashboard();
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
    };
  } catch {
    return getMockAdminDashboardFull();
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
