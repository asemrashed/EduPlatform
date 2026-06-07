import type { SubjectLessonType } from "@/models/SubjectLesson";

export function mapSubjectModule(row: Record<string, unknown>) {
  return {
    _id: String(row._id),
    batchId: String(row.batchId),
    subjectId: String(row.subjectId),
    title: String(row.title ?? ""),
    description: row.description ? String(row.description) : undefined,
    order: Number(row.order) || 1,
    isPublished: row.isPublished !== false,
    createdAt: (row.createdAt as Date)?.toISOString?.() ?? row.createdAt,
    updatedAt: (row.updatedAt as Date)?.toISOString?.() ?? row.updatedAt,
  };
}

export function mapSubjectLesson(row: Record<string, unknown>) {
  const scheduledAt = row.scheduledAt as Date | undefined;
  return {
    _id: String(row._id),
    batchId: String(row.batchId),
    subjectId: String(row.subjectId),
    moduleId: String(row.moduleId),
    title: String(row.title ?? ""),
    description: row.description ? String(row.description) : undefined,
    order: Number(row.order) || 1,
    type: (row.type === "live" ? "live" : "recorded") as SubjectLessonType,
    scheduledAt: scheduledAt?.toISOString?.() ?? scheduledAt,
    durationMinutes:
      row.durationMinutes != null ? Number(row.durationMinutes) : undefined,
    meetLink: row.meetLink ? String(row.meetLink) : undefined,
    recordingUrl: row.recordingUrl ? String(row.recordingUrl) : undefined,
    videoUrl: row.videoUrl ? String(row.videoUrl) : undefined,
    youtubeVideoId: row.youtubeVideoId ? String(row.youtubeVideoId) : undefined,
    liveClassId: row.liveClassId ? String(row.liveClassId) : undefined,
    isPublished: row.isPublished !== false,
    createdAt: (row.createdAt as Date)?.toISOString?.() ?? row.createdAt,
    updatedAt: (row.updatedAt as Date)?.toISOString?.() ?? row.updatedAt,
  };
}
