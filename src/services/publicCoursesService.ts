import { getPublicCourses } from "@/lib/api/client";
import type { PublicCoursesQuery } from "@/lib/api/types";

/**
 * Public catalog — all I/O goes through `lib/api/client` (mock or HTTP by phase).
 */
export async function fetchPublicCourses(query: PublicCoursesQuery = {}) {
  return getPublicCourses(query);
}
