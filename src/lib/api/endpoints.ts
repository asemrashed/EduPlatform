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
  PUBLIC_BATCHES: "/api/public/batches",
  publicBatch: (id: string) => `/api/public/batches/${id}`,
  PUBLIC_CHAPTERS: "/api/public/chapters",
  PUBLIC_LESSONS: "/api/public/lessons",
  PUBLIC_FAQS: "/api/public/faqs",
  PROGRESS: "/api/progress",
  INSTRUCTOR_DASHBOARD: "/api/instructor/dashboard",
  ADMIN_DASHBOARD: "/api/admin/dashboard",
  STUDENT_DASHBOARD: "/api/student/dashboard",
  ENROLLMENTS: "/api/enrollments",
  PAST_PAPERS: "/api/past-papers",
  LESSON_QUIZ_AVAILABILITY: "/api/lessons/quiz-availability",
  STUDENT_QUIZ_COMPLETION: "/api/student/quiz/completion",
  STUDENT_QUIZ_LATEST: "/api/student/quiz/latest",
  lessonQuiz: (lessonId: string) => `/api/lessons/${lessonId}/quiz`,
  lessonQuizSubmit: (lessonId: string) => `/api/lessons/${lessonId}/quiz/submit`,
  lessonQuizHistory: (lessonId: string) => `/api/lessons/${lessonId}/quiz/history`,
  lessonQuizResultDetails: (lessonId: string) =>
    `/api/lessons/${lessonId}/quiz/result-details`,
} as const;
