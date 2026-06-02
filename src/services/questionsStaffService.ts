import { apiFetch } from "@/lib/api/httpClient";

export const questionsStaffService = {
  listAdminQuestions(query: string) {
    return apiFetch(`/api/questions?${query}`);
  },

  listAdminExamsForBank() {
    return apiFetch("/api/exams");
  },

  createAdminQuestion(body: unknown) {
    return apiFetch("/api/questions", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  deleteAdminQuestion(questionId: string) {
    return apiFetch(`/api/questions/${questionId}`, { method: "DELETE" });
  },

  listInstructorQuestions(query: string) {
    return apiFetch(`/api/instructor/questions?${query}`);
  },

  deleteInstructorQuestion(questionId: string) {
    return apiFetch(`/api/instructor/questions/${questionId}`, {
      method: "DELETE",
    });
  },
};
