type InitiatePaymentInput = {
  amount: number;
  tran_id: string;
  cus_name: string;
  cus_email: string;
  cus_phone: string;
  cus_add1: string;
  cus_city: string;
};

type InitiatePaymentResult = {
  checkout_url: string;
  gatewayOrderId: string;
};

type VerifyPaymentResult = {
  success: boolean;
  raw: unknown;
};

export type SSLValidationRecord = Record<string, unknown>;

function readEnv(...keys: string[]): string {
  for (const key of keys) {
    const value = process.env[key];
    if (value && value.trim()) {
      return value.trim();
    }
  }
  return "";
}

function requireEnv(label: string, ...keys: string[]): string {
  const value = readEnv(...keys);
  if (!value) {
    throw new Error(`${label} is not configured`);
  }
  return value;
}

function readStoreId(): string {
  return requireEnv("SSL store ID", "SSL_STORE_ID", "SSLCOMMERZ_STORE_ID");
}

function readStorePassword(): string {
  return requireEnv(
    "SSL store password",
    "SSL_STORE_PASSWORD",
    "SSLCOMMERZ_STORE_PASSWORD",
  );
}

function readBaseUrl(): string {
  const explicit = readEnv("SSL_BASE_URL");
  if (explicit) return explicit.replace(/\/+$/, "");

  const environment = readEnv("SSLCOMMERZ_ENVIRONMENT").toLowerCase();
  const fallback =
    environment === "live"
      ? readEnv("SSLCOMMERZ_LIVE_URL")
      : readEnv("SSLCOMMERZ_SANDBOX_URL");

  if (!fallback) {
    throw new Error("SSL base URL is not configured");
  }

  return fallback.replace(/\/+$/, "");
}

function readValidationUrl(): string {
  const explicit = readEnv("SSL_VALIDATION_URL");
  if (explicit) return explicit.replace(/\/+$/, "");

  return readBaseUrl();
}

function readSuccessUrl(): string {
  return requireEnv(
    "SSL success URL",
    "SSL_SUCCESS_URL",
    "SSLCOMMERZ_SUCCESS_URL",
  );
}

function readFailUrl(): string {
  return requireEnv("SSL fail URL", "SSL_FAIL_URL", "SSLCOMMERZ_FAIL_URL");
}

function readCancelUrl(): string {
  return requireEnv(
    "SSL cancel URL",
    "SSL_CANCEL_URL",
    "SSLCOMMERZ_CANCEL_URL",
  );
}

async function parseJsonOrThrow(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new Error("SSLCommerz returned non-JSON response");
  }
}

export async function initiatePayment(
  input: InitiatePaymentInput,
): Promise<InitiatePaymentResult> {
  const storeId = readStoreId();
  const storePassword = readStorePassword();
  const baseUrl = readBaseUrl();

  const body = new URLSearchParams({
    store_id: storeId,
    store_passwd: storePassword,
    total_amount: String(input.amount),
    currency: "BDT",
    tran_id: input.tran_id,
    success_url: readSuccessUrl(),
    fail_url: readFailUrl(),
    cancel_url: readCancelUrl(),
    cus_name: input.cus_name,
    cus_email: input.cus_email,
    cus_phone: input.cus_phone,
    cus_add1: input.cus_add1,
    cus_city: input.cus_city,
    product_name: "Course Enrollment",
    product_category: "Education",
    product_profile: "general",
    shipping_method: "NO",
  });

  const response = await fetch(`${baseUrl}/gwprocess/v4/api.php`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: body.toString(),
    cache: "no-store",
  });

  const payload = (await parseJsonOrThrow(response)) as Record<string, unknown>;

  if (!response.ok) {
    throw new Error(`SSLCommerz initiate failed with status ${response.status}`);
  }

  const checkoutUrl = payload.GatewayPageURL;
  if (typeof checkoutUrl !== "string" || !checkoutUrl.trim()) {
    throw new Error("SSLCommerz initiate response missing GatewayPageURL");
  }

  return {
    checkout_url: checkoutUrl,
    gatewayOrderId: input.tran_id,
  };
}

function asRecord(raw: unknown): Record<string, unknown> {
  if (raw && typeof raw === "object") return raw as Record<string, unknown>;
  return {};
}

export function getValidationRecord(raw: unknown): SSLValidationRecord {
  return asRecord(raw);
}

export function getValidationStatus(record: SSLValidationRecord): string {
  const status =
    typeof record.status === "string" ? record.status : "";
  return status.toUpperCase();
}

export function isSuccessfulValidation(raw: unknown): boolean {
  const record = getValidationRecord(raw);
  const status = getValidationStatus(record);
  return status === "VALID" || status === "VALIDATED";
}

export function getValidationTranId(record: SSLValidationRecord): string {
  if (typeof record.tran_id === "string") return record.tran_id.trim();
  return "";
}

export function getValidationAmount(record: SSLValidationRecord): number {
  if (typeof record.amount === "number") return record.amount;
  if (typeof record.amount === "string") return Number(record.amount);
  return Number.NaN;
}

export async function verifyPayment(tran_id: string): Promise<VerifyPaymentResult> {
  if (!tran_id || !tran_id.trim()) {
    throw new Error("SSLCommerz verification requires tran_id");
  }

  const validationBase = readValidationUrl();
  const storeId = readStoreId();
  const storePassword = readStorePassword();

  const query = new URLSearchParams({
    store_id: storeId,
    store_passwd: storePassword,
    tran_id: tran_id.trim(),
    v: "1",
    format: "json",
  });

  const response = await fetch(
    `${validationBase}/validator/api/validationserverAPI.php?${query.toString()}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    },
  );

  const payload = await parseJsonOrThrow(response);

  if (!response.ok) {
    throw new Error(`SSLCommerz verify failed with status ${response.status}`);
  }

  return {
    success: isSuccessfulValidation(payload),
    raw: payload,
  };
}
