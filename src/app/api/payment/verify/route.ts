import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Payment from "@/models/Payment";
import Course from "@/models/Course";
import Enrollment from "@/models/Enrollment";
import { verifyPayment } from "@/lib/paymentGateway/sslcommerz";

type VerifyRequestBody = {
  transactionId?: string;
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
      "_id user course enrollment status gatewayOrderId transactionId",
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

    const gatewayOrderId =
      typeof payment.gatewayOrderId === "string" &&
      payment.gatewayOrderId.trim()
        ? payment.gatewayOrderId
        : payment.transactionId;

    const verificationResult = await verifyPayment(gatewayOrderId);
    const safeGatewayResponse = verificationResult.raw;

    if (verificationResult.success) {
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
