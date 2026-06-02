import { apiFetch } from "@/lib/api/httpClient";

export const enrollmentsStaffService = {
  listInstructorEnrollments(query: string) {
    return apiFetch(`/api/instructor/enrollments?${query}`);
  },

  createInstructorEnrollment(body: unknown) {
    return apiFetch("/api/instructor/enrollments", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  updateInstructorEnrollment(enrollmentId: string, body: unknown) {
    return apiFetch(`/api/instructor/enrollments/${enrollmentId}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  },

  deleteInstructorEnrollment(enrollmentId: string) {
    return apiFetch(`/api/instructor/enrollments/${enrollmentId}`, {
      method: "DELETE",
    });
  },
};
