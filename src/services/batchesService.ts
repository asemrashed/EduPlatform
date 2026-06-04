export type BatchScheduleSlot = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  title?: string;
};

export type BatchRecord = {
  _id: string;
  name: string;
  subject: string;
  instructorId: string;
  schedule: BatchScheduleSlot[];
  startDate: string;
  endDate: string;
  maxStudents: number;
  fee: number;
  isActive: boolean;
  description?: string;
};

export type LiveClassRecord = {
  _id: string;
  batchId: string;
  title: string;
  scheduledAt: string;
  durationMinutes: number;
  type: "live" | "recorded";
  isActive: boolean;
  meetLink?: string;
  recordingUrl?: string;
  joinUrl?: string;
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

  async getRoutine(batchId: string) {
    const res = await fetch(`/api/batches/${batchId}/routine`);
    return parseJson<{
      success: boolean;
      data?: {
        weekly: { dayOfWeek: number; label: string; slots: BatchScheduleSlot[] }[];
        batch: BatchRecord;
      };
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
    return parseJson<{ success: boolean; error?: string }>(res);
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
