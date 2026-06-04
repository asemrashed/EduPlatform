export type BatchEnrollmentRow = {
  _id: string;
  batchId: string;
  studentId: string;
  status: string;
  paymentStatus: string;
  enrolledAt: string;
  batchInfo?: {
    _id: string;
    name?: string;
    subject?: string;
  };
};

type ApiEnvelope<T> = { success: boolean; data?: T; error?: string };

async function parseResponse<T>(response: Response): Promise<ApiEnvelope<T>> {
  const body = (await response.json()) as ApiEnvelope<T>;
  if (!response.ok || !body.success) {
    throw new Error(body.error || "Request failed");
  }
  return body;
}

/** POST /api/batch-enrollments — register current user for a batch. */
export async function registerForBatch(batchId: string) {
  const response = await fetch("/api/batch-enrollments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ batchId }),
  });
  return parseResponse<{
    requiresPayment?: boolean;
    batchId?: string;
    fee?: number;
    _id?: string;
    status?: string;
    paymentStatus?: string;
  }>(response);
}

/** POST /api/payment/initiate — SSLCommerz checkout for batch fee. */
export async function initiateBatchPayment(batchId: string) {
  const response = await fetch("/api/payment/initiate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ batchId }),
  });
  const body = (await response.json()) as ApiEnvelope<{
    checkout_url?: string;
    transactionId?: string;
    enrolled?: boolean;
    requiresPayment?: boolean;
  }>;
  if (!response.ok || !body.success) {
    throw new Error(body.error || "Payment initiation failed");
  }
  return body;
}

/** GET /api/batch-enrollments — current user's batch enrollments. */
export async function getMyBatchEnrollments() {
  const response = await fetch("/api/batch-enrollments", {
    credentials: "include",
    cache: "no-store",
  });
  return parseResponse<{ enrollments: BatchEnrollmentRow[] }>(response);
}
