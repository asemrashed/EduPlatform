import "@/lib/registerMongooseModels";
import Batch from "@/models/Batch";
import BatchEnrollment from "@/models/BatchEnrollment";
import LiveClass from "@/models/LiveClass";
import {
  countActivePaidEnrollmentsByBatchIds,
  listRoutineSlotsForBatch,
} from "@/app/api/_lib/batchAccess";
import { deriveUpcomingFromLiveClassRows } from "@/app/api/_lib/upcomingLiveClasses";
import type {
  StudentDashboardBatchSummary,
  StudentDashboardRoutineDay,
  StudentDashboardUpcomingClass,
} from "@/types/studentDashboard";

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

  const [batchRows, liveClassRows, countMap] = await Promise.all([
    Batch.find({ _id: { $in: batchIds } })
      .select("name grade shortDescription thumbnailUrl fee maxStudents")
      .lean(),
    LiveClass.find({
      batchId: { $in: batchIds },
      isActive: true,
    })
      .sort({ scheduledAt: 1 })
      .lean(),
    countActivePaidEnrollmentsByBatchIds(batchIds),
  ]);

  const nameById = new Map(
    batchRows.map((b) => [String(b._id), String(b.name ?? "Batch")]),
  );

  const batches: StudentDashboardBatchSummary[] = batchRows.map((b) => ({
    _id: String(b._id),
    name: String(b.name ?? ""),
    grade: String(b.grade ?? "O"),
    shortDescription: String(b.shortDescription ?? ""),
    thumbnailUrl: String(b.thumbnailUrl ?? ""),
    fee: Number(b.fee) || 0,
    maxStudents: Number(b.maxStudents) || 0,
    enrolledCount: countMap.get(String(b._id)) ?? 0,
  }));

  const upcomingClasses: StudentDashboardUpcomingClass[] =
    deriveUpcomingFromLiveClassRows(
      liveClassRows as Parameters<typeof deriveUpcomingFromLiveClassRows>[0],
      nameById,
      { horizonDays: 14, limit: 8 },
    );

  const routineByBatch: StudentDashboardRoutineDay[] = [];
  for (const batch of batchRows) {
    const batchId = String(batch._id);
    const slots = await listRoutineSlotsForBatch(batchId);
    const byDay = new Map<number, { label: string; slots: typeof slots }>();
    const labels = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    for (let d = 0; d <= 6; d++) {
      byDay.set(d, { label: labels[d], slots: [] });
    }
    for (const slot of slots.filter((s) => s.status === "active")) {
      const day = byDay.get(slot.dayOfWeek);
      if (day) {
        day.slots.push(slot);
      }
    }
    routineByBatch.push({
      batchId,
      batchName: String(batch.name ?? ""),
      days: Array.from(byDay.entries()).map(([dayOfWeek, day]) => ({
        dayOfWeek,
        label: day.label,
        slots: day.slots.map((slot) => ({
          startTime: slot.startTime,
          endTime: slot.endTime,
          title: slot.topic,
        })),
      })),
    });
  }

  routineByBatch.sort((a, b) => a.batchName.localeCompare(b.batchName));

  return { batches, upcomingClasses, weeklyRoutine: routineByBatch };
}
