import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Payment from "@/models/Payment";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ transactionId: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    const { transactionId } = await context.params;
    const normalizedId =
      typeof transactionId === "string" ? transactionId.trim() : "";

    if (!normalizedId) {
      return NextResponse.json(
        { success: false, error: "transactionId is required" },
        { status: 400 },
      );
    }

    await connectDB();

    const payment = await Payment.findOne({ transactionId: normalizedId })
      .select("_id user course enrollment amount status transactionId createdAt")
      .lean();

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

    return NextResponse.json({
      success: true,
      data: {
        id: String(payment._id),
        transactionId: payment.transactionId,
        amount: String(payment.amount),
        currency: "BDT",
        status: payment.status,
        initiatedAt: payment.createdAt,
        courseId: String(payment.course),
        enrollment: {
          id: String(payment.enrollment),
          status: payment.status === "success" ? "active" : "suspended",
          paymentStatus: payment.status === "success" ? "paid" : payment.status,
        },
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch payment" },
      { status: 500 },
    );
  }
}
