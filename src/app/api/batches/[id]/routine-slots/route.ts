import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import RoutineSlot from "@/models/RoutineSlot";
import BatchClass from "@/models/BatchClass";
import User from "@/models/User";
import {
  buildWeeklyRoutineFromSlots,
  listRoutineSlotsForBatch,
  requireBatchManageAccess,
  requireBatchViewAccess,
} from "@/app/api/_lib/batchAccess";
import { mapRoutineSlot } from "@/app/api/_lib/mapBatchClass";
import { isObjectId, requireSessionUser, toObjectId } from "@/app/api/_lib/phase12";

type RouteContext = { params: Promise<{ id: string }> };

const INSTRUCTOR_SELECT = "fullName firstName lastName email role";

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    await connectDB();
    const auth = await requireSessionUser(["admin", "instructor", "student"]);
    if (auth.error) return auth.error;

    const { id: batchId } = await context.params;
    const access = await requireBatchViewAccess(batchId, auth.user);
    if (access.error) return access.error;

    const batchClassId = request.nextUrl.searchParams.get("batchClassId")?.trim();
    let slots = await listRoutineSlotsForBatch(batchId);
    if (batchClassId && isObjectId(batchClassId)) {
      slots = slots.filter((s) => String(s.batchClassId ?? "") === batchClassId);
    }

    return NextResponse.json({
      success: true,
      data: {
        batchId,
        slots,
        weekly: buildWeeklyRoutineFromSlots(slots),
        canManage: access.canManage,
      },
    });
  } catch (error) {
    console.error("GET routine-slots", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch routine slots" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    await connectDB();
    const auth = await requireSessionUser(["admin", "instructor"]);
    if (auth.error) return auth.error;

    const { id: batchId } = await context.params;
    const access = await requireBatchManageAccess(batchId, auth.user);
    if (access.error) return access.error;

    const body = (await request.json()) as Record<string, unknown>;
    const topic = typeof body.topic === "string" ? body.topic.trim() : "";
    const startTime = typeof body.startTime === "string" ? body.startTime.trim() : "";
    const endTime = typeof body.endTime === "string" ? body.endTime.trim() : "";
    const dayOfWeek = Number(body.dayOfWeek);

    if (!topic || !startTime || !endTime) {
      return NextResponse.json(
        { success: false, error: "topic, startTime, and endTime are required" },
        { status: 400 },
      );
    }

    if (!Number.isInteger(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) {
      return NextResponse.json(
        { success: false, error: "dayOfWeek must be 0–6" },
        { status: 400 },
      );
    }

    if (!isObjectId(body.instructorId)) {
      return NextResponse.json(
        { success: false, error: "Valid instructorId is required" },
        { status: 400 },
      );
    }

    const instructor = await User.findById(body.instructorId).select("role").lean();
    if (!instructor || instructor.role !== "instructor") {
      return NextResponse.json(
        { success: false, error: "Instructor not found" },
        { status: 404 },
      );
    }

    let batchClassId;
    if (isObjectId(body.batchClassId)) {
      const bc = await BatchClass.findOne({
        _id: toObjectId(body.batchClassId),
        batchId: toObjectId(batchId),
        isActive: true,
      }).lean();
      if (!bc) {
        return NextResponse.json(
          { success: false, error: "Batch class not found" },
          { status: 404 },
        );
      }
      batchClassId = bc._id;
    }

    const row = await RoutineSlot.create({
      batchId: toObjectId(batchId),
      batchClassId,
      dayOfWeek,
      startTime,
      endTime,
      topic,
      instructorId: toObjectId(body.instructorId),
      status: body.status === "inactive" ? "inactive" : "active",
    });

    const populated = await RoutineSlot.findById(row._id)
      .populate("instructorId", INSTRUCTOR_SELECT)
      .populate("batchClassId", "title")
      .lean();

    return NextResponse.json(
      {
        success: true,
        data: { slot: mapRoutineSlot(populated as Record<string, unknown>) },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST routine-slot", error);
    return NextResponse.json(
      { success: false, error: "Failed to create routine slot" },
      { status: 500 },
    );
  }
}
