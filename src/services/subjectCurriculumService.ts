import type { BatchClassRecord } from "@/services/batchesService";

export type SubjectModuleRecord = {
  _id: string;
  batchId: string;
  subjectId: string;
  title: string;
  description?: string;
  order: number;
  isPublished: boolean;
};

export type SubjectLessonRecord = {
  _id: string;
  batchId: string;
  subjectId: string;
  moduleId: string;
  title: string;
  description?: string;
  order: number;
  type: "live" | "recorded";
  scheduledAt?: string;
  durationMinutes?: number;
  meetLink?: string;
  recordingUrl?: string;
  videoUrl?: string;
  youtubeVideoId?: string;
  liveClassId?: string;
  isPublished: boolean;
};

export type SubjectModuleWithLessons = SubjectModuleRecord & {
  lessons: SubjectLessonRecord[];
};

async function parseJson<T>(response: Response): Promise<T> {
  return response.json() as Promise<T>;
}

export const subjectCurriculumService = {
  async getCurriculum(batchId: string, subjectId: string) {
    const res = await fetch(
      `/api/batches/${batchId}/subjects/${subjectId}/modules`,
      { credentials: "include" },
    );
    return parseJson<{
      success: boolean;
      data?: {
        subject: BatchClassRecord;
        modules: SubjectModuleWithLessons[];
        canManage: boolean;
      };
      error?: string;
    }>(res);
  },

  async createModule(batchId: string, subjectId: string, body: Record<string, unknown>) {
    const res = await fetch(
      `/api/batches/${batchId}/subjects/${subjectId}/modules`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include",
      },
    );
    return parseJson<{
      success: boolean;
      data?: { module: SubjectModuleRecord };
      error?: string;
    }>(res);
  },

  async updateModule(
    batchId: string,
    subjectId: string,
    moduleId: string,
    body: Record<string, unknown>,
  ) {
    const res = await fetch(
      `/api/batches/${batchId}/subjects/${subjectId}/modules/${moduleId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include",
      },
    );
    return parseJson<{
      success: boolean;
      data?: { module: SubjectModuleRecord };
      error?: string;
    }>(res);
  },

  async deleteModule(batchId: string, subjectId: string, moduleId: string) {
    const res = await fetch(
      `/api/batches/${batchId}/subjects/${subjectId}/modules/${moduleId}`,
      { method: "DELETE", credentials: "include" },
    );
    return parseJson<{ success: boolean; error?: string }>(res);
  },

  async createLesson(batchId: string, subjectId: string, body: Record<string, unknown>) {
    const res = await fetch(
      `/api/batches/${batchId}/subjects/${subjectId}/lessons`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include",
      },
    );
    return parseJson<{
      success: boolean;
      data?: { lesson: SubjectLessonRecord };
      error?: string;
    }>(res);
  },

  async updateLesson(
    batchId: string,
    subjectId: string,
    lessonId: string,
    body: Record<string, unknown>,
  ) {
    const res = await fetch(
      `/api/batches/${batchId}/subjects/${subjectId}/lessons/${lessonId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include",
      },
    );
    return parseJson<{
      success: boolean;
      data?: { lesson: SubjectLessonRecord };
      error?: string;
    }>(res);
  },

  async deleteLesson(batchId: string, subjectId: string, lessonId: string) {
    const res = await fetch(
      `/api/batches/${batchId}/subjects/${subjectId}/lessons/${lessonId}`,
      { method: "DELETE", credentials: "include" },
    );
    return parseJson<{ success: boolean; error?: string }>(res);
  },
};
