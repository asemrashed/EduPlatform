import Batch from "@/models/Batch";
import ResourceNote, {
  type IResourceNote,
  type ResourceNoteAccessPolicy,
} from "@/models/ResourceNote";
import { isObjectId, toObjectId, type AppRole } from "@/app/api/_lib/phase12";
import { studentEnrolledBatchIds } from "@/app/api/_lib/batchAccess";
import {
  mapScopeFromRow,
  pickScopeUpdate,
  studentCanAccessBatchScopedResource,
} from "@/app/api/_lib/resourceScope";

export const VISIBLE_RESOURCE_NOTE_FILTER = { isActive: { $ne: false } };

export type ResourceNoteQuery = Record<string, unknown>;

export function trimOptionalUrl(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
}

export function parseAccessPolicy(
  value: unknown,
): ResourceNoteAccessPolicy | null {
  if (value === "public" || value === "batch") return value;
  return null;
}

export function mapResourceNote(
  row: Record<string, unknown>,
  options?: { includePdf?: boolean; canDownload?: boolean },
) {
  const includePdf = options?.includePdf ?? true;
  const base = {
    _id: String(row._id),
    title: String(row.title ?? ""),
    subject: String(row.subject ?? ""),
    topic: String(row.topic ?? ""),
    ...mapScopeFromRow(row),
    description: row.description ? String(row.description) : undefined,
    isActive: row.isActive !== false,
    accessPolicy: (row.accessPolicy === "batch" ? "batch" : "public") as ResourceNoteAccessPolicy,
    canDownload: options?.canDownload,
    uploadedBy: row.uploadedBy,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };

  if (!includePdf) return base;

  return {
    ...base,
    pdfUrl: row.pdfUrl ? String(row.pdfUrl) : undefined,
    pdfPublicId: row.pdfPublicId ? String(row.pdfPublicId) : undefined,
  };
}

export async function applyResourceNoteStaffScope(
  query: ResourceNoteQuery,
  role: AppRole | undefined,
  userId: string | undefined,
) {
  if (role === "instructor" && userId && isObjectId(userId)) {
    query.uploadedBy = toObjectId(userId);
  }
}

export async function studentCanDownloadNote(
  studentId: string | undefined,
  note:
    | Pick<IResourceNote, "accessPolicy" | "subject" | "batchId">
    | { accessPolicy?: string; subject?: string; batchId?: unknown },
): Promise<boolean> {
  if (note.accessPolicy !== "batch") return true;
  if (!studentId) return false;

  if (note.batchId) {
    return studentCanAccessBatchScopedResource(studentId, String(note.batchId));
  }

  const batchIds = await studentEnrolledBatchIds(studentId);
  if (batchIds.length === 0) return false;

  const subject = String(note.subject ?? "").trim().toLowerCase();
  if (!subject) return batchIds.length > 0;

  const batches = await Batch.find({ _id: { $in: batchIds } })
    .select("subject")
    .lean();

  return batches.some(
    (b) => String(b.subject ?? "").trim().toLowerCase() === subject,
  );
}

export async function resolveBrowseCanDownload(
  userId: string | undefined,
  role: string | undefined,
  note: { accessPolicy?: string; subject?: string },
): Promise<boolean> {
  if (note.accessPolicy !== "batch") return true;
  if (role === "admin" || role === "instructor") return true;
  return studentCanDownloadNote(userId, note);
}

export async function pickResourceNoteUpdate(body: Record<string, unknown>) {
  const update: Record<string, unknown> = {};

  if (typeof body.title === "string" && body.title.trim()) {
    update.title = body.title.trim();
  }
  if (typeof body.subject === "string" && body.subject.trim()) {
    update.subject = body.subject.trim();
  }
  if (typeof body.topic === "string" && body.topic.trim()) {
    update.topic = body.topic.trim();
  }
  if (typeof body.pdfUrl === "string" && body.pdfUrl.trim()) {
    update.pdfUrl = body.pdfUrl.trim();
  }
  if (typeof body.pdfPublicId === "string") {
    update.pdfPublicId = body.pdfPublicId.trim() || undefined;
  }
  if (typeof body.description === "string") {
    update.description = body.description.trim() || undefined;
  }
  if (typeof body.isActive === "boolean") {
    update.isActive = body.isActive;
  }
  const policy = parseAccessPolicy(body.accessPolicy);
  if (policy) {
    update.accessPolicy = policy;
  }

  Object.assign(update, await pickScopeUpdate(body));

  return update;
}

export async function assertResourceNoteStaffAccess(
  noteId: string,
  user: { id: string; role: AppRole },
) {
  if (!isObjectId(noteId)) {
    return { error: "Invalid note ID", status: 400 as const, note: null };
  }

  const note = await ResourceNote.findById(noteId).lean();
  if (!note) {
    return { error: "Resource note not found", status: 404 as const, note: null };
  }

  if (user.role === "admin") {
    return { error: null, status: null, note };
  }

  if (
    user.role === "instructor" &&
    String(note.uploadedBy ?? "") === user.id
  ) {
    return { error: null, status: null, note };
  }

  return {
    error: "You do not have permission to manage this note",
    status: 403 as const,
    note: null,
  };
}

export async function assertResourceNoteDownload(
  noteId: string,
  userId: string | undefined,
  role: string | undefined,
) {
  if (!isObjectId(noteId)) {
    return { error: "Invalid note ID", status: 400 as const, url: null };
  }

  const note = await ResourceNote.findById(noteId)
    .select("pdfUrl isActive accessPolicy subject batchId")
    .lean();

  if (!note) {
    return { error: "Resource note not found", status: 404 as const, url: null };
  }

  if (note.isActive === false) {
    return {
      error: "This note is not available",
      status: 403 as const,
      url: null,
    };
  }

  if (!note.pdfUrl?.trim()) {
    return { error: "PDF not available", status: 404 as const, url: null };
  }

  if (role === "admin" || role === "instructor") {
    return { error: null, status: null, url: note.pdfUrl.trim() };
  }

  const allowed = await studentCanDownloadNote(userId, note);
  if (!allowed) {
    return {
      error: "Enroll in a matching batch to download this note",
      status: 403 as const,
      url: null,
    };
  }

  return { error: null, status: null, url: note.pdfUrl.trim() };
}
