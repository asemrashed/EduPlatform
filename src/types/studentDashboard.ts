/**
 * Shapes from `learning-project/src/app/student/dashboard/page.tsx`
 * (data from `/api/enrollments` + `/api/progress` in reference app).
 */

export interface StudentDashboardCourse {
  _id: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  price: number;
  isPaid: boolean;
  category: {
    _id: string;
    name: string;
  };
  instructor: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface StudentDashboardEnrollment {
  _id: string;
  course: StudentDashboardCourse;
  enrolledAt: string;
  status: "enrolled" | "in_progress" | "completed" | "dropped" | "suspended";
  progress: number;
  lastAccessedAt: string;
  paymentStatus: "pending" | "paid" | "refunded" | "failed";
}

export interface StudentDashboardCourseProgress {
  _id: string;
  course: string;
  isCompleted: boolean;
  completedAt?: string;
  progressPercentage: number;
  totalLessons: number;
  completedLessons: number;
  totalTimeSpent: number;
  lastAccessedAt: string;
  startedAt: string;
}

export interface StudentDashboardBatchSummary {
  _id: string;
  name: string;
  subject: string;
}

export interface StudentDashboardUpcomingClass {
  _id: string;
  batchId: string;
  batchName: string;
  title: string;
  scheduledAt: string;
  durationMinutes: number;
  type: "live" | "recorded";
  joinUrl?: string;
}

export interface StudentDashboardRoutineDay {
  batchId: string;
  batchName: string;
  days: {
    dayOfWeek: number;
    label: string;
    slots: { startTime: string; endTime: string; title?: string }[];
  }[];
}

/** Composite — enrollments, progress, and batch academic widgets (Phase 17.7). */
export interface StudentDashboardComposite {
  enrollments: StudentDashboardEnrollment[];
  courseProgress: StudentDashboardCourseProgress[];
  batches: StudentDashboardBatchSummary[];
  upcomingClasses: StudentDashboardUpcomingClass[];
  weeklyRoutine: StudentDashboardRoutineDay[];
}
