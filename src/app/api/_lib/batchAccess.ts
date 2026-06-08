import { NextResponse } from "next/server";
import Batch, { type IBatchScheduleSlot } from "@/models/Batch";
import BatchClass from "@/models/BatchClass";
import BatchEnrollment from "@/models/BatchEnrollment";
import RoutineSlot from "@/models/RoutineSlot";
import { ensureMongooseModelsRegistered } from "@/lib/registerMongooseModels";
import { isObjectId, toObjectId, type SessionUser } from "@/app/api/_lib/phase12";
import { normalizeBatchGrade } from "@/lib/batchGrades";
import {
  batchHasInstructor,
  resolveBatchInstructorIds,
} from "@/app/api/_lib/batchInstructors";
import { ensureRoutineSlotsMigrated } from "@/app/api/_lib/legacyRoutineMigrate";
import { mapRoutineSlot } from "@/app/api/_lib/mapBatchClass";

export const WEEKDAY_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

const WEEKDAY_SHORT = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const;

export function weekdayShort(dayOfWeek: number) {
  return WEEKDAY_SHORT[dayOfWeek] ?? "?";
}

export function buildWeeklyRoutineFromSlots(
  slots: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    topic: string;
    instructorName?: string;
    status: string;
    _id: string;
    batchClassTitle?: string;
  }[],
) {
  const days = WEEKDAY_LABELS.map((label, dayOfWeek) => ({
    dayOfWeek,
    label,
    shortLabel: weekdayShort(dayOfWeek),
    slots: [] as typeof slots,
  }));

  for (const slot of slots) {
    const day = days[slot.dayOfWeek];
    if (day) day.slots.push(slot);
  }

  for (const day of days) {
    day.slots.sort((a, b) => a.startTime.localeCompare(b.startTime));
  }

  return days;
}

/** @deprecated Legacy embedded schedule grid */
export function buildWeeklyRoutine(schedule: IBatchScheduleSlot[]) {
  const days = WEEKDAY_LABELS.map((label, dayOfWeek) => ({
    dayOfWeek,
    label,
    shortLabel: weekdayShort(dayOfWeek),
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

/** Active, paid batch enrollments — same criteria as public enroll listing. */
export async function countActivePaidEnrollmentsByBatchIds(
  batchIds: unknown[],
): Promise<Map<string, number>> {
  if (batchIds.length === 0) return new Map();

  const countRows = await BatchEnrollment.aggregate([
    {
      $match: {
        batchId: { $in: batchIds },
        status: "active",
        paymentStatus: "paid",
      },
    },
    { $group: { _id: "$batchId", count: { $sum: 1 } } },
  ]);

  return new Map(
    countRows.map((r) => [String(r._id), Number(r.count) || 0]),
  );
}

export function mapBatch(
  row: Record<string, unknown>,
  options?: { enrolledCount?: number },
) {
  const instructorIds = resolveBatchInstructorIds(row);
  const grade = normalizeBatchGrade(
    row.grade ??
      (typeof row.category === "string" ? row.category : undefined),
  );

  return {
    _id: String(row._id),
    name: row.name,
    subject: row.subject ?? "",
    grade,
    instructorId: instructorIds[0] ?? "",
    instructorIds,
    schedule: Array.isArray(row.schedule) ? row.schedule : [],
    startDate: (row.startDate as Date)?.toISOString?.() ?? row.startDate,
    endDate: (row.endDate as Date)?.toISOString?.() ?? row.endDate,
    maxStudents: row.maxStudents,
    fee: row.fee,
    isActive: Boolean(row.isActive),
    description: row.description,
    shortDescription: row.shortDescription,
    thumbnailUrl: row.thumbnailUrl,
    videoUrl: row.videoUrl,
    features: Array.isArray(row.features) ? row.features : [],
    enrolledCount: options?.enrolledCount ?? 0,
    createdAt: (row.createdAt as Date)?.toISOString?.() ?? row.createdAt,
    updatedAt: (row.updatedAt as Date)?.toISOString?.() ?? row.updatedAt,
  };
}

export function isBatchAdmin(user: SessionUser) {
  return user.role === "admin";
}

/** @deprecated Batch-level instructors no longer receive manage rights; use isBatchAdmin */
export function canManageBatch(
  user: SessionUser,
  batch: { instructorIds?: unknown[]; instructorId?: unknown },
) {
  if (user.role === "admin") return true;
  if (user.role === "instructor") {
    return batchHasInstructor(batch, user.id);
  }
  return false;
}

export async function instructorHasSubjectInBatch(batchId: string, userId: string) {
  const count = await BatchClass.countDocuments({
    batchId: toObjectId(batchId),
    instructorId: toObjectId(userId),
    isActive: { $ne: false },
  });
  return count > 0;
}

export async function assignedSubjectIdsInBatch(batchId: string, userId: string) {
  const rows = await BatchClass.find({
    batchId: toObjectId(batchId),
    instructorId: toObjectId(userId),
    isActive: { $ne: false },
  })
    .select("_id")
    .lean();
  return rows.map((r) => String(r._id));
}

export function canManageSubjectCurriculum(
  user: SessionUser,
  subject: { instructorId?: unknown },
) {
  if (user.role === "admin") return true;
  if (user.role === "instructor") {
    return String(subject.instructorId ?? "") === user.id;
  }
  return false;
}

export async function requireSubjectCurriculumManage(
  batchId: string,
  subjectId: string,
  user: SessionUser,
) {
  const view = await requireBatchViewAccess(batchId, user);
  if (view.error) return view;

  const subject = await BatchClass.findOne({
    _id: toObjectId(subjectId),
    batchId: toObjectId(batchId),
    isActive: { $ne: false },
  }).lean();

  if (!subject) {
    return {
      error: NextResponse.json(
        { success: false, error: "Subject not found" },
        { status: 404 },
      ),
      batch: null,
      subject: null,
    };
  }

  if (!canManageSubjectCurriculum(user, subject)) {
    return {
      error: NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 }),
      batch: null,
      subject: null,
    };
  }

  return { error: null, batch: view.batch, subject };
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

  if (user.role === "admin") {
    return {
      error: null,
      batch,
      canManage: true,
      canManageRoutine: true,
      assignedSubjectIds: [] as string[],
    };
  }

  if (user.role === "instructor") {
    const batchInstructor = batchHasInstructor(batch, user.id);
    const subjectInstructor = await instructorHasSubjectInBatch(batchId, user.id);
    if (batchInstructor || subjectInstructor) {
      const assignedSubjectIds = subjectInstructor
        ? await assignedSubjectIdsInBatch(batchId, user.id)
        : [];
      return {
        error: null,
        batch,
        canManage: false,
        canManageRoutine: false,
        assignedSubjectIds,
      };
    }
  }

  if (user.role === "student") {
    const enrolled = await hasActiveBatchEnrollment(batchId, user.id);
    if (enrolled) {
      return {
        error: null,
        batch,
        canManage: false,
        canManageRoutine: false,
        assignedSubjectIds: [] as string[],
      };
    }
  }

  return {
    error: NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 }),
    batch: null,
    canManage: false,
    canManageRoutine: false,
    assignedSubjectIds: [] as string[],
  };
}

/** Admin-only batch mutations (settings, subjects, live classes, attendance, routine). */
export async function requireBatchManageAccess(batchId: string, user: SessionUser) {
  const resolved = await requireBatchViewAccess(batchId, user);
  if (resolved.error) return resolved;
  if (!isBatchAdmin(user)) {
    return {
      error: NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 }),
      batch: null,
    };
  }
  return { error: null, batch: resolved.batch };
}

export function instructorBatchFilter(userId: string) {
  const oid = toObjectId(userId);
  return {
    $or: [{ instructorId: oid }, { instructorIds: oid }],
  };
}

export async function instructorAccessibleBatchFilter(userId: string) {
  const base = instructorBatchFilter(userId);
  const subjectBatchIds = await BatchClass.distinct("batchId", {
    instructorId: toObjectId(userId),
    isActive: { $ne: false },
  });
  if (subjectBatchIds.length === 0) return base;
  return {
    $or: [...(base.$or as object[]), { _id: { $in: subjectBatchIds } }],
  };
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

export async function listRoutineSlotsForBatch(batchId: string) {
  ensureMongooseModelsRegistered();
  await ensureRoutineSlotsMigrated(batchId);
  const rows = await RoutineSlot.find({ batchId: toObjectId(batchId) })
    .populate("instructorId", "fullName firstName lastName email")
    .populate("batchClassId", "title")
    .sort({ dayOfWeek: 1, startTime: 1 })
    .lean();

  return rows.map((r) => mapRoutineSlot(r as Record<string, unknown>));
}
