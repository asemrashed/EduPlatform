import {
  getMockPublicCoursesEmpty,
  getMockPublicCoursesSuccess,
} from "@/mock/publicCourses";
import type { PublicCoursesSuccessBody } from "@/mock/publicCourses";
import {
  getMockChaptersForCourse,
  getMockFaqsForCourse,
  getMockLessonsForCourse,
  getMockPublicCourseDetail,
} from "@/mock/publicCourseDetail";
import { API_ENDPOINTS } from "./endpoints";
import type {
  PublicChaptersResponse,
  PublicCourseByIdResponse,
  PublicFaqsResponse,
  PublicLessonsResponse,
} from "./courseResponses";
import type { PublicCoursesQuery } from "./types";

/**
 * `GET /api/public/courses` — referenced for documentation and Phase 9 HTTP wiring.
 * Not used for network I/O in Phase 2.
 */
export const publicCoursesPath = API_ENDPOINTS.PUBLIC_COURSES;

export const publicCourseDetailPath = (id: string) =>
  API_ENDPOINTS.publicCourse(id);

export function readUseMockApi(): boolean {
  return process.env.NEXT_PUBLIC_USE_MOCK_API !== "false";
}

/** Dev-only: force empty success body to verify empty-state UI (same contract shape). */
export function readMockEmptyCatalog(): boolean {
  return process.env.NEXT_PUBLIC_MOCK_PUBLIC_COURSES_EMPTY === "true";
}

/**
 * Transport for public course list. Phase 2: mock-only (no `fetch` / axios).
 * Phase 9: replace internals with real HTTP while preserving this signature.
 */
export async function getPublicCourses(
  query: PublicCoursesQuery = {},
): Promise<PublicCoursesSuccessBody> {
  const params = new URLSearchParams();
  if (query.page !== undefined) params.set("page", String(query.page));
  if (query.limit !== undefined) params.set("limit", String(query.limit));
  if (query.search) params.set("search", query.search);
  if (query.category) params.set("category", query.category);
  if (query.pricing) params.set("pricing", query.pricing);
  if (query.sortBy) params.set("sortBy", query.sortBy);
  if (query.sortOrder) params.set("sortOrder", query.sortOrder);

  const requestUrl = params.toString()
    ? `${publicCoursesPath}?${params.toString()}`
    : publicCoursesPath;

  try {
    const response = await fetch(requestUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Public courses request failed: ${response.status}`);
    }

    const payload = (await response.json()) as PublicCoursesSuccessBody;
    const courses = payload?.data?.courses;
    const pagination = payload?.data?.pagination;

    if (
      payload?.success === true &&
      Array.isArray(courses) &&
      pagination &&
      typeof pagination.page === "number" &&
      typeof pagination.limit === "number" &&
      typeof pagination.total === "number" &&
      typeof pagination.pages === "number"
    ) {
      const normalizedPagination = {
        ...pagination,
        hasNext:
          typeof pagination.hasNext === "boolean"
            ? pagination.hasNext
            : pagination.page < pagination.pages,
        hasPrev:
          typeof pagination.hasPrev === "boolean"
            ? pagination.hasPrev
            : pagination.page > 1 && pagination.pages > 0,
      };

      return {
        success: true,
        data: {
          courses,
          pagination: normalizedPagination,
        },
      };
    }

    throw new Error("Public courses payload shape mismatch");
  } catch {
    // Temporary safety fallback during phased backend rollout.
    if (readMockEmptyCatalog()) {
      return getMockPublicCoursesEmpty();
    }
    return getMockPublicCoursesSuccess();
  }
}

/**
 * `GET /api/public/courses/[id]` — mock-only in Phase 3 (throws if unknown id).
 */
export async function getPublicCourseById(
  id: string,
): Promise<PublicCourseByIdResponse> {
  if (!readUseMockApi()) {
    throw new Error(
      "Real API transport is not wired yet. Set NEXT_PUBLIC_USE_MOCK_API=true until Phase 9.",
    );
  }
  await Promise.resolve();
  const data = getMockPublicCourseDetail(id.trim());
  if (!data) {
    throw new Error("Course not found");
  }
  return { success: true, data };
}

/** `GET /api/public/chapters?course=&isPublished=` */
export async function getPublicChapters(
  courseId: string,
  _query?: { isPublished?: boolean; limit?: number },
): Promise<PublicChaptersResponse> {
  if (!readUseMockApi()) {
    throw new Error(
      "Real API transport is not wired yet. Set NEXT_PUBLIC_USE_MOCK_API=true until Phase 9.",
    );
  }
  await Promise.resolve();
  return {
    success: true,
    data: { chapters: getMockChaptersForCourse(courseId.trim()) },
  };
}

/** `GET /api/public/lessons?course=&isPublished=` */
export async function getPublicLessons(
  courseId: string,
  _query?: { isPublished?: boolean; limit?: number }
): Promise<PublicLessonsResponse> {
  if (!readUseMockApi()) {
    throw new Error(
      "Real API transport is not wired yet. Set NEXT_PUBLIC_USE_MOCK_API=true until Phase 9.",
    );
  }
  await Promise.resolve();
  return {
    success: true,
    data: { lessons: getMockLessonsForCourse(courseId.trim()) },
  };
}

/** `GET /api/public/faqs?course=` */
export async function getPublicFaqs(
  courseId: string,
): Promise<PublicFaqsResponse> {
  if (!readUseMockApi()) {
    throw new Error(
      "Real API transport is not wired yet. Set NEXT_PUBLIC_USE_MOCK_API=true until Phase 9.",
    );
  }
  await Promise.resolve();
  return {
    success: true,
    data: { faqs: getMockFaqsForCourse(courseId.trim()) },
  };
}
