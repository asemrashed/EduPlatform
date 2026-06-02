import { apiFetch } from "@/lib/api/httpClient";

export const teachersStaffService = {
  listTeachers(query: string) {
    return apiFetch(`/api/teachers?${query}`);
  },

  deleteTeacher(teacherId: string) {
    return apiFetch(`/api/teachers/${teacherId}`, { method: "DELETE" });
  },
};
