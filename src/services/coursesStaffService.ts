import { apiFetch } from "@/lib/api/httpClient";

export const coursesStaffService = {
  listCourses(query: string, init?: RequestInit) {
    return apiFetch(`/api/courses?${query}`, init);
  },

  listCategories() {
    return apiFetch("/api/categories");
  },

  listInstructorUsers() {
    return apiFetch("/api/users?role=instructor,teacher,admin");
  },

  listStudentUsers(limit = 100) {
    return apiFetch(`/api/users?role=student&limit=${limit}`);
  },

  createCourse(body: unknown) {
    return apiFetch("/api/courses", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  updateCourse(courseId: string, body: unknown) {
    return apiFetch(`/api/courses/${courseId}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  },

  deleteCourse(courseId: string) {
    return apiFetch(`/api/courses/${courseId}`, { method: "DELETE" });
  },

  reorderCourses(body: unknown) {
    return apiFetch("/api/courses/reorder", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  listInstructorCourses(limit?: number) {
    const query = limit != null ? `?limit=${limit}` : "";
    return apiFetch(`/api/instructor/courses${query}`);
  },
};
