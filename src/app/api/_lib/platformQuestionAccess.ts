import QBAccessRequest from "@/models/QBAccessRequest";
import type { SessionUser } from "@/app/api/_lib/phase12";
import {
  isObjectId,
  pagination,
  parseLimit,
  parsePage,
  toObjectId,
} from "@/app/api/_lib/phase12";

/** Approved grant that has not passed `expiresAt` (if set). */
export function activeAccessGrantQuery(requesterId: string) {
  const now = new Date();
  return {
    requesterId: toObjectId(requesterId),
    status: "approved",
    $or: [{ expiresAt: { $exists: false } }, { expiresAt: null }, { expiresAt: { $gt: now } }],
  };
}

export async function instructorHasActiveAdminQBAccess(requesterId: string): Promise<boolean> {
  const doc = await QBAccessRequest.findOne(activeAccessGrantQuery(requesterId))
    .select("_id")
    .lean();
  return Boolean(doc);
}

export async function buildInstructorPlatformQuestionScope(
  userId: string,
): Promise<Record<string, unknown>> {
  const ownId = toObjectId(userId);
  const hasGrant = await instructorHasActiveAdminQBAccess(userId);
  if (!hasGrant) {
    return { ownerId: ownId };
  }
  return {
    $or: [{ ownerId: ownId }, { ownerType: "admin" }],
  };
}

export function serializeAccessRequest(doc: Record<string, unknown>) {
  const requester = doc.requesterId as Record<string, unknown> | undefined;
  const requesterName =
    requester && typeof requester === "object" && "name" in requester
      ? String(requester.name || "")
      : undefined;
  return {
    ...doc,
    _id: String(doc._id),
    requesterId:
      requester && typeof requester === "object" && "_id" in requester
        ? String(requester._id)
        : String(doc.requesterId),
    requesterName,
    grantedAt: doc.grantedAt ? new Date(String(doc.grantedAt)).toISOString() : undefined,
    expiresAt: doc.expiresAt ? new Date(String(doc.expiresAt)).toISOString() : undefined,
    createdAt: doc.createdAt ? new Date(String(doc.createdAt)).toISOString() : undefined,
    updatedAt: doc.updatedAt ? new Date(String(doc.updatedAt)).toISOString() : undefined,
  };
}

export async function listAccessRequests(user: SessionUser, searchParams: URLSearchParams) {
  const page = parsePage(searchParams);
  const limit = parseLimit(searchParams, 20, 100);
  const skip = (page - 1) * limit;
  const status = (searchParams.get("status") || "").trim();

  const filter: Record<string, unknown> = {};
  if (user.role === "instructor") {
    filter.requesterId = toObjectId(user.id);
  }
  if (status && ["pending", "approved", "rejected"].includes(status)) {
    filter.status = status;
  }

  const [rows, total] = await Promise.all([
    QBAccessRequest.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("requesterId", "name email role")
      .lean(),
    QBAccessRequest.countDocuments(filter),
  ]);

  return {
    requests: rows.map((r) => serializeAccessRequest(r as Record<string, unknown>)),
    pagination: pagination(page, limit, total),
  };
}

export async function getInstructorAccessSummary(requesterId: string) {
  const [active, latestPending] = await Promise.all([
    QBAccessRequest.findOne(activeAccessGrantQuery(requesterId)).sort({ grantedAt: -1 }).lean(),
    QBAccessRequest.findOne({ requesterId: toObjectId(requesterId), status: "pending" })
      .sort({ createdAt: -1 })
      .lean(),
  ]);

  return {
    hasActiveGrant: Boolean(active),
    activeGrant: active
      ? serializeAccessRequest(active as Record<string, unknown>)
      : null,
    pendingRequest: latestPending
      ? serializeAccessRequest(latestPending as Record<string, unknown>)
      : null,
  };
}

export async function createAccessRequest(
  user: SessionUser,
  body: Record<string, unknown>,
) {
  const existingPending = await QBAccessRequest.findOne({
    requesterId: toObjectId(user.id),
    status: "pending",
  }).lean();
  if (existingPending) {
    return { error: "You already have a pending access request", status: 409 as const };
  }

  const active = await QBAccessRequest.findOne(activeAccessGrantQuery(user.id)).lean();
  if (active) {
    return { error: "You already have active access to the admin question bank", status: 409 as const };
  }

  const note = body.note ? String(body.note).trim() : undefined;
  const isPaid = Boolean(body.isPaid);
  const amount =
    body.amount != null && Number.isFinite(Number(body.amount))
      ? Math.max(0, Number(body.amount))
      : undefined;

  const doc = await QBAccessRequest.create({
    requesterId: toObjectId(user.id),
    status: "pending",
    isPaid,
    amount,
    note,
  });

  return { doc: serializeAccessRequest(doc.toObject() as Record<string, unknown>) };
}

export async function patchAccessRequest(
  adminUser: SessionUser,
  requestId: string,
  body: Record<string, unknown>,
) {
  if (!isObjectId(requestId)) {
    return { error: "Invalid request id", status: 400 as const };
  }

  const doc = await QBAccessRequest.findById(requestId);
  if (!doc) {
    return { error: "Access request not found", status: 404 as const };
  }

  const status = body.status ? String(body.status) : "";
  if (!["approved", "rejected"].includes(status)) {
    return { error: "status must be approved or rejected", status: 400 as const };
  }

  doc.status = status as "approved" | "rejected";
  if (body.note !== undefined) {
    doc.note = String(body.note || "").trim() || undefined;
  }

  if (status === "approved") {
    doc.grantedAt = new Date();
    if (body.expiresAt) {
      const exp = new Date(String(body.expiresAt));
      if (!Number.isNaN(exp.getTime())) doc.expiresAt = exp;
    } else if (body.expiresInDays != null) {
      const days = Number.parseInt(String(body.expiresInDays), 10);
      if (Number.isFinite(days) && days > 0) {
        doc.expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
      }
    } else {
      doc.expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
    }
  } else {
    doc.grantedAt = undefined;
    doc.expiresAt = undefined;
  }

  await doc.save();
  await doc.populate("requesterId", "name email role");
  return { doc: serializeAccessRequest(doc.toObject() as Record<string, unknown>) };
}
