import Payment from "@/models/Payment";
import Enrollment from "@/models/Enrollment";
import BatchEnrollment from "@/models/BatchEnrollment";

export type PaymentEntityType = "course" | "batch";

export type PaymentForFulfillment = {
  _id: unknown;
  entityType?: PaymentEntityType | string;
  status?: string;
  transactionId?: string;
  enrollment?: unknown;
  batchEnrollment?: unknown;
  user?: unknown;
};

export async function markPaymentFailed(
  paymentId: unknown,
  gatewayResponse: unknown,
): Promise<void> {
  await Payment.findByIdAndUpdate(paymentId, {
    $set: {
      status: "failed",
      gatewayResponse,
    },
  });
}

/** Idempotent success: activates enrollment(s) for course or batch payments. */
export async function fulfillPaymentSuccess(
  payment: PaymentForFulfillment,
  gatewayResponse: unknown,
): Promise<"already_processed" | "fulfilled"> {
  if (payment.status === "success") {
    return "already_processed";
  }

  await Payment.findByIdAndUpdate(payment._id, {
    $set: {
      status: "success",
      gatewayResponse,
    },
  });

  const entityType =
    payment.entityType === "batch" ? "batch" : ("course" as const);

  if (entityType === "batch") {
    const filters = [];
    if (payment.batchEnrollment) {
      filters.push({ _id: payment.batchEnrollment });
    }
    if (payment.transactionId) {
      filters.push({ paymentId: payment.transactionId, paymentStatus: "pending" });
    }
    if (filters.length > 0) {
      await BatchEnrollment.updateMany(
        { $or: filters },
        { $set: { status: "active", paymentStatus: "paid" } },
      );
    }
    return "fulfilled";
  }

  if (payment.enrollment) {
    await Enrollment.findOneAndUpdate(
      {
        _id: payment.enrollment,
        paymentStatus: { $ne: "paid" },
      },
      {
        $set: {
          status: "enrolled",
          paymentStatus: "paid",
        },
      },
    );
  }

  if (payment.transactionId) {
    const studentFilter = payment.user ? { student: payment.user } : {};
    await Enrollment.updateMany(
      {
        ...studentFilter,
        paymentId: payment.transactionId,
        paymentStatus: "pending",
      },
      {
        $set: {
          status: "enrolled",
          paymentStatus: "paid",
        },
      },
    );
  }

  return "fulfilled";
}
