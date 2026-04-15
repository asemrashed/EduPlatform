/**
 * API path constants — must stay aligned with learning-project `src/app/api/` for Phase 9 parity.
 */
export const API_ENDPOINTS = {
  PUBLIC_COURSES: "/api/public/courses",
  publicCourse: (id: string) => `/api/public/courses/${id}`,
  PUBLIC_CHAPTERS: "/api/public/chapters",
  PUBLIC_LESSONS: "/api/public/lessons",
  PUBLIC_FAQS: "/api/public/faqs",
  /** Phase 4 mock composite; Phase 9 may align with real route. */
  STUDENT_DASHBOARD: "/api/student/dashboard",
  INSTRUCTOR_DASHBOARD: "/api/instructor/dashboard",
  ADMIN_DASHBOARD: "/api/admin/dashboard",
  ENROLLMENTS: "/api/enrollments",
  PASS_PAPERS: "/api/pass-papers",
} as const;
