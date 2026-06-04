import { getInstructorDisplayName } from "@/app/api/_lib/instructorProfile";
import { buildWeeklyRoutineFromSlots } from "@/app/api/_lib/batchAccess";
import { resolveBatchInstructorIds } from "@/app/api/_lib/batchInstructors";
import { normalizeBatchGrade } from "@/lib/batchGrades";

export type PublicBatchRow = {
  _id: string;
  name: string;
  subject: string;
  grade: string;
  startDate: string;
  endDate: string;
  fee: number;
  maxStudents: number;
  enrolledCount: number;
  seatsRemaining: number;
  isFull: boolean;
  shortDescription: string;
  thumbnailUrl: string;
  videoUrl?: string;
  features: string[];
  description?: string;
  instructorIds: string[];
  instructorName: string;
  instructorAvatar?: string;
};

export function mapPublicBatch(
  row: Record<string, unknown>,
  enrolledCount: number,
): PublicBatchRow {
  const maxStudents = Number(row.maxStudents) || 0;
  const instructor = row.instructorId as Record<string, unknown> | null;
  const instructorPopulated =
    instructor && typeof instructor === "object" && "_id" in instructor;

  const description =
    typeof row.description === "string" ? row.description : undefined;
  const shortDescription =
    typeof row.shortDescription === "string" && row.shortDescription.trim()
      ? row.shortDescription.trim()
      : description
        ? description.slice(0, 160)
        : String(row.name ?? "");

  const grade = normalizeBatchGrade(
    row.grade ?? (typeof row.category === "string" ? row.category : undefined),
  );

  return {
    _id: String(row._id),
    name: String(row.name ?? ""),
    subject: String(row.subject ?? ""),
    grade,
    startDate:
      (row.startDate as Date)?.toISOString?.() ?? String(row.startDate ?? ""),
    endDate:
      (row.endDate as Date)?.toISOString?.() ?? String(row.endDate ?? ""),
    fee: Number(row.fee) || 0,
    maxStudents,
    enrolledCount,
    seatsRemaining: Math.max(0, maxStudents - enrolledCount),
    isFull: enrolledCount >= maxStudents && maxStudents > 0,
    shortDescription,
    thumbnailUrl:
      typeof row.thumbnailUrl === "string" && row.thumbnailUrl.trim()
        ? row.thumbnailUrl.trim()
        : "",
    videoUrl:
      typeof row.videoUrl === "string" && row.videoUrl.trim()
        ? row.videoUrl.trim()
        : undefined,
    features: Array.isArray(row.features)
      ? row.features.map((f) => String(f)).filter(Boolean)
      : [],
    description,
    instructorIds: resolveBatchInstructorIds(row),
    instructorName: instructorPopulated
      ? getInstructorDisplayName(instructor)
      : "Instructor",
    instructorAvatar:
      instructorPopulated && instructor.avatar
        ? String(instructor.avatar)
        : undefined,
  };
}

export function publicBatchDetailExtras(
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
  return {
    routine: buildWeeklyRoutineFromSlots(slots),
  };
}
