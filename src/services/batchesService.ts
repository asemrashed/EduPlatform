export type BatchScheduleSlot = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  title?: string;
  recurrence?: "once" | "weekly" | "monthly";
  liveClassId?: string;
  monthDay?: number;
};

export type BatchRecord = {
  _id: string;
  name: string;
  subject: string;
  grade: string;
  instructorId: string;
  instructorIds: string[];
  schedule: BatchScheduleSlot[];
  startDate: string;
  endDate: string;
  maxStudents: number;
  fee: number;
  enrolledCount: number;
  isActive: boolean;
  description?: string;
  shortDescription?: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  features?: string[];
};

export type BatchClassRecord = {
  _id: string;
  batchId: string;
  title: string;
  categoryId: string;
  categoryName?: string;
  instructorId: string;
  instructorName?: string;
  isActive: boolean;
  sortOrder: number;
};

export type RoutineSlotRecord = {
  _id: string;
  batchId: string;
  batchClassId?: string;
  batchClassTitle?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  topic: string;
  instructorId: string;
  instructorName?: string;
  status: "active" | "inactive";
};

export type GeneratedSessionPreview = {
  key: string;
  date: string;
  dayOfWeek: number;
  dayLabel: string;
  startTime: string;
  endTime: string;
  topic: string;
  instructorId: string;
  batchClassId?: string;
  routineSlotId: string;
};

export type LiveClassRecord = {
  _id: string;
  batchId: string;
  title: string;
  scheduledAt: string;
  durationMinutes: number;
  recurrence?: "once" | "weekly" | "monthly";
  type: "live" | "recorded";
  isActive: boolean;
  meetLink?: string;
  recordingUrl?: string;
  joinUrl?: string;
};

export type BatchCalendarEvent = {
  id: string;
  type: "live_class" | "assignment" | "exam" | "batch";
  title: string;
  start: string;
  end?: string;
  allDay?: boolean;
  color: string;
};

async function parseJson<T>(response: Response): Promise<T> {
  return response.json() as Promise<T>;
}

export const batchesService = {
  async listBatches(query = "") {
    const q = query ? `?${query}` : "";
    const res = await fetch(`/api/batches${q}`);
    return parseJson<{ success: boolean; data?: { batches: BatchRecord[] }; error?: string }>(
      res,
    );
  },

  async getBatch(id: string) {
    const res = await fetch(`/api/batches/${id}`);
    return parseJson<{
      success: boolean;
      data?: { batch: BatchRecord; canManage: boolean };
      error?: string;
    }>(res);
  },

  async createBatch(body: Record<string, unknown>) {
    const res = await fetch("/api/batches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return parseJson<{ success: boolean; data?: { batch: BatchRecord }; error?: string }>(res);
  },

  async updateBatch(id: string, body: Record<string, unknown>) {
    const res = await fetch(`/api/batches/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return parseJson<{ success: boolean; data?: { batch: BatchRecord }; error?: string }>(res);
  },

  async deleteBatch(id: string) {
    const res = await fetch(`/api/batches/${id}`, { method: "DELETE" });
    return parseJson<{ success: boolean; data?: { deactivated: boolean }; error?: string }>(
      res,
    );
  },

  async getRoutine(batchId: string) {
    const res = await fetch(`/api/batches/${batchId}/routine`);
    return parseJson<{
      success: boolean;
      data?: {
        weekly: { dayOfWeek: number; label: string; shortLabel?: string; slots: RoutineSlotRecord[] }[];
        slots: RoutineSlotRecord[];
        batch: BatchRecord;
      };
      error?: string;
    }>(res);
  },

  async listBatchClasses(batchId: string) {
    const res = await fetch(`/api/batches/${batchId}/classes`);
    return parseJson<{
      success: boolean;
      data?: { classes: BatchClassRecord[]; canManage: boolean };
      error?: string;
    }>(res);
  },

  async createBatchClass(batchId: string, body: Record<string, unknown>) {
    const res = await fetch(`/api/batches/${batchId}/classes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return parseJson<{ success: boolean; data?: { batchClass: BatchClassRecord }; error?: string }>(
      res,
    );
  },

  async updateBatchClass(batchId: string, classId: string, body: Record<string, unknown>) {
    const res = await fetch(`/api/batches/${batchId}/classes/${classId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return parseJson<{ success: boolean; data?: { batchClass: BatchClassRecord }; error?: string }>(
      res,
    );
  },

  async deleteBatchClass(batchId: string, classId: string) {
    const res = await fetch(`/api/batches/${batchId}/classes/${classId}`, {
      method: "DELETE",
    });
    return parseJson<{ success: boolean; error?: string }>(res);
  },

  async listRoutineSlots(batchId: string) {
    const res = await fetch(`/api/batches/${batchId}/routine-slots`);
    return parseJson<{
      success: boolean;
      data?: {
        slots: RoutineSlotRecord[];
        weekly: { dayOfWeek: number; label: string; slots: RoutineSlotRecord[] }[];
        canManage: boolean;
      };
      error?: string;
    }>(res);
  },

  async createRoutineSlot(batchId: string, body: Record<string, unknown>) {
    const res = await fetch(`/api/batches/${batchId}/routine-slots`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return parseJson<{ success: boolean; data?: { slot: RoutineSlotRecord }; error?: string }>(
      res,
    );
  },

  async updateRoutineSlot(batchId: string, slotId: string, body: Record<string, unknown>) {
    const res = await fetch(`/api/batches/${batchId}/routine-slots/${slotId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return parseJson<{ success: boolean; data?: { slot: RoutineSlotRecord }; error?: string }>(
      res,
    );
  },

  async deleteRoutineSlot(batchId: string, slotId: string) {
    const res = await fetch(`/api/batches/${batchId}/routine-slots/${slotId}`, {
      method: "DELETE",
    });
    return parseJson<{ success: boolean; error?: string }>(res);
  },

  async generateRoutinePreview(
    batchId: string,
    body: { startDate: string; endDate: string },
  ) {
    const res = await fetch(`/api/batches/${batchId}/routine/generate-preview`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return parseJson<{
      success: boolean;
      data?: {
        previews: GeneratedSessionPreview[];
        summary: { sessionCount: number; dayCount: number; startDate: string; endDate: string };
      };
      error?: string;
    }>(res);
  },

  async publishRoutineSessions(
    batchId: string,
    body: { startDate: string; endDate: string },
  ) {
    const res = await fetch(`/api/batches/${batchId}/routine/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return parseJson<{
      success: boolean;
      data?: { publishedCount: number; skippedCount: number };
      error?: string;
    }>(res);
  },

  async listLiveClasses(batchId: string) {
    const res = await fetch(`/api/batches/${batchId}/live-classes`);
    return parseJson<{
      success: boolean;
      data?: { liveClasses: LiveClassRecord[]; canManage: boolean };
      error?: string;
    }>(res);
  },

  async createLiveClass(batchId: string, body: Record<string, unknown>) {
    const res = await fetch(`/api/batches/${batchId}/live-classes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return parseJson<{ success: boolean; data?: { liveClass: LiveClassRecord }; error?: string }>(
      res,
    );
  },

  async updateLiveClass(batchId: string, liveClassId: string, body: Record<string, unknown>) {
    const res = await fetch(`/api/batches/${batchId}/live-classes/${liveClassId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return parseJson<{
      success: boolean;
      data?: { liveClass: LiveClassRecord };
      error?: string;
    }>(res);
  },

  async deleteLiveClass(batchId: string, liveClassId: string) {
    const res = await fetch(`/api/batches/${batchId}/live-classes/${liveClassId}`, {
      method: "DELETE",
    });
    return parseJson<{ success: boolean; data?: { deactivated: boolean }; error?: string }>(
      res,
    );
  },

  async getAttendance(batchId: string, liveClassId: string) {
    const res = await fetch(
      `/api/batches/${batchId}/live-classes/${liveClassId}/attendance`,
    );
    return parseJson<{
      success: boolean;
      data?: {
        liveClass: { _id: string; title: string; scheduledAt: string };
        roster: {
          studentId: string;
          name: string;
          email?: string;
          status: "present" | "absent" | null;
        }[];
      };
      error?: string;
    }>(res);
  },

  async getCalendar(batchId: string, year: number, month: number) {
    const res = await fetch(
      `/api/batches/${batchId}/calendar?year=${year}&month=${month}`,
    );
    return parseJson<{
      success: boolean;
      data?: { year: number; month: number; label: string; events: BatchCalendarEvent[] };
      error?: string;
    }>(res);
  },

  async saveAttendance(
    batchId: string,
    liveClassId: string,
    marks: { studentId: string; status: "present" | "absent" }[],
  ) {
    const res = await fetch(
      `/api/batches/${batchId}/live-classes/${liveClassId}/attendance`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ marks }),
      },
    );
    return parseJson<{ success: boolean; error?: string }>(res);
  },
};
