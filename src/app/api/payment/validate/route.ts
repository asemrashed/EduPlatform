import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Payment from "@/models/Payment";
import Course from "@/models/Course";
import Enrollment from "@/models/Enrollment";
import {
  getValidationAmount,
  getValidationRecord,
  getValidationTranId,
  verifyPayment,
} from "@/lib/paymentGateway/sslcommerz";

type ValidateRequestBody = {
  transactionId?: string;
  tranId?: string;
  valId?: string;
  sessionLuKey?: string;
};

function amountsMatch(paid: number, expected: number): boolean {
  return Math.abs(paid - expected) < 0.01;
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

    const body = (await request.json()) as ValidateRequestBody;
    const transactionId =
      typeof body.transactionId === "string" && body.transactionId.trim()
        ? body.transactionId.trim()
        : typeof body.tranId === "string" && body.tranId.trim()
          ? body.tranId.trim()
          : "";

    if (!transactionId) {
      return NextResponse.json(
        { success: false, error: "transactionId is required" },
        { status: 400 },
      );
    }

    await connectDB();

    const payment = await Payment.findOne({ transactionId }).select(
      "_id user course enrollment status gatewayOrderId transactionId amount createdAt",
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

    const gatewayOrderId =
      typeof payment.gatewayOrderId === "string" && payment.gatewayOrderId.trim()
        ? payment.gatewayOrderId
        : payment.transactionId;

    const verificationResult = await verifyPayment(gatewayOrderId);
    const record = getValidationRecord(verificationResult.raw);
    const validatedTranId = getValidationTranId(record);
    const validatedAmount = getValidationAmount(record);
    const tranIdMatches =
      validatedTranId !== "" && validatedTranId === gatewayOrderId;
    const amountMatches =
      Number.isFinite(validatedAmount) &&
      amountsMatch(validatedAmount, Number(payment.amount));

    if (verificationResult.success && tranIdMatches && amountMatches) {
      await Payment.findByIdAndUpdate(payment._id, {
        $set: {
          status: "success",
          gatewayResponse: verificationResult.raw,
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
          status: "success",
          transactionId: payment.transactionId,
          amount: String(payment.amount),
          currency: "BDT",
          paymentDate: new Date(payment.createdAt).toISOString(),
          enrollment: {
            id: String(payment.enrollment),
            status: "active",
            paymentStatus: "paid",
          },
          courseId: String(payment.course),
        },
      });
    }

    await Payment.findByIdAndUpdate(payment._id, {
      $set: {
        status: "failed",
        gatewayResponse: verificationResult.raw,
      },
    });

    return NextResponse.json({
      success: false,
      error: "Payment validation failed",
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to validate payment" },
      { status: 500 },
    );
  }
}
