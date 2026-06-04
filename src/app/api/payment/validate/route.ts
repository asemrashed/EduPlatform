import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Payment from "@/models/Payment";
import Course from "@/models/Course";
import Batch from "@/models/Batch";
import BatchEnrollment from "@/models/BatchEnrollment";
import {
  fulfillPaymentSuccess,
  markPaymentFailed,
} from "@/app/api/_lib/paymentFulfillment";
import { amountsMatch } from "@/app/api/_lib/paymentShared";
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
      "_id user entityType course enrollment batchId batchEnrollment status gatewayOrderId transactionId amount createdAt",
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

    const entityType = payment.entityType === "batch" ? "batch" : "course";

    if (entityType === "batch") {
      const batch = await Batch.findOne({
        _id: payment.batchId,
        isActive: true,
      })
        .select("_id")
        .lean();

      if (!batch) {
        return NextResponse.json(
          { success: false, error: "Batch no longer available" },
          { status: 400 },
        );
      }
    } else {
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
    }

    if (payment.status === "success") {
      if (entityType === "batch") {
        const enrollment = await BatchEnrollment.findById(payment.batchEnrollment)
          .select("_id status paymentStatus")
          .lean();
        return NextResponse.json({
          success: true,
          data: {
            status: "success",
            entityType: "batch",
            transactionId: payment.transactionId,
            amount: String(payment.amount),
            currency: "BDT",
            paymentDate: new Date(payment.createdAt).toISOString(),
            batchEnrollment: enrollment
              ? {
                  id: String(enrollment._id),
                  status: enrollment.status,
                  paymentStatus: enrollment.paymentStatus,
                }
              : undefined,
            batchId: String(payment.batchId),
          },
        });
      }

      return NextResponse.json({
        success: true,
        data: {
          status: "success",
          entityType: "course",
          transactionId: payment.transactionId,
          amount: String(payment.amount),
          currency: "BDT",
          paymentDate: new Date(payment.createdAt).toISOString(),
          enrollment: {
            id: String(payment.enrollment),
            status: "enrolled",
            paymentStatus: "paid",
          },
          courseId: String(payment.course),
        },
      });
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
      await fulfillPaymentSuccess(payment, verificationResult.raw);

      if (entityType === "batch") {
        const enrollment = await BatchEnrollment.findById(payment.batchEnrollment)
          .select("_id status paymentStatus")
          .lean();

        return NextResponse.json({
          success: true,
          data: {
            status: "success",
            entityType: "batch",
            transactionId: payment.transactionId,
            amount: String(payment.amount),
            currency: "BDT",
            paymentDate: new Date(payment.createdAt).toISOString(),
            batchEnrollment: {
              id: String(enrollment?._id ?? payment.batchEnrollment),
              status: enrollment?.status ?? "active",
              paymentStatus: enrollment?.paymentStatus ?? "paid",
            },
            batchId: String(payment.batchId),
          },
        });
      }

      return NextResponse.json({
        success: true,
        data: {
          status: "success",
          entityType: "course",
          transactionId: payment.transactionId,
          amount: String(payment.amount),
          currency: "BDT",
          paymentDate: new Date(payment.createdAt).toISOString(),
          enrollment: {
            id: String(payment.enrollment),
            status: "enrolled",
            paymentStatus: "paid",
          },
          courseId: String(payment.course),
        },
      });
    }

    await markPaymentFailed(payment._id, verificationResult.raw);

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
