import { NextResponse } from "next/server";
import Batch, { type IBatchScheduleSlot } from "@/models/Batch";
import BatchEnrollment from "@/models/BatchEnrollment";
import { isObjectId, toObjectId, type SessionUser } from "@/app/api/_lib/phase12";

export const WEEKDAY_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export function buildWeeklyRoutine(schedule: IBatchScheduleSlot[]) {
  const days = WEEKDAY_LABELS.map((label, dayOfWeek) => ({
    dayOfWeek,
    label,
    slots: [] as IBatchScheduleSlot[],
  }));

  for (const slot of schedule || []) {
    const day = days[slot.dayOfWeek];
    if (day) day.slots.push(slot);
  }

  for (const day of days) {
    day.slots.sort((a, b) => a.startTime.localeCompare(b.startTime));
  }

  return days;
}

export function mapBatch(row: Record<string, unknown>) {
  return {
    _id: String(row._id),
    name: row.name,
    subject: row.subject,
    instructorId: String(row.instructorId),
    schedule: Array.isArray(row.schedule) ? row.schedule : [],
    startDate: (row.startDate as Date)?.toISOString?.() ?? row.startDate,
    endDate: (row.endDate as Date)?.toISOString?.() ?? row.endDate,
    maxStudents: row.maxStudents,
    fee: row.fee,
    isActive: Boolean(row.isActive),
    description: row.description,
    createdAt: (row.createdAt as Date)?.toISOString?.() ?? row.createdAt,
    updatedAt: (row.updatedAt as Date)?.toISOString?.() ?? row.updatedAt,
  };
}

export function canManageBatch(user: SessionUser, batch: { instructorId: unknown }) {
  if (user.role === "admin") return true;
  if (user.role === "instructor") {
    return String(batch.instructorId) === String(user.id);
  }
  return false;
}

export async function hasActiveBatchEnrollment(batchId: string, studentId: string) {
  const row = await BatchEnrollment.findOne({
    batchId,
    studentId,
    status: "active",
    paymentStatus: "paid",
  })
    .select("_id")
    .lean();
  return Boolean(row);
}

export async function requireBatchById(batchId: string) {
  if (!isObjectId(batchId)) {
    return {
      error: NextResponse.json(
        { success: false, error: "Invalid batch id" },
        { status: 400 },
      ),
      batch: null,
    };
  }

  const batch = await Batch.findById(batchId).lean();
  if (!batch) {
    return {
      error: NextResponse.json(
        { success: false, error: "Batch not found" },
        { status: 404 },
      ),
      batch: null,
    };
  }

  return { error: null, batch };
}

export async function requireBatchViewAccess(batchId: string, user: SessionUser) {
  const resolved = await requireBatchById(batchId);
  if (resolved.error) return resolved;

  const batch = resolved.batch!;
  if (canManageBatch(user, batch)) {
    return { error: null, batch, canManage: true };
  }

  if (user.role === "student") {
    const enrolled = await hasActiveBatchEnrollment(batchId, user.id);
    if (enrolled) {
      return { error: null, batch, canManage: false };
    }
  }

  return {
    error: NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 }),
    batch: null,
    canManage: false,
  };
}

export async function requireBatchManageAccess(batchId: string, user: SessionUser) {
  const resolved = await requireBatchViewAccess(batchId, user);
  if (resolved.error) return resolved;
  if (!resolved.canManage) {
    return {
      error: NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 }),
      batch: null,
    };
  }
  return { error: null, batch: resolved.batch };
}

export function instructorBatchFilter(userId: string) {
  return { instructorId: toObjectId(userId) };
}

export async function studentEnrolledBatchIds(studentId: string) {
  const rows = await BatchEnrollment.find({
    studentId,
    status: "active",
    paymentStatus: "paid",
  })
    .select("batchId")
    .lean();
  return rows.map((r) => r.batchId);
}
