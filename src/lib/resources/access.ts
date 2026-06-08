/** Free preview question count for non–batch-enrolled users (Phase 18.5). */
export const TEST_YOURSELF_FREE_LIMIT = 4;

export type ResourceCenterAccess = {
  fullAccess: boolean;
  batchEnrolled: boolean;
  freeLimit: number;
};

export const DEFAULT_RESOURCE_ACCESS: ResourceCenterAccess = {
  fullAccess: false,
  batchEnrolled: false,
  freeLimit: TEST_YOURSELF_FREE_LIMIT,
};
