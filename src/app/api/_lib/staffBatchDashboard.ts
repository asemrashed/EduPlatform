import Batch from "@/models/Batch";
import LiveClass from "@/models/LiveClass";
import {
  countActivePaidEnrollmentsByBatchIds,
  instructorBatchFilter,
} from "@/app/api/_lib/batchAccess";
import type { StaffBatchDashboardSummary } from "@/types/dashboard";

export async function loadStaffBatchDashboardSummary(options: {
  instructorId?: string;
  batchLimit?: number;
}): Promise<StaffBatchDashboardSummary> {
  const limit = options.batchLimit ?? 12;
  const filter: Record<string, unknown> = { isActive: true };
  if (options.instructorId) {
    Object.assign(filter, instructorBatchFilter(options.instructorId));
  }

  const batches = await Batch.find(filter)
    .select("name grade shortDescription thumbnailUrl fee maxStudents")
    .sort({ startDate: -1 })
    .limit(limit)
    .lean();

  const batchIds = batches.map((b) => b._id);
  if (batchIds.length === 0) {
    return { totalBatches: 0, batches: [], upcomingClasses: [] };
  }

  const [countMap, upcomingRows, totalBatches] = await Promise.all([
    countActivePaidEnrollmentsByBatchIds(batchIds),
    LiveClass.find({
      batchId: { $in: batchIds },
      isActive: true,
      scheduledAt: { $gte: new Date() },
    })
      .sort({ scheduledAt: 1 })
      .limit(6)
      .lean(),
    Batch.countDocuments(filter),
  ]);

  const nameMap = new Map(
    batches.map((b) => [String(b._id), String(b.name ?? "Batch")]),
  );

  const nextByBatch = new Map<string, string>();
  for (const row of upcomingRows) {
    const id = String(row.batchId);
    if (!nextByBatch.has(id)) {
      nextByBatch.set(
        id,
        (row.scheduledAt as Date)?.toISOString?.() ?? String(row.scheduledAt),
      );
    }
  }

  return {
    totalBatches,
    batches: batches.map((b) => ({
      _id: String(b._id),
      name: String(b.name ?? ""),
      grade: String(b.grade ?? "O"),
      shortDescription: String(b.shortDescription ?? ""),
      thumbnailUrl: String(b.thumbnailUrl ?? ""),
      fee: Number(b.fee) || 0,
      maxStudents: Number(b.maxStudents) || 0,
      enrolledCount: countMap.get(String(b._id)) ?? 0,
      nextClassAt: nextByBatch.get(String(b._id)),
    })),
    upcomingClasses: upcomingRows.map((row) => ({
      _id: String(row._id),
      batchId: String(row.batchId),
      batchName: nameMap.get(String(row.batchId)) ?? "Batch",
      title: String(row.title ?? ""),
      scheduledAt:
        (row.scheduledAt as Date)?.toISOString?.() ??
        String(row.scheduledAt ?? ""),
      type: row.type === "recorded" ? "recorded" : "live",
    })),
  };
}
