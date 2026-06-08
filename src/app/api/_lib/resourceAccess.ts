import { studentEnrolledBatchIds } from "@/app/api/_lib/batchAccess";
import {
  DEFAULT_RESOURCE_ACCESS,
  TEST_YOURSELF_FREE_LIMIT,
  type ResourceCenterAccess,
} from "@/lib/resources/access";

export type { ResourceCenterAccess };

/** Unified batch-enrollment gate for Resource Center (Phase 18.5). */
export async function resolveResourceCenterAccess(
  userId?: string,
  role?: string,
): Promise<ResourceCenterAccess> {
  if (role === "admin" || role === "instructor") {
    return {
      fullAccess: true,
      batchEnrolled: true,
      freeLimit: TEST_YOURSELF_FREE_LIMIT,
    };
  }

  if (!userId) {
    return { ...DEFAULT_RESOURCE_ACCESS };
  }

  const batchIds = await studentEnrolledBatchIds(userId);
  const batchEnrolled = batchIds.length > 0;

  return {
    fullAccess: batchEnrolled,
    batchEnrolled,
    freeLimit: TEST_YOURSELF_FREE_LIMIT,
  };
}

export function summarizeResourceBrowseAccess<T extends { accessPolicy?: string; canDownload?: boolean }>(
  rows: T[],
) {
  const batchGated = rows.filter((r) => r.accessPolicy === "batch").length;
  const locked = rows.filter(
    (r) => r.accessPolicy === "batch" && r.canDownload === false,
  ).length;

  return {
    total: rows.length,
    batchGated,
    locked,
  };
}
