/**
 * Contract-shaped mock for GET /api/public/courses success body
 * (see learning-project/src/app/api/public/courses/route.ts).
 * Phase 0: single sample course with fields aligned to API mapper output.
 */
import type { Course } from "@/types/course";

export type PublicCoursesSuccessBody = {
  success: true;
  data: {
    courses: PublicCourseRow[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
};

/** Public API trims createdBy to { name, role } — not full CourseCreator. */
export type PublicCourseRow = Omit<Course, "createdBy" | "instructor" | "instructorInfo"> & {
  createdBy: { name: string; role: string };
};

const sampleCourse: PublicCourseRow = {
  _id: "507f1f77bcf86cd799439011",
  title: "HSC Physics — Full syllabus (Bangladesh)",
  shortDescription: "National curriculum aligned preparation course.",
  description: "<p>Full syllabus coverage for HSC Physics.</p>",
  category: "507f1f77bcf86cd799439021",
  categoryInfo: null,
  thumbnailUrl: undefined,
  isPaid: true,
  status: "published",
  isHidden: false,
  price: 2500,
  salePrice: 2000,
  originalPrice: undefined,
  finalPrice: 2000,
  discountPercentage: 20,
  displayOrder: undefined,
  duration: 1200,
  difficulty: "intermediate",
  lessonCount: 42,
  enrollmentCount: 128,
  tags: ["HSC", "Physics", "BD"],
  createdBy: { name: "Dr. Karim Rahman", role: "instructor" },
  createdAt: new Date("2025-01-15T10:00:00.000Z").toISOString(),
  updatedAt: new Date("2025-03-01T12:00:00.000Z").toISOString(),
};

const sampleCourse2: PublicCourseRow = {
  _id: "507f1f77bcf86cd799439012",
  title: "Introduction to Web Development",
  shortDescription: "HTML, CSS, and JavaScript fundamentals.",
  description: "<p>Build your first responsive pages.</p>",
  category: "507f1f77bcf86cd799439021",
  categoryInfo: null,
  thumbnailUrl: undefined,
  isPaid: false,
  status: "published",
  isHidden: false,
  price: 0,
  salePrice: undefined,
  originalPrice: undefined,
  finalPrice: 0,
  discountPercentage: 0,
  displayOrder: undefined,
  duration: 180,
  difficulty: "beginner",
  lessonCount: 8,
  enrollmentCount: 540,
  tags: ["Web", "Beginner"],
  createdBy: { name: "Ayesha Khan", role: "instructor" },
  createdAt: new Date("2025-02-01T10:00:00.000Z").toISOString(),
  updatedAt: new Date("2025-02-15T12:00:00.000Z").toISOString(),
};

export function getMockPublicCoursesSuccess(): PublicCoursesSuccessBody {
  return {
    success: true,
    data: {
      courses: [sampleCourse, sampleCourse2],
      pagination: {
        page: 1,
        limit: 10,
        total: 2,
        pages: 1,
        hasNext: false,
        hasPrev: false,
      },
    },
  };
}

/** Empty catalog — same JSON shape as a valid `total: 0` response. */
export function getMockPublicCoursesEmpty(): PublicCoursesSuccessBody {
  return {
    success: true,
    data: {
      courses: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        pages: 0,
        hasNext: false,
        hasPrev: false,
      },
    },
  };
}
