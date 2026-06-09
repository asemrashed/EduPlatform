import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import RoutineSlot from "@/models/RoutineSlot";
import BatchClass from "@/models/BatchClass";
import User from "@/models/User";
import { requireBatchManageAccess } from "@/app/api/_lib/batchAccess";
import {
  notifyRoutineSlotRemoved,
  notifyRoutineSlotUpdated,
  routineSlotChangeLabels,
} from "@/app/api/_lib/scheduleNotifications";
import { mapRoutineSlot } from "@/app/api/_lib/mapBatchClass";
import { isObjectId, requireSessionUser, toObjectId } from "@/app/api/_lib/phase12";

type RouteContext = { params: Promise<{ id: string; slotId: string }> };

const INSTRUCTOR_SELECT = "fullName firstName lastName email role";

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    await connectDB();
    const auth = await requireSessionUser(["admin"]);
    if (auth.error) return auth.error;

    const { id: batchId, slotId } = await context.params;
    const access = await requireBatchManageAccess(batchId, auth.user);
    if (access.error) return access.error;

    const existing = await RoutineSlot.findOne({
      _id: toObjectId(slotId),
      batchId: toObjectId(batchId),
    }).lean();
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Routine slot not found" },
        { status: 404 },
      );
    }

    const body = (await request.json()) as Record<string, unknown>;
    const updates: Record<string, unknown> = {};

    if (typeof body.topic === "string") updates.topic = body.topic.trim();
    if (typeof body.startTime === "string") updates.startTime = body.startTime.trim();
    if (typeof body.endTime === "string") updates.endTime = body.endTime.trim();
    if (body.dayOfWeek !== undefined) {
      const dayOfWeek = Number(body.dayOfWeek);
      if (!Number.isInteger(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) {
        return NextResponse.json(
          { success: false, error: "dayOfWeek must be 0–6" },
          { status: 400 },
        );
      }
      updates.dayOfWeek = dayOfWeek;
    }
    if (body.status === "active" || body.status === "inactive") updates.status = body.status;
    if (isObjectId(body.instructorId)) {
      const instructor = await User.findById(body.instructorId).select("role").lean();
      if (!instructor || instructor.role !== "instructor") {
        return NextResponse.json(
          { success: false, error: "Instructor not found" },
          { status: 404 },
        );
      }
      updates.instructorId = toObjectId(body.instructorId);
    }
    if (body.batchClassId === null) {
      updates.batchClassId = undefined;
    } else if (isObjectId(body.batchClassId)) {
      const bc = await BatchClass.findOne({
        _id: toObjectId(body.batchClassId),
        batchId: toObjectId(batchId),
      }).lean();
      if (!bc) {
        return NextResponse.json(
          { success: false, error: "Batch class not found" },
          { status: 404 },
        );
      }
      updates.batchClassId = bc._id;
    }

    const row = await RoutineSlot.findOneAndUpdate(
      { _id: toObjectId(slotId), batchId: toObjectId(batchId) },
      { $set: updates },
      { new: true },
    )
      .populate("instructorId", INSTRUCTOR_SELECT)
      .populate("batchClassId", "title")
      .lean();

    if (!row) {
      return NextResponse.json(
        { success: false, error: "Routine slot not found" },
        { status: 404 },
      );
    }

    const changes = routineSlotChangeLabels(
      existing as Record<string, unknown>,
      row as Record<string, unknown>,
    );
    await notifyRoutineSlotUpdated(
      batchId,
      {
        _id: row._id,
        topic: String(row.topic ?? ""),
        instructorId: row.instructorId,
      },
      changes,
    );

    return NextResponse.json({
      success: true,
      data: { slot: mapRoutineSlot(row as Record<string, unknown>) },
    });
  } catch (error) {
    console.error("PATCH routine-slot", error);
    return NextResponse.json(
      { success: false, error: "Failed to update routine slot" },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    await connectDB();
    const auth = await requireSessionUser(["admin"]);
    if (auth.error) return auth.error;

    const { id: batchId, slotId } = await context.params;
    const access = await requireBatchManageAccess(batchId, auth.user);
    if (access.error) return access.error;

    const existing = await RoutineSlot.findOne({
      _id: toObjectId(slotId),
      batchId: toObjectId(batchId),
    }).lean();

    const result = await RoutineSlot.deleteOne({
      _id: toObjectId(slotId),
      batchId: toObjectId(batchId),
    });

    if (result.deletedCount === 0 || !existing) {
      return NextResponse.json(
        { success: false, error: "Routine slot not found" },
        { status: 404 },
      );
    }

    await notifyRoutineSlotRemoved(batchId, {
      _id: existing._id,
      topic: String(existing.topic ?? ""),
      instructorId: existing.instructorId,
    });

    return NextResponse.json({ success: true, data: { deleted: true } });
  } catch (error) {
    console.error("DELETE routine-slot", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete routine slot" },
      { status: 500 },
    );
  }
}
