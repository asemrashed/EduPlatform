import { apiFetch } from "@/lib/api/httpClient";

export type GeneratedQuestionDraft = {
  subject: string;
  topic: string;
  subtopic?: string;
  difficulty: 1 | 2 | 3;
  questionText: string;
  options: { text: string; isCorrect: boolean }[];
  answerText?: string;
  explanation?: string;
  hasDiagram?: boolean;
  diagramUrl?: string;
  aiTagConfidence?: number;
};

export type PlatformQuestionPayload = {
  subject: string;
  topic: string;
  subtopic?: string;
  difficulty: 1 | 2 | 3;
  questionText: string;
  options: { text: string; isCorrect: boolean }[];
  answerText?: string;
  explanation?: string;
  hasDiagram?: boolean;
  diagramUrl?: string;
  accessPolicy?: "private" | "shared_with_instructors" | "public";
  tags?: string[];
  isActive?: boolean;
  batchId?: string;
  batchClassId?: string;
  subjectModuleId?: string;
  subjectLessonId?: string;
  courseId?: string;
  chapterId?: string;
  lessonId?: string;
};

export const platformQuestionsService = {
  list(query: string) {
    return apiFetch(`/api/platform-questions?${query}`);
  },

  subjects() {
    return apiFetch("/api/platform-questions/subjects");
  },

  testYourselfSummary() {
    return apiFetch("/api/platform-questions/test-yourself-summary");
  },

  curriculumOptions(subject: string) {
    const params = new URLSearchParams({ subject });
    return apiFetch(`/api/platform-questions/curriculum-options?${params}`);
  },

  payForAdminQbAccess() {
    return apiFetch("/api/platform-questions/access-requests/pay", {
      method: "POST",
    });
  },

  get(id: string) {
    return apiFetch(`/api/platform-questions/${id}`);
  },

  create(body: PlatformQuestionPayload) {
    return apiFetch("/api/platform-questions", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  update(id: string, body: Partial<PlatformQuestionPayload>) {
    return apiFetch(`/api/platform-questions/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  },

  remove(id: string) {
    return apiFetch(`/api/platform-questions/${id}`, { method: "DELETE" });
  },

  listAccessRequests(query = "") {
    const q = query ? `?${query}` : "";
    return apiFetch(`/api/platform-questions/access-requests${q}`);
  },

  requestAccess(body?: { note?: string; isPaid?: boolean; amount?: number }) {
    return apiFetch("/api/platform-questions/access-requests", {
      method: "POST",
      body: JSON.stringify(body || {}),
    });
  },

  patchAccessRequest(
    id: string,
    body: {
      status: "approved" | "rejected";
      note?: string;
      expiresAt?: string;
      expiresInDays?: number;
    },
  ) {
    return apiFetch(`/api/platform-questions/access-requests/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },

  generateFromText(body: { text: string; subject?: string; topic?: string }) {
    return apiFetch("/api/platform-questions/generate", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  generateFromPdf(body: { pdfPublicId: string; subject?: string; topic?: string }) {
    return apiFetch("/api/platform-questions/generate", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  async uploadPdf(file: File, folder = "lms/platform-question-bank") {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);
    formData.append("description", "Platform QB AI source");
    const res = await fetch("/api/upload/pdf", {
      method: "POST",
      body: formData,
      credentials: "include",
    });
    return res;
  },

  saveGeneratedBatch(body: {
    questions: GeneratedQuestionDraft[];
    subject?: string;
    topic?: string;
    accessPolicy?: PlatformQuestionPayload["accessPolicy"];
    sourceType?: "claude" | "pdf";
    sourcePdfPublicId?: string;
    sourcePdfUrl?: string;
  }) {
    return apiFetch("/api/platform-questions/generate", {
      method: "POST",
      body: JSON.stringify({ save: true, ...body }),
    });
  },
};
