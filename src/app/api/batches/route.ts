import { NextRequest, NextResponse } from "next/server";
import Batch from "@/models/Batch";
import User from "@/models/User";
import {
  buildWeeklyRoutine,
  instructorBatchFilter,
  mapBatch,
  studentEnrolledBatchIds,
} from "@/app/api/_lib/batchAccess";
import {
  isObjectId,
  pagination,
  parseLimit,
  parsePage,
  requireSessionUser,
  toObjectId,
} from "@/app/api/_lib/phase12";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireSessionUser(["admin", "instructor", "student"]);
    if (auth.error) return auth.error;

    const { searchParams } = new URL(request.url);
    const page = parsePage(searchParams);
    const limit = parseLimit(searchParams, 20, 100);
    const skip = (page - 1) * limit;
    const search = (searchParams.get("search") || "").trim();

    const filter: Record<string, unknown> = {};

    if (auth.user.role === "instructor") {
      Object.assign(filter, instructorBatchFilter(auth.user.id));
    } else if (auth.user.role === "student") {
      const batchIds = await studentEnrolledBatchIds(auth.user.id);
      if (batchIds.length === 0) {
        return NextResponse.json({
          success: true,
          data: { batches: [] },
          pagination: pagination(page, limit, 0),
        });
      }
      filter._id = { $in: batchIds };
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
      ];
    }

    const [batches, total] = await Promise.all([
      Batch.find(filter).sort({ startDate: -1 }).skip(skip).limit(limit).lean(),
      Batch.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      data: { batches: batches.map((b) => mapBatch(b as Record<string, unknown>)) },
      pagination: pagination(page, limit, total),
    });
  } catch (error) {
    console.error("GET /api/batches", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch batches" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireSessionUser(["admin", "instructor"]);
    if (auth.error) return auth.error;

    const body = (await request.json()) as Record<string, unknown>;
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const subject = typeof body.subject === "string" ? body.subject.trim() : "";

    if (!name || !subject) {
      return NextResponse.json(
        { success: false, error: "name and subject are required" },
        { status: 400 },
      );
    }

    let instructorId = auth.user.id;
    if (auth.user.role === "admin") {
      if (!isObjectId(body.instructorId)) {
        return NextResponse.json(
          { success: false, error: "instructorId is required for admin" },
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
      instructorId = body.instructorId;
    }

    const startDate = body.startDate ? new Date(String(body.startDate)) : null;
    const endDate = body.endDate ? new Date(String(body.endDate)) : null;
    if (!startDate || !endDate || Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return NextResponse.json(
        { success: false, error: "Valid startDate and endDate are required" },
        { status: 400 },
      );
    }

    const maxStudents = Number(body.maxStudents);
    const fee = Number(body.fee ?? 0);

    if (!Number.isFinite(maxStudents) || maxStudents < 1) {
      return NextResponse.json(
        { success: false, error: "maxStudents must be at least 1" },
        { status: 400 },
      );
    }

    const schedule = Array.isArray(body.schedule) ? body.schedule : [];

    const batch = await Batch.create({
      name,
      subject,
      instructorId: toObjectId(instructorId),
      schedule,
      startDate,
      endDate,
      maxStudents,
      fee: Number.isFinite(fee) && fee >= 0 ? fee : 0,
      isActive: body.isActive !== false,
      description: typeof body.description === "string" ? body.description.trim() : undefined,
    });

    const mapped = mapBatch(batch.toObject() as Record<string, unknown>);

    return NextResponse.json(
      {
        success: true,
        data: {
          batch: mapped,
          routine: buildWeeklyRoutine(batch.schedule),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/batches", error);
    return NextResponse.json(
      { success: false, error: "Failed to create batch" },
      { status: 500 },
    );
  }
}
