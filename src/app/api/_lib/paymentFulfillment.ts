import Payment from "@/models/Payment";
import Enrollment from "@/models/Enrollment";
import BatchEnrollment from "@/models/BatchEnrollment";
import QBAccessRequest from "@/models/QBAccessRequest";

export type PaymentEntityType = "course" | "batch" | "qb_access";

export type PaymentForFulfillment = {
  _id: unknown;
  entityType?: PaymentEntityType | string;
  status?: string;
  transactionId?: string;
  enrollment?: unknown;
  batchEnrollment?: unknown;
  qbAccessRequest?: unknown;
  user?: unknown;
};

async function fulfillQbAccessPayment(payment: PaymentForFulfillment): Promise<void> {
  if (!payment.qbAccessRequest) return;
  const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
  await QBAccessRequest.findByIdAndUpdate(payment.qbAccessRequest, {
    $set: {
      status: "approved",
      isPaid: true,
      grantedAt: new Date(),
      expiresAt,
    },
  });
}

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

  if (payment.entityType === "qb_access") {
    await fulfillQbAccessPayment(payment);
    return "fulfilled";
  }

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
