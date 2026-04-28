import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Course from "@/models/Course";
import Enrollment from "@/models/Enrollment";
import Payment from "@/models/Payment";
import {
  getShurjopayToken,
  initiateShurjopayPayment,
} from "@/lib/shurjopay";

const REUSE_WINDOW_MS = 30 * 60 * 1000;

type InitiateRequestBody = {
  courseId?: string;
};

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: number }).code === 11000
  );
}

function makeTransactionId(userId: string, withSuffix = false): string {
  const prefix = process.env.SHURJOPAY_ORDER_PREFIX || "NOK";
  const base = `${prefix}-${Date.now()}-${String(userId).slice(-6)}`;
  if (!withSuffix) return base;
  const suffix = Math.floor(100 + Math.random() * 900);
  return `${base}-${suffix}`;
}

function isEnrollmentPaidAndActive(row: {
  paymentStatus?: string;
  status?: string;
}): boolean {
  return row.paymentStatus === "paid" && row.status === "active";
}

function isEnrollmentPendingSuspended(row: {
  paymentStatus?: string;
  status?: string;
}): boolean {
  return row.paymentStatus === "pending" && row.status === "suspended";
}

function asObjectId(value: unknown): mongoose.Types.ObjectId | null {
  if (typeof value !== "string") return null;
  if (!mongoose.Types.ObjectId.isValid(value)) return null;
  return new mongoose.Types.ObjectId(value);
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    console.log("SESSION:", session);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    const body = (await request.json()) as InitiateRequestBody;
    const courseIdRaw = body.courseId;
    const courseObjectId = asObjectId(courseIdRaw);
    console.log("COURSE OBJECT ID:", courseObjectId);
    if (!courseObjectId) {
      return NextResponse.json(
        { success: false, error: "Invalid or missing courseId" },
        { status: 400 },
      );
    }

    await connectDB();
    console.log("CONNECTED TO DATABASE");
    const course = await Course.findOne({
      _id: courseObjectId,
      status: "published",
      isHidden: { $ne: true },
    })
      .select("_id isPaid price")
      .lean();
    console.log("COURSE:", course);
    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found or not published" },
        { status: 404 },
      );
    }

    const amount = Number(course.price ?? 0);
    console.log("AMOUNT:", amount);
    if (!course.isPaid || !Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Free course, no payment required" },
        { status: 400 },
      );
    }

    const existingEnrollment = await Enrollment.findOne({
      student: userId,
      course: courseObjectId,
    })
      .select("_id paymentStatus status")
      .lean();
    console.log("EXISTING ENROLLMENT:", existingEnrollment);
    if (existingEnrollment && isEnrollmentPaidAndActive(existingEnrollment)) {
      return NextResponse.json(
        { success: false, error: "Already enrolled" },
        { status: 409 },
      );
    }

    if (existingEnrollment && isEnrollmentPendingSuspended(existingEnrollment)) {
      const recentPendingPayment = await Payment.findOne({
        user: userId,
        course: courseObjectId,
        status: "pending",
      })
        .sort({ createdAt: -1 })
        .select("transactionId gatewayResponse createdAt")
        .lean();

      if (recentPendingPayment) {
        const ageMs =
          Date.now() - new Date(recentPendingPayment.createdAt).getTime();
        const checkoutUrl =
          typeof recentPendingPayment.gatewayResponse === "object" &&
          recentPendingPayment.gatewayResponse !== null &&
          "checkout_url" in
            (recentPendingPayment.gatewayResponse as Record<string, unknown>)
            ? (recentPendingPayment.gatewayResponse as { checkout_url?: unknown })
                .checkout_url
            : undefined;

        if (
          ageMs < REUSE_WINDOW_MS &&
          typeof checkoutUrl === "string" &&
          checkoutUrl.trim()
        ) {
          return NextResponse.json({
            success: true,
            data: {
              checkout_url: checkoutUrl,
              transactionId: recentPendingPayment.transactionId,
            },
          });
        }
      }
    }

    const tokenData = await getShurjopayToken();
    console.log("TOKEN DATA:", tokenData);

    const runAttempt = async (transactionId: string) => {
      const enrollment = await Enrollment.findOneAndUpdate(
        {
          student: userId,
          course: courseObjectId,
        },
        {
          $set: {
            status: "suspended",
            paymentStatus: "pending",
            paymentId: transactionId,
            paymentAmount: amount,
          },
        },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        },
      );

      const gatewayInit = await initiateShurjopayPayment({
        token: tokenData.token,
        store_id: tokenData.store_id,
        transactionId,
        amount,
        courseId: String(courseObjectId),
        userId: String(userId),
      });
      console.log("GATEWAY INIT:", gatewayInit);
      const safeGatewayResponse = {
        checkout_url: gatewayInit.checkout_url,
        sp_order_id: gatewayInit.sp_order_id,
        transactionId,
        amount,
        courseId: String(courseObjectId),
        userId: String(userId),
      };
      console.log("SAFE GATEWAY RESPONSE:", safeGatewayResponse);
      const payment = await Payment.create({
        user: userId,
        course: courseObjectId,
        enrollment: enrollment._id,
        amount,
        transactionId,
        spOrderId: gatewayInit.sp_order_id,
        status: "pending",
        gatewayResponse: safeGatewayResponse,
      });
      console.log("PAYMENT:", payment);
      return {
        checkoutUrl: gatewayInit.checkout_url,
        transactionId: payment.transactionId,
      };
    };

    let transactionId = makeTransactionId(userId);
    try {
      const result = await runAttempt(transactionId);
      console.log("RESULT:", result);
      return NextResponse.json({
        success: true,
        data: {
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
      console.log("RETRY RESULT:", retryResult);
      return NextResponse.json({
        success: true,
        data: {
          checkout_url: retryResult.checkoutUrl,
          transactionId: retryResult.transactionId,
        },
      });
    }
  } catch (error) {
    console.log("ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Failed to initiate payment" },
      { status: 500 },
    );
  }
}
