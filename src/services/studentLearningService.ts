import {
  getPublicChapters,
  getPublicCourseById,
  getPublicLessons,
} from "@/lib/api/client";
import { getMyEnrollments, type MyEnrollmentRow } from "@/lib/api/enrollmentClient";
import { getMyProgress, markLessonComplete, type CourseProgressRow } from "@/lib/api/progressClient";

const ALLOWED_ENROLLMENT_STATUSES = new Set(["completed", "enrolled", "in_progress", "suspended"]);

const normalizeCourseId = (course: unknown): string => {
  if (course && typeof course === "object") {
    return String((course as { _id?: unknown })._id ?? "");
  }
  return String(course ?? "");
};

export const studentLearningService = {
  async getEnrollmentsWithProgress(page: number, limit: number) {
    const [enrollmentRes, progressRes] = await Promise.all([
      getMyEnrollments(),
      getMyProgress(),
    ]);

    const progressByCourse = new Map<string, number>();
    for (const row of progressRes.data.progress) {
      const courseId = normalizeCourseId(row.course);
      if (!courseId) continue;
      progressByCourse.set(courseId, Number(row.progressPercentage || 0));
    }
    
    const filtered = enrollmentRes.data.enrollments
      .filter((enrollment) => ALLOWED_ENROLLMENT_STATUSES.has(String(enrollment.status || "").toLowerCase()))
      .map((enrollment) => {
        const courseId = normalizeCourseId(enrollment.courseLuInfo?._id || enrollment.course);
        const progressPercentage = progressByCourse.get(courseId);
        return {
          ...enrollment,
          progress: typeof progressPercentage === "number" ? progressPercentage : Number(enrollment.progress || 0),
        };
      });
      console.log('filtered', filtered);
    const safeLimit = Math.max(1, limit);
    const safePage = Math.max(1, page);
    const total = filtered.length;
    const pages = total > 0 ? Math.ceil(total / safeLimit) : 0;
    const boundedPage = pages > 0 ? Math.min(safePage, pages) : 1;
    const startIndex = (boundedPage - 1) * safeLimit;

    return {
      enrollments: filtered.slice(startIndex, startIndex + safeLimit),
      pagination: {
        page: boundedPage,
        limit: safeLimit,
        total,
        pages,
      },
    };
  },

  async getCourseBundle(courseId: string) {
    const [courseRes, chaptersRes, lessonsRes] = await Promise.all([
      getPublicCourseById(courseId),
      getPublicChapters(courseId, { isPublished: true, limit: 100 }),
      getPublicLessons(courseId, { isPublished: true, limit: 1000 }),
    ]);

    return {
      course: courseRes.data,
      chapters: chaptersRes.data.chapters,
      lessons: lessonsRes.data.lessons,
    };
  },

  getProgress() {
    return getMyProgress();
  },

  completeLesson(courseId: string, lessonId: string) {
    return markLessonComplete(courseId, lessonId);
  },

  async getCourseEnrollment(courseId: string): Promise<MyEnrollmentRow | null> {
    const enrollmentRes = await getMyEnrollments();
    const normalizedCourseId = String(courseId);
    return (
      enrollmentRes.data.enrollments.find((enrollment) => {
        const rowCourseId = normalizeCourseId(enrollment.courseLuInfo?._id || enrollment.course);
        return rowCourseId === normalizedCourseId;
      }) ?? null
    );
  },

  findProgressForCourse(progressRows: CourseProgressRow[], courseId: string) {
    const targetId = String(courseId);
    return progressRows.find((row) => normalizeCourseId(row.course) === targetId) ?? null;
  },
};
