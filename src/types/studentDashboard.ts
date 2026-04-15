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
  status: "active" | "completed" | "dropped" | "suspended";
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

/** Composite mock — same aggregation as reference student dashboard page. */
export interface StudentDashboardComposite {
  enrollments: StudentDashboardEnrollment[];
  courseProgress: StudentDashboardCourseProgress[];
}
