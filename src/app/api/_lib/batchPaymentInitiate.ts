import { NextResponse } from "next/server";
import type { Session } from "next-auth";
import mongoose from "mongoose";
import Batch from "@/models/Batch";
import BatchEnrollment from "@/models/BatchEnrollment";
import Payment from "@/models/Payment";
import { initiatePayment } from "@/lib/paymentGateway/sslcommerz";
import {
  PAYMENT_REUSE_WINDOW_MS,
  getCheckoutUrlFromGatewayResponse,
  isDuplicateKeyError,
  makeTransactionId,
} from "@/app/api/_lib/paymentShared";

function isBatchEnrollmentPaidAndActive(row: {
  paymentStatus?: string;
  status?: string;
}): boolean {
  return row.paymentStatus === "paid" && row.status === "active";
}

function isBatchEnrollmentPendingPayment(row: {
  paymentStatus?: string;
  status?: string;
}): boolean {
  return row.paymentStatus === "pending" && row.status === "pending";
}

export async function initiateBatchPayment(
  batchId: mongoose.Types.ObjectId,
  userId: string,
  session: Session | null,
): Promise<NextResponse> {
  const batch = await Batch.findOne({
    _id: batchId,
    isActive: true,
  })
    .select("_id name fee maxStudents")
    .lean();

  if (!batch) {
    return NextResponse.json(
      { success: false, error: "Batch not found or not active" },
      { status: 404 },
    );
  }

  const activeCount = await BatchEnrollment.countDocuments({
    batchId: batch._id,
    status: "active",
    paymentStatus: "paid",
  });

  if (activeCount >= batch.maxStudents) {
    return NextResponse.json(
      { success: false, error: "Batch is full" },
      { status: 409 },
    );
  }

  const existing = await BatchEnrollment.findOne({
    batchId: batch._id,
    studentId: userId,
  })
    .select("_id status paymentStatus")
    .lean();

  if (existing && isBatchEnrollmentPaidAndActive(existing)) {
    return NextResponse.json(
      { success: false, error: "Already enrolled in this batch" },
      { status: 409 },
    );
  }

  const fee = Number(batch.fee) || 0;

  if (fee <= 0) {
    const enrollment = await BatchEnrollment.findOneAndUpdate(
      { batchId: batch._id, studentId: userId },
      {
        $set: {
          status: "active",
          paymentStatus: "paid",
          paymentAmount: 0,
        },
        $unset: { paymentId: "" },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );

    return NextResponse.json({
      success: true,
      data: {
        entityType: "batch",
        batchId: String(batch._id),
        batchEnrollmentId: String(enrollment._id),
        enrolled: true,
        requiresPayment: false,
      },
    });
  }

  if (existing && isBatchEnrollmentPendingPayment(existing)) {
    const recentPendingPayment = await Payment.findOne({
      user: userId,
      entityType: "batch",
      batchId: batch._id,
      status: "pending",
    })
      .sort({ createdAt: -1 })
      .select("transactionId gatewayResponse createdAt")
      .lean();

    if (recentPendingPayment) {
      const ageMs =
        Date.now() - new Date(recentPendingPayment.createdAt).getTime();
      const checkoutUrl = getCheckoutUrlFromGatewayResponse(
        recentPendingPayment.gatewayResponse,
      );

      if (ageMs < PAYMENT_REUSE_WINDOW_MS && checkoutUrl) {
        return NextResponse.json({
          success: true,
          data: {
            entityType: "batch",
            checkout_url: checkoutUrl,
            transactionId: recentPendingPayment.transactionId,
          },
        });
      }
    }
  }

  const runAttempt = async (transactionId: string) => {
    const batchEnrollment = await BatchEnrollment.findOneAndUpdate(
      { batchId: batch._id, studentId: userId },
      {
        $set: {
          status: "pending",
          paymentStatus: "pending",
          paymentId: transactionId,
          paymentAmount: fee,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );

    const gatewayInit = await initiatePayment({
      amount: fee,
      tran_id: transactionId,
      cus_name: session?.user?.name || "Customer",
      cus_email: session?.user?.email || "customer@example.com",
      cus_phone: String(userId).slice(-11) || "01700000000",
      cus_add1: "N/A",
      cus_city: "Dhaka",
    });

    const safeGatewayResponse = {
      checkout_url: gatewayInit.checkout_url,
      gatewayOrderId: gatewayInit.gatewayOrderId,
      transactionId,
      amount: fee,
      batchId: String(batch._id),
      userId: String(userId),
      entityType: "batch",
    };

    const payment = await Payment.create({
      user: userId,
      entityType: "batch",
      batchId: batch._id,
      batchEnrollment: batchEnrollment._id,
      amount: fee,
      transactionId,
      gateway: "sslcommerz",
      gatewayOrderId: gatewayInit.gatewayOrderId,
      status: "pending",
      gatewayResponse: safeGatewayResponse,
    });

    return {
      checkoutUrl: gatewayInit.checkout_url,
      transactionId: payment.transactionId,
    };
  };

  let transactionId = makeTransactionId(userId);
  try {
    const result = await runAttempt(transactionId);
    return NextResponse.json({
      success: true,
      data: {
        entityType: "batch",
        checkout_url: result.checkoutUrl,
        transactionId: result.transactionId,
      },
    });
  } catch (error) {
    if (!isDuplicateKeyError(error)) {
      throw error;
    }
    transactionId = makeTransactionId(userId, true);
    const retryResult = await runAttempt(transactionId);
    return NextResponse.json({
      success: true,
      data: {
        entityType: "batch",
        checkout_url: retryResult.checkoutUrl,
        transactionId: retryResult.transactionId,
      },
    });
  }
}
