import Batch from "@/models/Batch";
import BatchClass from "@/models/BatchClass";
import Course from "@/models/Course";
import Lesson from "@/models/Lesson";
import SubjectLesson from "@/models/SubjectLesson";
import SubjectModule from "@/models/SubjectModule";
import { hasActiveBatchEnrollment } from "@/app/api/_lib/batchAccess";
import { isObjectId, toObjectId } from "@/app/api/_lib/phase12";
import type { ResourceScopeType } from "@/types/resourceScope";

export type ParsedResourceScope = {
  scopeType: ResourceScopeType;
  batchId?: string;
  batchClassId?: string;
  subjectModuleId?: string;
  subjectLessonId?: string;
  courseId?: string;
  chapterId?: string;
  lessonId?: string;
};

export function parseScopeType(value: unknown): ResourceScopeType | null {
  if (value === "batch" || value === "course") return value;
  return null;
}

export function parseScopeIds(body: Record<string, unknown>): ParsedResourceScope | null {
  const scopeType = parseScopeType(body.scopeType);
  if (!scopeType) return null;

  const readId = (key: string) => {
    const raw = body[key];
    return typeof raw === "string" && isObjectId(raw.trim()) ? raw.trim() : undefined;
  };

  if (scopeType === "batch") {
    const batchId = readId("batchId");
    const batchClassId = readId("batchClassId");
    const subjectModuleId = readId("subjectModuleId");
    const subjectLessonId = readId("subjectLessonId");
    if (!batchId || !subjectModuleId || !subjectLessonId) {
      return null;
    }
    return {
      scopeType,
      batchId,
      batchClassId,
      subjectModuleId,
      subjectLessonId,
    };
  }

  const courseId = readId("courseId");
  const chapterId = readId("chapterId");
  const lessonId = readId("lessonId");
  if (!courseId || !chapterId || !lessonId) return null;

  return { scopeType, courseId, chapterId, lessonId };
}

export async function resolveScopeLabels(scope: ParsedResourceScope) {
  if (scope.scopeType === "batch") {
    const [batch, subject, module, lesson] = await Promise.all([
      Batch.findById(scope.batchId).select("name subject").lean(),
      BatchClass.findById(scope.batchClassId).select("title").lean(),
      SubjectModule.findById(scope.subjectModuleId).select("title").lean(),
      SubjectLesson.findById(scope.subjectLessonId).select("title").lean(),
    ]);

    const subjectLabel = subject?.title || batch?.subject || "Subject";
    const moduleLabel = module?.title || "Module";
    const lessonLabel = lesson?.title || "Lesson";

    return {
      subject: batch?.name || batch?.subject || "Batch",
      topic: `${subjectLabel} · ${moduleLabel} · ${lessonLabel}`,
    };
  }

  const [course, lesson] = await Promise.all([
    Course.findById(scope.courseId).select("title").lean(),
    Lesson.findById(scope.lessonId).select("title").lean(),
  ]);

  return {
    subject: course?.title || "Course",
    topic: lesson?.title || "Lesson",
  };
}

export async function studentCanAccessBatchScopedResource(
  studentId: string | undefined,
  batchId: string | undefined,
): Promise<boolean> {
  if (!studentId || !batchId || !isObjectId(batchId)) return false;
  return hasActiveBatchEnrollment(batchId, studentId);
}

export function scopeFieldsToDoc(scope: ParsedResourceScope) {
  if (scope.scopeType === "batch") {
    return {
      scopeType: "batch" as const,
      batchId: toObjectId(scope.batchId!),
      batchClassId: toObjectId(scope.batchClassId!),
      subjectModuleId: toObjectId(scope.subjectModuleId!),
      subjectLessonId: toObjectId(scope.subjectLessonId!),
      courseId: undefined,
      chapterId: undefined,
      lessonId: undefined,
    };
  }

  return {
    scopeType: "course" as const,
    batchId: undefined,
    batchClassId: undefined,
    subjectModuleId: undefined,
    subjectLessonId: undefined,
    courseId: toObjectId(scope.courseId!),
    chapterId: toObjectId(scope.chapterId!),
    lessonId: toObjectId(scope.lessonId!),
  };
}

export function mapScopeFromRow(row: Record<string, unknown>) {
  const scopeType =
    row.scopeType === "course" ? ("course" as const) : ("batch" as const);

  const idOf = (key: string) => {
    const val = row[key];
    if (!val) return undefined;
    if (typeof val === "object" && val && "_id" in (val as object)) {
      return String((val as { _id: unknown })._id);
    }
    return String(val);
  };

  return {
    scopeType,
    batchId: idOf("batchId"),
    batchClassId: idOf("batchClassId"),
    subjectModuleId: idOf("subjectModuleId"),
    subjectLessonId: idOf("subjectLessonId"),
    courseId: idOf("courseId"),
    chapterId: idOf("chapterId"),
    lessonId: idOf("lessonId"),
    batch: row.batchId,
    batchClass: row.batchClassId,
    subjectModule: row.subjectModuleId,
    subjectLesson: row.subjectLessonId,
    course: row.courseId,
    chapter: row.chapterId,
    lesson: row.lessonId,
  };
}

export async function resolveParsedScope(
  body: Record<string, unknown>,
): Promise<ParsedResourceScope | null> {
  const parsed = parseScopeIds(body);
  if (!parsed) return null;

  if (parsed.scopeType === "batch") {
    if (parsed.batchClassId) return parsed;
    const mod = await SubjectModule.findById(parsed.subjectModuleId)
      .select("subjectId")
      .lean();
    const batchClassId = mod?.subjectId ? String(mod.subjectId) : undefined;
    if (!batchClassId) return null;
    return { ...parsed, batchClassId };
  }

  return parsed;
}

export async function pickScopeUpdate(body: Record<string, unknown>) {
  const parsed = await resolveParsedScope(body);
  if (!parsed) return {};
  return scopeFieldsToDoc(parsed);
}
