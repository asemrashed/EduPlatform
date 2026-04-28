import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Payment from "@/models/Payment";
import Course from "@/models/Course";
import Enrollment from "@/models/Enrollment";
import { verifyShurjopayPayment } from "@/lib/shurjopay";

type VerifyRequestBody = {
  transactionId?: string;
};

type VerificationRecord = {
  sp_code?: number | string;
  bank_status?: string;
  amount?: number | string;
  currency?: string;
  sp_message?: string;
  sp_massage?: string;
  transaction_status?: string;
  date_time?: string;
  [key: string]: unknown;
};

function getPrimaryVerificationRecord(payload: unknown): VerificationRecord {
  if (Array.isArray(payload) && payload.length > 0) {
    const first = payload[0];
    if (first && typeof first === "object") {
      return first as VerificationRecord;
    }
  }
  if (payload && typeof payload === "object") {
    return payload as VerificationRecord;
  }
  return {};
}

function toSpCodeNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  return NaN;
}

function safeVerifyGatewayResponse(record: VerificationRecord) {
  return {
    sp_code: record.sp_code ?? null,
    bank_status: record.bank_status ?? null,
    amount: record.amount ?? null,
    currency: record.currency ?? null,
    transaction_status: record.transaction_status ?? null,
    date_time: record.date_time ?? null,
    sp_message: record.sp_message ?? record.sp_massage ?? null,
  };
}

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

    const body = (await request.json()) as VerifyRequestBody;
    const transactionId =
      typeof body.transactionId === "string" ? body.transactionId.trim() : "";
    if (!transactionId) {
      return NextResponse.json(
        { success: false, error: "transactionId is required" },
        { status: 400 },
      );
    }

    await connectDB();

    const payment = await Payment.findOne({ transactionId }).select(
      "_id user course enrollment status spOrderId transactionId",
    );
    if (!payment) {
      return NextResponse.json(
        { success: false, error: "Payment not found" },
        { status: 404 },
      );
    }

    if (String(payment.user) !== String(userId)) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    if (payment.status === "success") {
      return NextResponse.json({
        success: true,
        message: "Already verified",
        enrolled: true,
      });
    }

    if (payment.status === "failed") {
      return NextResponse.json(
        {
          success: false,
          message: "Payment failed. Please initiate a new payment.",
        },
        { status: 400 },
      );
    }

    const course = await Course.findOne({
      _id: payment.course,
      status: "published",
      isHidden: { $ne: true },
    })
      .select("_id")
      .lean();

    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course no longer available" },
        { status: 400 },
      );
    }

    const verificationPayload = await verifyShurjopayPayment(payment.spOrderId);
    const verificationRecord = getPrimaryVerificationRecord(verificationPayload);
    const spCode = toSpCodeNumber(verificationRecord.sp_code);
    const verified = spCode === 1000;
    const safeGatewayResponse = safeVerifyGatewayResponse(verificationRecord);

    if (verified) {
      await Payment.findByIdAndUpdate(payment._id, {
        $set: {
          status: "success",
          gatewayResponse: safeGatewayResponse,
        },
      });

      await Enrollment.findOneAndUpdate(
        {
          _id: payment.enrollment,
          status: { $ne: "active" },
        },
        {
          $set: {
            status: "active",
            paymentStatus: "paid",
          },
        },
      );

      return NextResponse.json({
        success: true,
        data: {
          enrolled: true,
          courseId: String(payment.course),
        },
      });
    }

    await Payment.findByIdAndUpdate(payment._id, {
      $set: {
        status: "failed",
        gatewayResponse: safeGatewayResponse,
      },
    });

    return NextResponse.json({
      success: false,
      message: "Payment verification failed",
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to verify payment" },
      { status: 500 },
    );
  }
}
