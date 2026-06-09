import mongoose from "mongoose";
import Batch from "@/models/Batch";
import BatchClass from "@/models/BatchClass";
import Notice, { type NoticeCategory } from "@/models/Notice";
import {
  instructorAccessibleBatchFilter,
  studentEnrolledBatchIds,
} from "@/app/api/_lib/batchAccess";
import {
  isObjectId,
  pagination,
  toObjectId,
  type AppRole,
  type SessionUser,
} from "@/app/api/_lib/phase12";

const AUTHOR_SELECT = "fullName firstName lastName email role";
const INSTRUCTOR_SELECT = "fullName firstName lastName email";
const BATCH_SELECT = "name subject grade";

export function parseNoticeCategory(value: unknown): NoticeCategory | null {
  if (value === "admin" || value === "subject" || value === "teacher") {
    return value;
  }
  return null;
}

export function mapAuthor(user: Record<string, unknown> | null | undefined) {
  if (!user || typeof user !== "object") {
    return { _id: "", name: "", email: "" };
  }
  const first = String(user.firstName ?? "").trim();
  const last = String(user.lastName ?? "").trim();
  const full = String(user.fullName ?? "").trim();
  const name = full || [first, last].filter(Boolean).join(" ") || "Staff";
  return {
    _id: String(user._id ?? ""),
    name,
    email: String(user.email ?? ""),
    role: user.role ? String(user.role) : undefined,
  };
}

export function mapNotice(row: Record<string, unknown>) {
  const postedBy =
    row.postedBy && typeof row.postedBy === "object"
      ? mapAuthor(row.postedBy as Record<string, unknown>)
      : { _id: String(row.postedBy ?? ""), name: "", email: "" };

  const instructor =
    row.instructorId && typeof row.instructorId === "object"
      ? mapAuthor(row.instructorId as Record<string, unknown>)
      : row.instructorId
        ? { _id: String(row.instructorId), name: "", email: "" }
        : undefined;

  const batch =
    row.batchId && typeof row.batchId === "object"
      ? {
          _id: String((row.batchId as { _id: unknown })._id ?? ""),
          name: String((row.batchId as { name?: unknown }).name ?? ""),
          subject: String((row.batchId as { subject?: unknown }).subject ?? ""),
        }
      : row.batchId
        ? { _id: String(row.batchId), name: "", subject: "" }
        : undefined;

  return {
    _id: String(row._id ?? ""),
    title: String(row.title ?? ""),
    body: String(row.body ?? ""),
    category: String(row.category ?? "") as NoticeCategory,
    subject: row.subject ? String(row.subject) : undefined,
    instructor,
    batch,
    postedBy,
    authorRole: String(row.authorRole ?? ""),
    isActive: Boolean(row.isActive),
    isPinned: Boolean(row.isPinned),
    expiresAt:
      row.expiresAt instanceof Date
        ? row.expiresAt.toISOString()
        : row.expiresAt
          ? String(row.expiresAt)
          : undefined,
    createdAt:
      row.createdAt instanceof Date
        ? row.createdAt.toISOString()
        : String(row.createdAt ?? ""),
    updatedAt:
      row.updatedAt instanceof Date
        ? row.updatedAt.toISOString()
        : String(row.updatedAt ?? ""),
  };
}

function notExpiredFilter() {
  const now = new Date();
  return {
    $or: [{ expiresAt: { $exists: false } }, { expiresAt: null }, { expiresAt: { $gt: now } }],
  };
}

async function instructorSubjectLabels(userId: string): Promise<string[]> {
  const batchFilter = await instructorAccessibleBatchFilter(userId);
  const batches = await Batch.find(batchFilter).select("subject name").lean();
  const classRows = await BatchClass.find({
    instructorId: toObjectId(userId),
    isActive: { $ne: false },
  })
    .select("title")
    .lean();

  const labels = new Set<string>();
  for (const batch of batches) {
    const subject = String(batch.subject ?? "").trim();
    if (subject) labels.add(subject);
    const name = String(batch.name ?? "").trim();
    if (name) labels.add(name);
  }
  for (const row of classRows) {
    const title = String(row.title ?? "").trim();
    if (title) labels.add(title);
  }
  return [...labels];
}

function pushAndClause(query: Record<string, unknown>, clause: Record<string, unknown>) {
  const existing = Array.isArray(query.$and) ? (query.$and as Record<string, unknown>[]) : [];
  query.$and = [...existing, clause];
}

export async function applyNoticeStaffListScope(
  query: Record<string, unknown>,
  user: SessionUser,
) {
  if (user.role === "admin") return;

  const subjectLabels = await instructorSubjectLabels(user.id);
  const subjectRegexes = subjectLabels.map((label) => ({
    subject: { $regex: `^${escapeRegex(label)}$`, $options: "i" },
  }));

  pushAndClause(query, {
    $or: [
      { postedBy: toObjectId(user.id) },
      { category: "teacher", instructorId: toObjectId(user.id) },
      ...(subjectRegexes.length > 0
        ? [{ category: "subject", $or: subjectRegexes }]
        : []),
    ],
  });
}

export async function applyNoticeStudentListScope(
  query: Record<string, unknown>,
  studentId: string,
) {
  const batchIds = await studentEnrolledBatchIds(studentId);
  if (batchIds.length === 0) {
    pushAndClause(query, { category: "admin" });
    pushAndClause(query, notExpiredFilter());
    return;
  }

  const batches = await Batch.find({ _id: { $in: batchIds } })
    .select("subject instructorIds instructorId")
    .lean();

  const batchIdStrings = batchIds.map(String);
  const subjects = new Set<string>();
  const instructorIds = new Set<string>();

  for (const batch of batches) {
    const subject = String(batch.subject ?? "").trim();
    if (subject) subjects.add(subject);
    if (batch.instructorId) instructorIds.add(String(batch.instructorId));
    if (Array.isArray(batch.instructorIds)) {
      for (const id of batch.instructorIds) {
        instructorIds.add(String(id));
      }
    }
  }

  const classRows = await BatchClass.find({
    batchId: { $in: batchIds },
    isActive: { $ne: false },
  })
    .select("title instructorId")
    .lean();

  for (const row of classRows) {
    const title = String(row.title ?? "").trim();
    if (title) subjects.add(title);
    if (row.instructorId) instructorIds.add(String(row.instructorId));
  }

  const subjectMatchers = [...subjects].map((label) => ({
    subject: { $regex: `^${escapeRegex(label)}$`, $options: "i" },
  }));

  const visibilityOr: Record<string, unknown>[] = [{ category: "admin" }];

  if (subjectMatchers.length > 0) {
    visibilityOr.push({
      category: "subject",
      $or: subjectMatchers,
    });
  }

  if (instructorIds.size > 0) {
    visibilityOr.push({
      category: "teacher",
      instructorId: { $in: [...instructorIds].map((id) => toObjectId(id)) },
    });
  }

  visibilityOr.push({
    batchId: { $in: batchIdStrings.map((id) => toObjectId(id)) },
  });

  pushAndClause(query, { $or: visibilityOr });
  pushAndClause(query, notExpiredFilter());
}

export async function assertNoticeWriteAccess(
  notice: { postedBy?: unknown; category?: string; instructorId?: unknown },
  user: SessionUser,
): Promise<{ error?: string; status?: number }> {
  if (user.role === "admin") return {};

  const postedById = String(notice.postedBy ?? "");
  if (postedById === user.id) return {};

  if (
    notice.category === "teacher" &&
    String(notice.instructorId ?? "") === user.id
  ) {
    return {};
  }

  return { error: "Forbidden", status: 403 };
}

export async function validateNoticeCreateBody(
  body: Record<string, unknown>,
  user: SessionUser,
): Promise<
  | { error: string; status: number }
  | {
      doc: {
        title: string;
        body: string;
        category: NoticeCategory;
        subject?: string;
        instructorId?: mongoose.Types.ObjectId;
        batchId?: mongoose.Types.ObjectId;
        postedBy: mongoose.Types.ObjectId;
        authorRole: "admin" | "instructor";
        isActive: boolean;
        isPinned: boolean;
        expiresAt?: Date;
      };
    }
> {
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const noticeBody = typeof body.body === "string" ? body.body.trim() : "";
  const category = parseNoticeCategory(body.category);

  if (!title || !noticeBody || !category) {
    return {
      error: "Title, body, and category (admin|subject|teacher) are required",
      status: 400,
    };
  }

  if (category === "admin" && user.role !== "admin") {
    return { error: "Only admins can post admin notices", status: 403 };
  }

  let subject =
    typeof body.subject === "string" ? body.subject.trim() : undefined;
  let instructorId: mongoose.Types.ObjectId | undefined;
  let batchId: mongoose.Types.ObjectId | undefined;

  if (category === "subject") {
    if (!subject) {
      return { error: "Subject is required for subject notices", status: 400 };
    }
    if (user.role === "instructor") {
      const allowed = await instructorSubjectLabels(user.id);
      const match = allowed.some(
        (label) => label.toLowerCase() === subject!.toLowerCase(),
      );
      if (!match) {
        return {
          error: "You can only post subject notices for your assigned subjects",
          status: 403,
        };
      }
    }
  }

  if (category === "teacher") {
    const rawInstructor =
      typeof body.instructorId === "string" ? body.instructorId.trim() : "";
    if (user.role === "admin") {
      if (rawInstructor && isObjectId(rawInstructor)) {
        instructorId = toObjectId(rawInstructor);
      } else if (rawInstructor) {
        return { error: "Invalid instructorId", status: 400 };
      } else {
        return { error: "instructorId is required for teacher notices", status: 400 };
      }
    } else {
      instructorId = toObjectId(user.id);
    }
  }

  if (typeof body.batchId === "string" && body.batchId.trim()) {
    if (!isObjectId(body.batchId.trim())) {
      return { error: "Invalid batchId", status: 400 };
    }
    batchId = toObjectId(body.batchId.trim());
    if (user.role === "instructor") {
      const batchFilter = await instructorAccessibleBatchFilter(user.id);
      const batch = await Batch.findOne({
        _id: batchId,
        ...batchFilter,
      }).lean();
      if (!batch) {
        return { error: "Batch not found or not accessible", status: 403 };
      }
    }
  }

  const isActive = typeof body.isActive === "boolean" ? body.isActive : true;
  const isPinned = typeof body.isPinned === "boolean" ? body.isPinned : false;

  let expiresAt: Date | undefined;
  if (typeof body.expiresAt === "string" && body.expiresAt.trim()) {
    const parsed = new Date(body.expiresAt);
    if (Number.isNaN(parsed.getTime())) {
      return { error: "Invalid expiresAt", status: 400 };
    }
    expiresAt = parsed;
  }

  return {
    doc: {
      title,
      body: noticeBody,
      category,
      subject: category === "subject" ? subject : undefined,
      instructorId: category === "teacher" ? instructorId : undefined,
      batchId,
      postedBy: toObjectId(user.id),
      authorRole: user.role === "admin" ? "admin" : "instructor",
      isActive,
      isPinned: user.role === "admin" ? isPinned : false,
      expiresAt,
    },
  };
}

export function pickNoticeUpdate(body: Record<string, unknown>) {
  const update: Record<string, unknown> = {};

  if (typeof body.title === "string") {
    const title = body.title.trim();
    if (title) update.title = title;
  }
  if (typeof body.body === "string") {
    const noticeBody = body.body.trim();
    if (noticeBody) update.body = noticeBody;
  }
  if (typeof body.isActive === "boolean") update.isActive = body.isActive;
  if (typeof body.isPinned === "boolean") update.isPinned = body.isPinned;
  if (typeof body.expiresAt === "string") {
    if (!body.expiresAt.trim()) {
      update.expiresAt = null;
    } else {
      const parsed = new Date(body.expiresAt);
      if (!Number.isNaN(parsed.getTime())) update.expiresAt = parsed;
    }
  }
  if (typeof body.subject === "string" && body.subject.trim()) {
    update.subject = body.subject.trim();
  }

  return update;
}

export async function getNoticeById(id: string) {
  if (!isObjectId(id)) return null;
  return Notice.findById(id)
    .populate("postedBy", AUTHOR_SELECT)
    .populate("instructorId", INSTRUCTOR_SELECT)
    .populate("batchId", BATCH_SELECT)
    .lean();
}

export function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export { pagination, type AppRole };
