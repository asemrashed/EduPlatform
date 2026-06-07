import { apiFetch } from "@/lib/api/httpClient";
import { subjectCurriculumService } from "@/services/subjectCurriculumService";

type Option = { _id: string; label: string };

function mapBatch(row: Record<string, unknown>): Option {
  return {
    _id: String(row._id),
    label: String(row.name ?? row.subject ?? row._id),
  };
}

function mapCourse(row: Record<string, unknown>): Option {
  return {
    _id: String(row._id),
    label: String(row.title ?? row._id),
  };
}

export const resourceScopeService = {
  async listBatches() {
    const res = await apiFetch("/api/batches?limit=100");
    const json = (await res.json()) as {
      data?: { batches?: Record<string, unknown>[] };
      batches?: Record<string, unknown>[];
    };
    const rows = json.data?.batches ?? json.batches ?? [];
    return rows.map(mapBatch);
  },

  /** BatchClass rows — labelled “Subject” in batch curriculum */
  async listBatchSubjects(batchId: string) {
    const res = await apiFetch(`/api/batches/${batchId}/classes`);
    const json = (await res.json()) as {
      data?: { classes?: Record<string, unknown>[]; subjects?: Record<string, unknown>[] };
    };
    const rows = json.data?.classes ?? json.data?.subjects ?? [];
    return rows.map((row) => ({
      _id: String(row._id),
      label: String(row.title ?? row.name ?? row._id),
    }));
  },

  async listBatchModules(batchId: string, subjectId: string) {
    const json = await subjectCurriculumService.getCurriculum(batchId, subjectId);
    const modules = json.data?.modules ?? [];
    return modules.map((mod) => ({
      _id: mod._id,
      subjectId: mod.subjectId,
      label: mod.title,
      lessons: mod.lessons ?? [],
    }));
  },

  /** All modules in a batch (across subjects) for resource linking */
  async listAllBatchModules(batchId: string) {
    const subjects = await this.listBatchSubjects(batchId);
    const bySubject = await Promise.all(
      subjects.map(async (subject) => {
        const modules = await this.listBatchModules(batchId, subject._id);
        return modules.map((mod) => ({
          ...mod,
          label: subjects.length > 1 ? `${subject.label} · ${mod.label}` : mod.label,
        }));
      }),
    );
    return bySubject.flat();
  },

  async listCourses() {
    const res = await apiFetch("/api/courses?limit=100");
    const json = (await res.json()) as {
      data?: { courses?: Record<string, unknown>[] };
      courses?: Record<string, unknown>[];
    };
    const rows = json.data?.courses ?? json.courses ?? [];
    return rows.map(mapCourse);
  },

  async listChapters(courseId: string) {
    const res = await apiFetch(`/api/chapters?course=${encodeURIComponent(courseId)}&limit=100`);
    const json = (await res.json()) as {
      data?: { chapters?: Record<string, unknown>[] };
    };
    const rows = json.data?.chapters ?? [];
    return rows.map((row) => ({
      _id: String(row._id),
      label: String(row.title ?? row._id),
    }));
  },

  async listLessons(chapterId: string) {
    const res = await apiFetch(`/api/lessons?chapter=${encodeURIComponent(chapterId)}&limit=100`);
    const json = (await res.json()) as {
      data?: { lessons?: Record<string, unknown>[] };
    };
    const rows = json.data?.lessons ?? [];
    return rows.map((row) => ({
      _id: String(row._id),
      label: String(row.title ?? row._id),
    }));
  },
};

export type BatchModuleOption = {
  _id: string;
  subjectId: string;
  label: string;
  lessons: { _id: string; title: string }[];
};
