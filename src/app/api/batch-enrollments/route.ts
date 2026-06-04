import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Batch from "@/models/Batch";
import BatchEnrollment from "@/models/BatchEnrollment";
import User from "@/models/User";
import { asObjectId } from "@/app/api/_lib/paymentShared";

function batchIdFromLeanRef(batchField: unknown): string {
  if (
    batchField &&
    typeof batchField === "object" &&
    "_id" in (batchField as object)
  ) {
    return String((batchField as { _id: unknown })._id);
  }
  return String(batchField ?? "");
}

/** GET /api/batch-enrollments — current session user's batch enrollments. */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    await connectDB();

    const enrollments = await BatchEnrollment.find({ studentId: userId })
      .populate({
        path: "batchId",
        select: "name subject startDate endDate fee isActive description",
      })
      .sort({ enrolledAt: -1 })
      .lean();

    const data = enrollments.map((row: Record<string, unknown>) => {
      const batchPop = row.batchId as Record<string, unknown> | null;
      const batchInfo =
        batchPop && typeof batchPop === "object"
          ? {
              _id: String(batchPop._id ?? ""),
              name: batchPop.name as string | undefined,
              subject: batchPop.subject as string | undefined,
              startDate: (batchPop.startDate as Date | undefined)?.toISOString?.() ??
                (batchPop.startDate ? String(batchPop.startDate) : undefined),
              endDate: (batchPop.endDate as Date | undefined)?.toISOString?.() ??
                (batchPop.endDate ? String(batchPop.endDate) : undefined),
              fee: batchPop.fee as number | undefined,
              isActive: Boolean(batchPop.isActive),
              description: batchPop.description as string | undefined,
            }
          : undefined;

      return {
        _id: String(row._id),
        batchId: batchIdFromLeanRef(row.batchId),
        studentId: String(row.studentId),
        status: row.status,
        paymentStatus: row.paymentStatus,
        paymentId: row.paymentId,
        paymentAmount: row.paymentAmount,
        enrolledAt: (row.enrolledAt as Date).toISOString(),
        createdAt: (row.createdAt as Date).toISOString(),
        updatedAt: (row.updatedAt as Date).toISOString(),
        batchInfo,
      };
    });

    return NextResponse.json({
      success: true,
      data: { enrollments: data },
    });
  } catch (error) {
    console.error("Error fetching batch enrollments:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch batch enrollments" },
      { status: 500 },
    );
  }
}

/** POST /api/batch-enrollments — register for batch; paid batches require payment initiate. */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    const body = (await request.json()) as Record<string, unknown>;
    const batchObjectId = asObjectId(body.batchId);
    if (!batchObjectId) {
      return NextResponse.json(
        { success: false, error: "Valid batchId is required" },
        { status: 400 },
      );
    }

    await connectDB();

    const studentExists = await User.findById(userId).select("_id").lean();
    if (!studentExists) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    }

    const batch = await Batch.findOne({
      _id: batchObjectId,
      isActive: true,
    }).lean();

    if (!batch) {
      return NextResponse.json(
        { success: false, error: "Batch not found or not active" },
        { status: 404 },
      );
    }

    const existing = await BatchEnrollment.findOne({
      batchId: batchObjectId,
      studentId: userId,
    }).lean();

    if (existing?.paymentStatus === "paid" && existing.status === "active") {
      return NextResponse.json(
        { success: false, error: "Already enrolled in this batch" },
        { status: 409 },
      );
    }

    const fee = Number(batch.fee) || 0;

    if (fee > 0) {
      return NextResponse.json({
        success: true,
        data: {
          requiresPayment: true,
          batchId: String(batch._id),
          fee,
          message: "Use POST /api/payment/initiate with batchId to complete payment",
        },
      });
    }

    const enrollment = await BatchEnrollment.findOneAndUpdate(
      { batchId: batchObjectId, studentId: userId },
      {
        $set: {
          status: "active",
          paymentStatus: "paid",
          paymentAmount: 0,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );

    return NextResponse.json(
      {
        success: true,
        data: {
          _id: String(enrollment._id),
          batchId: String(batchObjectId),
          studentId: String(userId),
          status: enrollment.status,
          paymentStatus: enrollment.paymentStatus,
          requiresPayment: false,
        },
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code?: number }).code === 11000
    ) {
      return NextResponse.json(
        { success: false, error: "Already enrolled in this batch" },
        { status: 409 },
      );
    }
    console.error("Error creating batch enrollment:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create batch enrollment" },
      { status: 500 },
    );
  }
}
