import Batch from "@/models/Batch";
import BatchEnrollment from "@/models/BatchEnrollment";
import LiveClass from "@/models/LiveClass";
import { buildWeeklyRoutine } from "@/app/api/_lib/batchAccess";
import type {
  StudentDashboardBatchSummary,
  StudentDashboardRoutineDay,
  StudentDashboardUpcomingClass,
} from "@/types/studentDashboard";

function mapLiveClassJoinUrl(row: Record<string, unknown>): string | undefined {
  if (row.type === "recorded" && row.recordingUrl) {
    return String(row.recordingUrl);
  }
  if (row.meetLink) return String(row.meetLink);
  return undefined;
}

export async function loadStudentBatchDashboardData(studentId: string): Promise<{
  batches: StudentDashboardBatchSummary[];
  upcomingClasses: StudentDashboardUpcomingClass[];
  weeklyRoutine: StudentDashboardRoutineDay[];
}> {
  const enrollments = await BatchEnrollment.find({
    studentId,
    status: "active",
    paymentStatus: "paid",
  })
    .select("batchId")
    .lean();

  const batchIds = enrollments.map((e) => e.batchId);
  if (batchIds.length === 0) {
    return { batches: [], upcomingClasses: [], weeklyRoutine: [] };
  }

  const [batchRows, liveClassRows] = await Promise.all([
    Batch.find({ _id: { $in: batchIds } })
      .select("name subject schedule")
      .lean(),
    LiveClass.find({
      batchId: { $in: batchIds },
      isActive: true,
      scheduledAt: { $gte: new Date() },
    })
      .sort({ scheduledAt: 1 })
      .limit(8)
      .lean(),
  ]);

  const nameById = new Map(
    batchRows.map((b) => [String(b._id), String(b.name ?? "Batch")]),
  );

  const batches: StudentDashboardBatchSummary[] = batchRows.map((b) => ({
    _id: String(b._id),
    name: String(b.name ?? ""),
    subject: String(b.subject ?? ""),
  }));

  const upcomingClasses: StudentDashboardUpcomingClass[] = liveClassRows.map(
    (row) => {
      const r = row as Record<string, unknown>;
      const batchId = String(r.batchId);
      return {
        _id: String(r._id),
        batchId,
        batchName: nameById.get(batchId) ?? "Batch",
        title: String(r.title ?? ""),
        scheduledAt:
          (r.scheduledAt as Date)?.toISOString?.() ?? String(r.scheduledAt ?? ""),
        durationMinutes: Number(r.durationMinutes) || 0,
        type: (r.type === "recorded" ? "recorded" : "live") as "live" | "recorded",
        joinUrl: mapLiveClassJoinUrl(r),
      };
    },
  );

  const routineByBatch: StudentDashboardRoutineDay[] = [];
  for (const batch of batchRows) {
    const batchId = String(batch._id);
    const weekly = buildWeeklyRoutine(
      Array.isArray(batch.schedule) ? batch.schedule : [],
    );
    routineByBatch.push({
      batchId,
      batchName: String(batch.name ?? ""),
      days: weekly.map((day) => ({
        dayOfWeek: day.dayOfWeek,
        label: day.label,
        slots: day.slots.map((slot) => ({
          startTime: slot.startTime,
          endTime: slot.endTime,
          title: slot.title,
        })),
      })),
    });
  }

  routineByBatch.sort((a, b) => a.batchName.localeCompare(b.batchName));

  return { batches, upcomingClasses, weeklyRoutine: routineByBatch };
}
