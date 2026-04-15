import { getMockEnrollmentListActive } from "@/mock/enrollmentsList";
import { API_ENDPOINTS } from "./endpoints";
import type { EnrollmentListSuccessBody } from "@/types/enrollmentList";

export type EnrollmentsQuery = {
  page?: number;
  limit?: number;
  status?: string;
  student?: string;
  search?: string;
};

/** Mock-only — matches `GET /api/enrollments` contract (`success` + `data`). */
export async function getEnrollments(
  _query: EnrollmentsQuery = {},
): Promise<EnrollmentListSuccessBody> {
  await Promise.resolve();
  void API_ENDPOINTS.ENROLLMENTS;
  void _query;
  return getMockEnrollmentListActive();
}
