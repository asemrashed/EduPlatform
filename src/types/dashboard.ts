import type { StudentDashboardComposite } from "./studentDashboard";

/** QA role switcher on `/dashboard`; removed in Phase 8. */
export type DashboardRole = "student" | "instructor" | "admin";

/** `GET /api/instructor/dashboard` — `learning-project/src/app/api/instructor/dashboard/route.ts` */
export interface InstructorDashboardApiPayload {
  overview: {
    totalCourses: number;
    totalStudents: number;
    totalEnrollments: number;
    weeklyCompletions: number;
    completionChange: number;
    successfulPayments: number;
    totalRevenue: number;
  };
  recentEnrollments: Array<{
    id: string;
    studentName: string;
    studentEmail: string;
    courseTitle: string;
    enrolledAt: string;
    status: string;
  }>;
  trends: {
    enrollments: Array<{ _id: string; count: number }>;
  };
}

/** `GET /api/admin/dashboard` — `learning-project/src/app/api/admin/dashboard/route.ts` */
export interface AdminDashboardApiPayload {
  overview: {
    totalStudents: number;
    totalCourses: number;
    totalEnrollments: number;
    totalTeachers: number;
    activeStudents: number;
    completedCourses: number;
    newEnrollmentsThisWeek: number;
    enrollmentChange: number;
    courseCompletionsThisWeek: number;
    completionChange: number;
  };
  leaderboard: Array<{
    _id: string;
    name: string;
    email: string;
    completedCourses: number;
    averageProgress: number;
    totalTimeSpent: number;
  }>;
  recentEnrollments: Array<{
    id: string;
    studentName: string;
    studentEmail: string;
    courseTitle: string;
    enrolledAt: string;
    status: string;
  }>;
  courseStats: Array<{
    id: string;
    title: string;
    price: number;
    status: string;
    enrollmentCount: number;
    completionRate: number;
    createdAt: string;
  }>;
  paymentStats: {
    totalRevenue: number;
    totalTransactions: number;
    successfulPayments: number;
    pendingPayments: number;
    failedPayments: number;
    successRate: number;
  };
  examStats: Array<{
    id: string;
    title: string;
    totalAttempts: number;
    averageScore: number;
    createdAt: string;
  }>;
  trends: {
    enrollments: Array<{ _id: string; count: number }>;
    completions: Array<{ _id: string; count: number }>;
    revenue: Array<{ _id: string; total: number }>;
  };
}

export type DashboardPayload =
  | { role: "student"; data: StudentDashboardComposite }
  | { role: "instructor"; data: InstructorDashboardApiPayload }
  | { role: "admin"; data: AdminDashboardApiPayload };
