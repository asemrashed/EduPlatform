import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Payment from "@/models/Payment";
import Enrollment from "@/models/Enrollment";
import {
  getValidationAmount,
  getValidationRecord,
  getValidationTranId,
  verifyPayment,
} from "@/lib/paymentGateway/sslcommerz";

function amountsMatch(paid: number, expected: number): boolean {
  return Math.abs(paid - expected) < 0.01;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const ipnPayload = Object.fromEntries(formData);
    const tranIdRaw = formData.get("tran_id");
    const tranId = typeof tranIdRaw === "string" ? tranIdRaw.trim() : "";

    if (!tranId) {
      return NextResponse.json(
        { success: false, error: "tran_id is required" },
        { status: 400 },
      );
    }

    await connectDB();

    const payment = await Payment.findOne({
      $or: [{ transactionId: tranId }, { gatewayOrderId: tranId }],
    }).select("_id enrollment status gatewayOrderId transactionId amount");

    if (!payment) {
      return NextResponse.json(
        { success: false, error: "Payment not found" },
        { status: 404 },
      );
    }

    if (payment.status === "success") {
      return NextResponse.json({ success: true, status: "already_processed" });
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
          gatewayResponse: {
            source: "ipn",
            ipnPayload,
            verification: verificationResult.raw,
          },
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

      return NextResponse.json({ success: true, status: "processed" });
    }

    await Payment.findByIdAndUpdate(payment._id, {
      $set: {
        status: "failed",
        gatewayResponse: {
          source: "ipn",
          ipnPayload,
          verification: verificationResult.raw,
        },
      },
    });

    return NextResponse.json({
      success: false,
      status: "verification_failed",
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to process IPN" },
      { status: 500 },
    );
  }
}
