import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Course from "@/models/Course";
import Enrollment from "@/models/Enrollment";
import Payment from "@/models/Payment";
import { initiatePayment } from "@/lib/paymentGateway/sslcommerz";
import { initiateBatchPayment } from "@/app/api/_lib/batchPaymentInitiate";
import {
  PAYMENT_REUSE_WINDOW_MS,
  asObjectId,
  getCheckoutUrlFromGatewayResponse,
  isDuplicateKeyError,
  makeTransactionId,
} from "@/app/api/_lib/paymentShared";

type InitiateRequestBody = {
  courseId?: string;
  courseIds?: string[];
  batchId?: string;
};

function isEnrollmentPaidAndActive(row: {
  paymentStatus?: string;
  status?: string;
}): boolean {
  if (row.paymentStatus !== "paid") return false;
  return ["enrolled", "in_progress", "completed"].includes(String(row.status || ""));
}

function isEnrollmentPendingSuspended(row: {
  paymentStatus?: string;
  status?: string;
}): boolean {
  return row.paymentStatus === "pending" && row.status === "suspended";
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
    const batchObjectId = asObjectId(body.batchId);
    const rawCourseIds = [
      ...(typeof body.courseId === "string" ? [body.courseId] : []),
      ...(Array.isArray(body.courseIds) ? body.courseIds : []),
    ];
    const uniqueCourseIds = Array.from(new Set(rawCourseIds));
    const courseObjectIds = uniqueCourseIds
      .map((id) => asObjectId(id))
      .filter((id): id is mongoose.Types.ObjectId => id !== null);

    const hasBatch = Boolean(batchObjectId);
    const hasCourse = uniqueCourseIds.length > 0;

    if (hasBatch && hasCourse) {
      return NextResponse.json(
        { success: false, error: "Provide either batchId or courseId(s), not both" },
        { status: 400 },
      );
    }

    if (!hasBatch && !hasCourse) {
      return NextResponse.json(
        { success: false, error: "batchId or courseId(s) is required" },
        { status: 400 },
      );
    }

    await connectDB();

    if (hasBatch && batchObjectId) {
      return initiateBatchPayment(batchObjectId, userId, session);
    }

    if (courseObjectIds.length !== uniqueCourseIds.length) {
      return NextResponse.json(
        { success: false, error: "Invalid or missing courseId(s)" },
        { status: 400 },
      );
    }
    // console.log("CONNECTED TO DATABASE");
    const courses = await Course.find({
      _id: { $in: courseObjectIds },
      status: "published",
      isHidden: { $ne: true },
    })
      .select("_id isPaid price salePrice finalPrice")
      .lean();

    if (courses.length !== courseObjectIds.length) {
      return NextResponse.json(
        { success: false, error: "One or more courses not found or not published" },
        { status: 404 },
      );
    }

    const normalizedCourses = courses.map((course) => {
      const amount =
        course.salePrice && course.salePrice < course.price
          ? course.salePrice
          : course.price;
      return {
        id: String(course._id),
        objectId: course._id,
        isPaid: course.isPaid,
        amount,
      };
    });

    const invalidPaidCourse = normalizedCourses.find(
      (course) => !course.isPaid || !Number.isFinite(course.amount) || course.amount <= 0,
    );

    if (invalidPaidCourse) {
      return NextResponse.json(
        { success: false, error: "All selected courses must be paid courses" },
        { status: 400 },
      );
    }

    const totalAmount = normalizedCourses.reduce((sum, course) => sum + course.amount, 0);

    const existingEnrollments = await Enrollment.find({
      student: userId,
      course: { $in: courseObjectIds },
    })
      .select("_id course paymentStatus status")
      .lean();

    const hasAlreadyEnrolled = existingEnrollments.some((enrollment) =>
      isEnrollmentPaidAndActive(enrollment),
    );

    if (hasAlreadyEnrolled) {
      return NextResponse.json(
        { success: false, error: "One or more selected courses are already enrolled" },
        { status: 409 },
      );
    }

    const isSingleCourseCheckout = courseObjectIds.length === 1;
    const existingEnrollment = isSingleCourseCheckout
      ? existingEnrollments.find(
          (enrollment) => String(enrollment.course) === String(courseObjectIds[0]),
        )
      : null;

    if (isSingleCourseCheckout && existingEnrollment && isEnrollmentPendingSuspended(existingEnrollment)) {
      const recentPendingPayment = await Payment.findOne({
        user: userId,
        $or: [{ entityType: "course" }, { entityType: { $exists: false } }],
        course: courseObjectIds[0],
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
              checkout_url: checkoutUrl,
              transactionId: recentPendingPayment.transactionId,
            },
          });
        }
      }
    }

    const runAttempt = async (transactionId: string) => {
      const upsertedEnrollments = await Promise.all(
        normalizedCourses.map((course) =>
          Enrollment.findOneAndUpdate(
            {
              student: userId,
              course: course.objectId,
            },
            {
              $set: {
                status: "suspended",
                paymentStatus: "pending",
                paymentId: transactionId,
                paymentAmount: course.amount,
              },
            },
            {
              new: true,
              upsert: true,
              setDefaultsOnInsert: true,
            },
          ),
        ),
      );

      const gatewayInit = await initiatePayment({
        amount: totalAmount,
        tran_id: transactionId,
        cus_name: session?.user?.name || "Customer",
        cus_email: session?.user?.email || "customer@example.com",
        cus_phone: String(userId).slice(-11) || "01700000000",
        cus_add1: "N/A",
        cus_city: "Dhaka",
      });
      // console.log("GATEWAY INIT:", gatewayInit);
      const safeGatewayResponse = {
        checkout_url: gatewayInit.checkout_url,
        gatewayOrderId: gatewayInit.gatewayOrderId,
        transactionId,
        amount: totalAmount,
        courseIds: normalizedCourses.map((course) => course.id),
        userId: String(userId),
      };
      console.log("SAFE GATEWAY RESPONSE:", safeGatewayResponse);
      const payment = await Payment.create({
        user: userId,
        entityType: "course",
        course: courseObjectIds[0],
        enrollment: upsertedEnrollments[0]._id,
        amount: totalAmount,
        transactionId,
        gateway: "sslcommerz",
        gatewayOrderId: gatewayInit.gatewayOrderId,
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
