import ResourceWorksheet, {
  type ResourceWorksheetAccessPolicy,
} from "@/models/ResourceWorksheet";
import { isObjectId, toObjectId, type AppRole } from "@/app/api/_lib/phase12";
import {
  mapScopeFromRow,
  pickScopeUpdate,
  resolveParsedScope,
  resolveScopeLabels,
  studentCanAccessBatchScopedResource,
} from "@/app/api/_lib/resourceScope";
import Batch from "@/models/Batch";
import { studentEnrolledBatchIds } from "@/app/api/_lib/batchAccess";

export const VISIBLE_RESOURCE_WORKSHEET_FILTER = { isActive: { $ne: false } };

export function trimOptionalUrl(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
}

export function parseAccessPolicy(
  value: unknown,
): ResourceWorksheetAccessPolicy | null {
  if (value === "public" || value === "batch") return value;
  return null;
}

export function mapResourceWorksheet(
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
    sourceType: row.sourceType === "course_qb" ? "course_qb" : "upload",
    questionIds: Array.isArray(row.questionIds)
      ? (row.questionIds as unknown[]).map((id) => String(id))
      : undefined,
    isActive: row.isActive !== false,
    accessPolicy: (row.accessPolicy === "batch" ? "batch" : "public") as ResourceWorksheetAccessPolicy,
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

export async function applyResourceWorksheetStaffScope(
  query: Record<string, unknown>,
  role: AppRole | undefined,
  userId: string | undefined,
) {
  if (role === "instructor" && userId && isObjectId(userId)) {
    query.uploadedBy = toObjectId(userId);
  }
}

export async function studentCanDownloadWorksheet(
  studentId: string | undefined,
  row: { accessPolicy?: string; subject?: string; batchId?: unknown },
): Promise<boolean> {
  if (row.accessPolicy !== "batch") return true;
  if (!studentId) return false;

  if (row.batchId) {
    return studentCanAccessBatchScopedResource(studentId, String(row.batchId));
  }

  const batchIds = await studentEnrolledBatchIds(studentId);
  if (batchIds.length === 0) return false;

  const subject = String(row.subject ?? "").trim().toLowerCase();
  if (!subject) return batchIds.length > 0;

  const batches = await Batch.find({ _id: { $in: batchIds } }).select("subject").lean();
  return batches.some(
    (b) => String(b.subject ?? "").trim().toLowerCase() === subject,
  );
}

export async function resolveWorksheetBrowseCanDownload(
  userId: string | undefined,
  role: string | undefined,
  row: { accessPolicy?: string; subject?: string; batchId?: unknown },
) {
  if (row.accessPolicy !== "batch") return true;
  if (role === "admin" || role === "instructor") return true;
  return studentCanDownloadWorksheet(userId, row);
}

export async function pickResourceWorksheetUpdate(body: Record<string, unknown>) {
  const update: Record<string, unknown> = {};

  if (typeof body.title === "string" && body.title.trim()) {
    update.title = body.title.trim();
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
  if (policy) update.accessPolicy = policy;

  Object.assign(update, await pickScopeUpdate(body));

  return update;
}

export async function applyScopeLabelsToUpdate(
  body: Record<string, unknown>,
  update: Record<string, unknown>,
) {
  const scope = await resolveParsedScope(body);
  if (scope) {
    const labels = await resolveScopeLabels(scope);
    update.subject = labels.subject;
    update.topic = labels.topic;
  }
}

export async function assertResourceWorksheetStaffAccess(
  id: string,
  user: { id: string; role: AppRole },
) {
  if (!isObjectId(id)) {
    return { error: "Invalid worksheet ID", status: 400 as const, row: null };
  }

  const row = await ResourceWorksheet.findById(id).lean();
  if (!row) {
    return { error: "Worksheet not found", status: 404 as const, row: null };
  }

  if (user.role === "admin") {
    return { error: null, status: null, row };
  }

  if (user.role === "instructor" && String(row.uploadedBy ?? "") === user.id) {
    return { error: null, status: null, row };
  }

  return {
    error: "You do not have permission to manage this worksheet",
    status: 403 as const,
    row: null,
  };
}

export async function assertResourceWorksheetDownload(
  id: string,
  userId: string | undefined,
  role: string | undefined,
) {
  if (!isObjectId(id)) {
    return { error: "Invalid worksheet ID", status: 400 as const, url: null };
  }

  const row = await ResourceWorksheet.findById(id)
    .select("pdfUrl isActive accessPolicy subject batchId")
    .lean();

  if (!row) {
    return { error: "Worksheet not found", status: 404 as const, url: null };
  }

  if (row.isActive === false) {
    return { error: "This worksheet is not available", status: 403 as const, url: null };
  }

  if (!row.pdfUrl?.trim()) {
    return { error: "PDF not available", status: 404 as const, url: null };
  }

  if (role === "admin" || role === "instructor") {
    return { error: null, status: null, url: row.pdfUrl.trim() };
  }

  const allowed = await studentCanDownloadWorksheet(userId, row);
  if (!allowed) {
    return {
      error: "Enroll in a matching batch to download this worksheet",
      status: 403 as const,
      url: null,
    };
  }

  return { error: null, status: null, url: row.pdfUrl.trim() };
}
