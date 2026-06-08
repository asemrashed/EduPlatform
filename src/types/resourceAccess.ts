export type ResourceCenterAccess = {
  fullAccess: boolean;
  batchEnrolled: boolean;
  freeLimit: number;
};

export type ResourceBrowseStats = {
  total: number;
  batchGated: number;
  locked: number;
};
