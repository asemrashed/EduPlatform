/**
 * API path constants — must stay aligned with moynamoti-main `src/app/api/` for Phase 9 parity.
 */
export const API_ENDPOINTS = {
  /** Authenticated self profile (GET/PUT). Not for admin editing other users. */
  ACCOUNT_PROFILE: "/api/account/profile",
  /** Authenticated self password change (POST). */
  ACCOUNT_CHANGE_PASSWORD: "/api/account/change-password",
  PUBLIC_COURSES: "/api/public/courses",
  publicCourse: (id: string) => `/api/public/courses/${id}`,
  PUBLIC_CHAPTERS: "/api/public/chapters",
  PUBLIC_LESSONS: "/api/public/lessons",
  PUBLIC_FAQS: "/api/public/faqs",
  PROGRESS: "/api/progress",
  INSTRUCTOR_DASHBOARD: "/api/instructor/dashboard",
  ADMIN_DASHBOARD: "/api/admin/dashboard",
  ENROLLMENTS: "/api/enrollments",
  PASS_PAPERS: "/api/pass-papers",
} as const;
