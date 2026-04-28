import {
  getMockPublicCoursesEmpty,
  getMockPublicCoursesSuccess,
} from "@/mock/publicCourses";
import type { PublicCoursesSuccessBody } from "@/mock/publicCourses";
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

/** Dev-only: force empty success body to verify empty-state UI (same contract shape). */
export function readMockEmptyCatalog(): boolean {
  return process.env.NEXT_PUBLIC_MOCK_PUBLIC_COURSES_EMPTY === "true";
}

async function fetchJsonOrThrow<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return (await response.json()) as T;
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

export async function getPublicCourseById(
  id: string,
): Promise<PublicCourseByIdResponse> {
  const trimmed = id.trim();
  const payload = await fetchJsonOrThrow<PublicCourseByIdResponse>(
    publicCourseDetailPath(trimmed),
  );

  if (!payload?.success || !payload?.data?._id) {
    throw new Error("Public course detail payload shape mismatch");
  }

  return payload;
}

/** `GET /api/public/chapters?courseId=&isPublished=` */
export async function getPublicChapters(
  courseId: string,
  query?: { isPublished?: boolean; limit?: number },
): Promise<PublicChaptersResponse> {
  const trimmed = courseId.trim();
  const params = new URLSearchParams();
  params.set("courseId", trimmed);
  if (query?.isPublished !== undefined) {
    params.set("isPublished", String(query.isPublished));
  }
  if (query?.limit !== undefined) {
    params.set("limit", String(query.limit));
  }

  const payload = await fetchJsonOrThrow<PublicChaptersResponse>(
    `${API_ENDPOINTS.PUBLIC_CHAPTERS}?${params.toString()}`,
  );

  const chapters = payload?.data?.chapters;
  if (!payload?.success || !Array.isArray(chapters)) {
    throw new Error("Public chapters payload shape mismatch");
  }

  return {
    success: true,
    data: { chapters },
  };
}

/** `GET /api/public/lessons?courseId=&isPublished=` */
export async function getPublicLessons(
  courseId: string,
  query?: { isPublished?: boolean; limit?: number },
): Promise<PublicLessonsResponse> {
  const trimmed = courseId.trim();
  const params = new URLSearchParams();
  params.set("courseId", trimmed);
  if (query?.isPublished !== undefined) {
    params.set("isPublished", String(query.isPublished));
  }
  if (query?.limit !== undefined) {
    params.set("limit", String(query.limit));
  }

  const payload = await fetchJsonOrThrow<PublicLessonsResponse>(
    `${API_ENDPOINTS.PUBLIC_LESSONS}?${params.toString()}`,
  );

  const lessons = payload?.data?.lessons;
  if (!payload?.success || !Array.isArray(lessons)) {
    throw new Error("Public lessons payload shape mismatch");
  }

  const normalizedLessons = lessons.map((lesson) => ({
    ...lesson,
    course: String(lesson.course),
    chapter:
      lesson.chapter && typeof lesson.chapter === "object"
        ? String(lesson.chapter._id)
        : String(lesson.chapter),
  }));

  return {
    success: true,
    data: { lessons: normalizedLessons },
  };
}

/** `GET /api/public/faqs?courseId=` */
export async function getPublicFaqs(
  courseId: string,
): Promise<PublicFaqsResponse> {
  const trimmed = courseId.trim();
  const payload = await fetchJsonOrThrow<PublicFaqsResponse>(
    `${API_ENDPOINTS.PUBLIC_FAQS}?courseId=${encodeURIComponent(trimmed)}`,
  );

  const faqs = payload?.data?.faqs;
  if (!payload?.success || !Array.isArray(faqs)) {
    throw new Error("Public FAQs payload shape mismatch");
  }

  return {
    success: true,
    data: { faqs },
  };
}
