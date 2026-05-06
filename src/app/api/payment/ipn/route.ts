import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Payment from "@/models/Payment";
import Enrollment from "@/models/Enrollment";

function amountsMatch(paid: number, expected: number): boolean {
  return Math.abs(paid - expected) < 0.01;
}

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

    // Validate directly from IPN payload (SSLCommerz already verified)
    const ipnStatus = String(ipnPayload.status || "").trim();
    const ipnTranId = String(ipnPayload.tran_id || "").trim();
    const ipnAmount = Number(ipnPayload.amount) || Number(ipnPayload.currency_amount);
    
    const tranIdMatches = ipnTranId === tranId;
    const amountMatches = Number.isFinite(ipnAmount) && amountsMatch(ipnAmount, Number(payment.amount));
    const statusIsValid = ipnStatus === "VALID" || ipnStatus === "VALIDATED";

    console.log("IPN Validation Check:", { tranIdMatches, amountMatches, statusIsValid, ipnStatus });

    if (statusIsValid && tranIdMatches && amountMatches) {
      await Payment.findByIdAndUpdate(payment._id, {
        $set: {
          status: "success",
          gatewayResponse: {
            source: "ipn",
            ipnPayload,
          },
        },
      });

      await Enrollment.findOneAndUpdate(
        {
          _id: payment.enrollment,
          status: { $ne: "enrolled" },
        },
        {
          $set: {
            status: "enrolled",
            paymentStatus: "paid",
          },
        },
      );

      console.log("✅ Payment verified and enrollment updated to enrolled");
      return NextResponse.json({ success: true, status: "processed" });
    }

    console.log("❌ IPN validation failed");
    await Payment.findByIdAndUpdate(payment._id, {
      $set: {
        status: "failed",
        gatewayResponse: {
          source: "ipn",
          ipnPayload,
        },
      },
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
