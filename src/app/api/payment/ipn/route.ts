import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Payment from "@/models/Payment";
import { fulfillPaymentSuccess, markPaymentFailed } from "@/app/api/_lib/paymentFulfillment";
import { amountsMatch } from "@/app/api/_lib/paymentShared";

export async function POST(request: Request) {
  console.log("Received IPN request");
  try {
    const formData = await request.formData();
    const ipnPayload = Object.fromEntries(formData);
    const tranIdRaw = formData.get("tran_id");
    const tranId = typeof tranIdRaw === "string" ? tranIdRaw.trim() : "";

    console.log("IPN Payload:", ipnPayload);
    console.log("Transaction ID:", tranId);

    if (!tranId) {
      return NextResponse.json(
        { success: false, error: "tran_id is required" },
        { status: 400 },
      );
    }

    await connectDB();

    const payment = await Payment.findOne({
      $or: [{ transactionId: tranId }, { gatewayOrderId: tranId }],
    }).select(
      "_id entityType enrollment batchEnrollment status gatewayOrderId transactionId amount user",
    );

    if (!payment) {
      return NextResponse.json(
        { success: false, error: "Payment not found" },
        { status: 404 },
      );
    }

    if (payment.status === "success") {
      return NextResponse.json({ success: true, status: "already_processed" });
    }

    const ipnStatus = String(ipnPayload.status || "").trim();
    const ipnTranId = String(ipnPayload.tran_id || "").trim();
    const ipnAmount =
      Number(ipnPayload.amount) || Number(ipnPayload.currency_amount);

    const tranIdMatches = ipnTranId === tranId;
    const amountMatches =
      Number.isFinite(ipnAmount) && amountsMatch(ipnAmount, Number(payment.amount));
    const statusIsValid = ipnStatus === "VALID" || ipnStatus === "VALIDATED";

    console.log("IPN Validation Check:", {
      tranIdMatches,
      amountMatches,
      statusIsValid,
      ipnStatus,
      entityType: payment.entityType,
    });

    if (statusIsValid && tranIdMatches && amountMatches) {
      await fulfillPaymentSuccess(payment, {
        source: "ipn",
        ipnPayload,
      });

      console.log(
        `✅ Payment verified (${payment.entityType || "course"}) and enrollment updated`,
      );
      return NextResponse.json({ success: true, status: "processed" });
    }

    console.log("❌ IPN validation failed");
    await markPaymentFailed(payment._id, {
      source: "ipn",
      ipnPayload,
    });

    return NextResponse.json({
      success: false,
      status: "verification_failed",
    });
  } catch (error) {
    console.error("Error processing IPN:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process IPN" },
      { status: 500 },
    );
  }
}
