import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import connectDB from "@/lib/mongodb";
import { authOptions } from "@/lib/auth";
import QBAccessRequest from "@/models/QBAccessRequest";
import Payment from "@/models/Payment";
import { activeAccessGrantQuery } from "@/app/api/_lib/platformQuestionAccess";
import {
  PLATFORM_QB_ACCESS_FEE,
  isPlatformQbPaidAccessEnabled,
} from "@/lib/platformQbAccess";
import { initiatePayment } from "@/lib/paymentGateway/sslcommerz";
import { makeTransactionId } from "@/app/api/_lib/paymentShared";
import { toObjectId } from "@/app/api/_lib/phase12";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "instructor") {
      return NextResponse.json(
        { success: false, error: "Instructor authentication required" },
        { status: 401 },
      );
    }

    if (!isPlatformQbPaidAccessEnabled()) {
      return NextResponse.json(
        {
          success: false,
          error: "Paid QB access is not enabled. Request free access instead.",
        },
        { status: 400 },
      );
    }

    await connectDB();

    const userId = session.user.id;
    const existingGrant = await QBAccessRequest.findOne(
      activeAccessGrantQuery(userId),
    ).lean();
    if (existingGrant) {
      return NextResponse.json(
        { success: false, error: "You already have active admin question bank access" },
        { status: 409 },
      );
    }

    let requestDoc = await QBAccessRequest.findOne({
      requesterId: toObjectId(userId),
      status: "pending",
      isPaid: true,
    }).sort({ createdAt: -1 });

    if (!requestDoc) {
      requestDoc = await QBAccessRequest.create({
        requesterId: toObjectId(userId),
        status: "pending",
        isPaid: true,
        amount: PLATFORM_QB_ACCESS_FEE,
        note: "Paid instant access",
      });
    }

    const transactionId = makeTransactionId(userId);
    const gatewayInit = await initiatePayment({
      amount: PLATFORM_QB_ACCESS_FEE,
      tran_id: transactionId,
      cus_name: session.user.name || "Instructor",
      cus_email: session.user.email || "customer@example.com",
      cus_phone: String(userId).slice(-11) || "01700000000",
      cus_add1: "N/A",
      cus_city: "Dhaka",
    });

    await Payment.create({
      user: toObjectId(userId),
      entityType: "qb_access",
      qbAccessRequest: requestDoc._id,
      amount: PLATFORM_QB_ACCESS_FEE,
      transactionId,
      gateway: "sslcommerz",
      gatewayOrderId: gatewayInit.gatewayOrderId,
      status: "pending",
      gatewayResponse: {
        checkout_url: gatewayInit.checkout_url,
        gatewayOrderId: gatewayInit.gatewayOrderId,
        entityType: "qb_access",
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        checkout_url: gatewayInit.checkout_url,
        transactionId,
        amount: PLATFORM_QB_ACCESS_FEE,
        accessRequestId: String(requestDoc._id),
      },
    });
  } catch (error) {
    console.error("QB access pay error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to initiate QB access payment" },
      { status: 500 },
    );
  }
}
