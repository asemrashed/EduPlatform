import { NextRequest, NextResponse } from "next/server";
import LiveClass from "@/models/LiveClass";
import {
  removeLiveClassFromBatchRoutine,
  syncLiveClassToBatchRoutine,
  type ClassRecurrence,
} from "@/app/api/_lib/batchRoutineSync";
import { requireBatchManageAccess, requireBatchViewAccess } from "@/app/api/_lib/batchAccess";
import { isObjectId, requireSessionUser, toObjectId } from "@/app/api/_lib/phase12";

function parseRecurrence(value: unknown): ClassRecurrence {
  if (value === "weekly" || value === "monthly") return value;
  return "once";
}

type RouteContext = { params: Promise<{ id: string; liveClassId: string }> };

function mapLiveClass(row: Record<string, unknown>) {
  return {
    _id: String(row._id),
    batchId: String(row.batchId),
    title: row.title,
    scheduledAt: (row.scheduledAt as Date)?.toISOString?.() ?? row.scheduledAt,
    durationMinutes: row.durationMinutes,
    recurrence: row.recurrence || "once",
    meetLink: row.meetLink || undefined,
    recordingUrl: row.recordingUrl || undefined,
    type: row.type,
    isActive: Boolean(row.isActive),
    joinUrl:
      row.type === "recorded" && row.recordingUrl
        ? row.recordingUrl
        : row.meetLink || undefined,
    createdAt: (row.createdAt as Date)?.toISOString?.() ?? row.createdAt,
    updatedAt: (row.updatedAt as Date)?.toISOString?.() ?? row.updatedAt,
  };
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const auth = await requireSessionUser(["admin", "instructor", "student"]);
    if (auth.error) return auth.error;

    const { id: batchId, liveClassId } = await context.params;
    if (!isObjectId(liveClassId)) {
      return NextResponse.json(
        { success: false, error: "Invalid live class id" },
        { status: 400 },
      );
    }

    const access = await requireBatchViewAccess(batchId, auth.user);
    if (access.error) return access.error;

    const liveClass = await LiveClass.findOne({
      _id: liveClassId,
      batchId: toObjectId(batchId),
    }).lean();

    if (!liveClass) {
      return NextResponse.json(
        { success: false, error: "Live class not found" },
        { status: 404 },
      );
    }

    if (auth.user.role === "student" && !liveClass.isActive) {
      return NextResponse.json(
        { success: false, error: "Live class not available" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: { liveClass: mapLiveClass(liveClass as Record<string, unknown>) },
    });
  } catch (error) {
    console.error("GET live-class", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch live class" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const auth = await requireSessionUser(["admin"]);
    if (auth.error) return auth.error;

    const { id: batchId, liveClassId } = await context.params;
    const access = await requireBatchManageAccess(batchId, auth.user);
    if (access.error) return access.error;

    const body = (await request.json()) as Record<string, unknown>;
    const updates: Record<string, unknown> = {};

    if (typeof body.title === "string") updates.title = body.title.trim();
    if (body.scheduledAt) updates.scheduledAt = new Date(String(body.scheduledAt));
    if (body.durationMinutes !== undefined) {
      updates.durationMinutes = Number(body.durationMinutes);
    }
    if (typeof body.meetLink === "string") updates.meetLink = body.meetLink.trim();
    if (typeof body.recordingUrl === "string") {
      updates.recordingUrl = body.recordingUrl.trim();
    }
    if (body.type === "live" || body.type === "recorded") updates.type = body.type;
    if (typeof body.isActive === "boolean") updates.isActive = body.isActive;
    if (body.recurrence !== undefined) {
      updates.recurrence = parseRecurrence(body.recurrence);
    }

    const liveClass = await LiveClass.findOneAndUpdate(
      { _id: liveClassId, batchId: toObjectId(batchId) },
      { $set: updates },
      { new: true },
    ).lean();

    if (!liveClass) {
      return NextResponse.json(
        { success: false, error: "Live class not found" },
        { status: 404 },
      );
    }

    const recurrence = parseRecurrence(liveClass.recurrence);
    await syncLiveClassToBatchRoutine(batchId, liveClass, recurrence);

    return NextResponse.json({
      success: true,
      data: { liveClass: mapLiveClass(liveClass as Record<string, unknown>) },
    });
  } catch (error) {
    console.error("PATCH live-class", error);
    return NextResponse.json(
      { success: false, error: "Failed to update live class" },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const auth = await requireSessionUser(["admin"]);
    if (auth.error) return auth.error;

    const { id: batchId, liveClassId } = await context.params;
    const access = await requireBatchManageAccess(batchId, auth.user);
    if (access.error) return access.error;

    const liveClass = await LiveClass.findOneAndUpdate(
      { _id: liveClassId, batchId: toObjectId(batchId) },
      { $set: { isActive: false } },
      { new: true },
    ).lean();

    if (!liveClass) {
      return NextResponse.json(
        { success: false, error: "Live class not found" },
        { status: 404 },
      );
    }

    await removeLiveClassFromBatchRoutine(batchId, liveClassId);

    return NextResponse.json({ success: true, data: { deactivated: true } });
  } catch (error) {
    console.error("DELETE live-class", error);
    return NextResponse.json(
      { success: false, error: "Failed to deactivate live class" },
      { status: 500 },
    );
  }
}
