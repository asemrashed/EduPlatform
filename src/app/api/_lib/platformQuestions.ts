import PlatformQuestion from "@/models/PlatformQuestion";
import { buildInstructorPlatformQuestionScope } from "@/app/api/_lib/platformQuestionAccess";
import type { SessionUser } from "@/app/api/_lib/phase12";
import {
  isObjectId,
  pagination,
  parseLimit,
  parsePage,
  toObjectId,
} from "@/app/api/_lib/phase12";

export function serializePlatformQuestion(doc: Record<string, unknown>) {
  return {
    ...doc,
    _id: String(doc._id),
    ownerId: doc.ownerId ? String(doc.ownerId) : undefined,
    sourceFileId: doc.sourceFileId ? String(doc.sourceFileId) : undefined,
    sourcePdfPublicId: doc.sourcePdfPublicId
      ? String(doc.sourcePdfPublicId)
      : undefined,
  };
}

/** Admin: all; instructor: own + admin QB when approved grant is active (expiresAt enforced). */
export async function buildPlatformQuestionScopeFilter(
  user: SessionUser,
): Promise<Record<string, unknown>> {
  if (user.role === "admin") return {};
  return buildInstructorPlatformQuestionScope(user.id);
}

export async function buildPlatformQuestionListFilter(
  user: SessionUser,
  searchParams: URLSearchParams,
): Promise<Record<string, unknown>> {
  const scope = await buildPlatformQuestionScopeFilter(user);
  const filter: Record<string, unknown> = { ...scope };

  const search = (searchParams.get("search") || "").trim();
  const subject = (searchParams.get("subject") || "").trim();
  const topic = (searchParams.get("topic") || "").trim();
  const subtopic = (searchParams.get("subtopic") || "").trim();
  const difficulty = (searchParams.get("difficulty") || "").trim();
  const status = (searchParams.get("status") || "").trim();
  const accessPolicy = (searchParams.get("accessPolicy") || "").trim();

  if (search) {
    const searchClause = {
      $or: [
        { questionText: { $regex: search, $options: "i" } },
        { answerText: { $regex: search, $options: "i" } },
        { tags: { $elemMatch: { $regex: search, $options: "i" } } },
      ],
    };
    if (scope.$or) {
      filter.$and = [{ $or: scope.$or as unknown[] }, searchClause];
      delete filter.$or;
    } else {
      Object.assign(filter, searchClause);
    }
  }
  if (subject) filter.subject = subject;
  if (topic) filter.topic = topic;
  if (subtopic) filter.subtopic = subtopic;
  if (difficulty && ["1", "2", "3"].includes(difficulty)) {
    filter.difficulty = Number.parseInt(difficulty, 10);
  }
  if (status === "active") filter.isActive = true;
  if (status === "inactive") filter.isActive = false;
  if (
    accessPolicy &&
    ["private", "shared_with_instructors", "public"].includes(accessPolicy)
  ) {
    filter.accessPolicy = accessPolicy;
  }

  return filter;
}

export async function listPlatformQuestions(
  user: SessionUser,
  searchParams: URLSearchParams,
) {
  const page = parsePage(searchParams);
  const limit = parseLimit(searchParams, 12, 100);
  const skip = (page - 1) * limit;
  const sortBy = (searchParams.get("sortBy") || "createdAt").trim();
  const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;
  const allowedSort = new Set([
    "createdAt",
    "updatedAt",
    "subject",
    "topic",
    "difficulty",
  ]);
  const sortField = allowedSort.has(sortBy) ? sortBy : "createdAt";
  const sort: Record<string, 1 | -1> = { [sortField]: sortOrder };

  const filter = await buildPlatformQuestionListFilter(user, searchParams);

  const [rows, total] = await Promise.all([
    PlatformQuestion.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    PlatformQuestion.countDocuments(filter),
  ]);

  return {
    questions: rows.map((r) =>
      serializePlatformQuestion(r as Record<string, unknown>),
    ),
    pagination: pagination(page, limit, total),
  };
}

export async function getPlatformQuestionSubjects(user: SessionUser) {
  const scope = await buildPlatformQuestionScopeFilter(user);
  const rows = await PlatformQuestion.aggregate([
    { $match: scope },
    {
      $group: {
        _id: { subject: "$subject", topic: "$topic" },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.subject": 1, "_id.topic": 1 } },
  ]);

  const subjectMap = new Map<string, { topic: string; count: number }[]>();
  for (const row of rows) {
    const subject = String(row._id?.subject || "").trim();
    const topic = String(row._id?.topic || "").trim();
    if (!subject) continue;
    const list = subjectMap.get(subject) || [];
    if (topic) list.push({ topic, count: row.count as number });
    subjectMap.set(subject, list);
  }

  return {
    subjects: Array.from(subjectMap.entries()).map(([subject, topics]) => ({
      subject,
      topics,
    })),
  };
}

export function instructorOwnsQuestion(
  user: SessionUser,
  doc: { ownerId?: unknown },
): boolean {
  return String(doc.ownerId) === user.id;
}

export async function canViewPlatformQuestion(
  user: SessionUser,
  questionId: string,
): Promise<{ ok: boolean; doc: Record<string, unknown> | null; readOnly?: boolean }> {
  if (!isObjectId(questionId)) return { ok: false, doc: null };
  const doc = await PlatformQuestion.findById(questionId).lean();
  if (!doc) return { ok: false, doc: null };
  if (user.role === "admin") {
    return { ok: true, doc: doc as Record<string, unknown> };
  }
  if (user.role === "instructor") {
    if (instructorOwnsQuestion(user, doc)) {
      return { ok: true, doc: doc as Record<string, unknown> };
    }
    if (doc.ownerType === "admin") {
      const scope = await buildPlatformQuestionScopeFilter(user);
      const adminAllowed =
        "$or" in scope &&
        Array.isArray(scope.$or) &&
        (scope.$or as Record<string, unknown>[]).some((c) => c.ownerType === "admin");
      if (adminAllowed) {
        return { ok: true, doc: doc as Record<string, unknown>, readOnly: true };
      }
    }
  }
  return { ok: false, doc: null };
}

export async function canMutatePlatformQuestion(
  user: SessionUser,
  questionId: string,
): Promise<{ ok: boolean; doc: Record<string, unknown> | null }> {
  const view = await canViewPlatformQuestion(user, questionId);
  if (!view.ok || !view.doc) return { ok: false, doc: null };
  if (view.readOnly) return { ok: false, doc: null };
  return { ok: true, doc: view.doc };
}

export function parseCreatePlatformQuestionBody(
  body: Record<string, unknown>,
  user: SessionUser,
) {
  const subject = String(body.subject || "").trim();
  const topic = String(body.topic || "").trim();
  const subtopic = body.subtopic ? String(body.subtopic).trim() : undefined;
  const questionText = String(body.questionText || "").trim();
  const difficulty = Number(body.difficulty);
  const options = Array.isArray(body.options) ? body.options : [];
  const answerText = body.answerText ? String(body.answerText).trim() : undefined;
  const explanation = body.explanation ? String(body.explanation).trim() : undefined;
  const hasDiagram = Boolean(body.hasDiagram);
  const diagramUrl = body.diagramUrl ? String(body.diagramUrl).trim() : undefined;
  const tags = Array.isArray(body.tags)
    ? body.tags.map((t) => String(t).trim()).filter(Boolean)
    : [];
  const isActive = body.isActive !== false;

  let accessPolicy = String(body.accessPolicy || "private");
  if (
    !["private", "shared_with_instructors", "public"].includes(accessPolicy)
  ) {
    accessPolicy = "private";
  }
  if (user.role === "instructor") {
    accessPolicy = "private";
  }

  return {
    subject,
    topic,
    subtopic,
    questionText,
    difficulty,
    options,
    answerText,
    explanation,
    hasDiagram,
    diagramUrl,
    tags,
    isActive,
    accessPolicy: accessPolicy as "private" | "shared_with_instructors" | "public",
    ownerType: user.role as "admin" | "instructor",
    ownerId: toObjectId(user.id),
    sourceType: "manual" as const,
    aiGenerated: false,
  };
}

export function validatePlatformQuestionPayload(payload: ReturnType<typeof parseCreatePlatformQuestionBody>) {
  const errors: string[] = [];
  if (!payload.subject) errors.push("Subject is required");
  if (!payload.topic) errors.push("Topic is required");
  if (!payload.questionText) errors.push("Question text is required");
  if (![1, 2, 3].includes(payload.difficulty)) errors.push("Difficulty must be 1, 2, or 3");
  const validOptions = payload.options.filter(
    (o: { text?: string }) => String(o?.text || "").trim(),
  );
  if (validOptions.length < 2) errors.push("At least two options are required");
  const hasCorrect = validOptions.some((o: { isCorrect?: boolean }) => o.isCorrect);
  if (!hasCorrect) errors.push("Mark at least one option as correct");
  return errors;
}
