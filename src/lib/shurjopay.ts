type ShurjopayEnvironment = "sandbox" | "live";

type ShurjopayTokenResponse = {
  token: string;
  store_id: string | number;
};

type ShurjopayInitiateInput = {
  token: string;
  store_id: string | number;
  transactionId: string;
  amount: number;
  courseId: string;
  userId: string;
};

type ShurjopayInitiateResponse = {
  checkout_url: string;
  sp_order_id: string;
};

const PLACEHOLDER_RETURN_URL = process.env.SHURJOPAY_RETURN_URL || 'localhost:3000/payment/success';
const PLACEHOLDER_CANCEL_URL = process.env.SHURJOPAY_CANCEL_URL || 'localhost:3000/payment/cancel';
const PLACEHOLDER_CLIENT_IP = process.env.SHURJOPAY_CLIENT_IP || '127.0.0.1';

function readEnvironment(): ShurjopayEnvironment {
  return process.env.SHURJOPAY_ENVIRONMENT === "live" ? "live" : "sandbox";
}

function readBaseUrl(): string {
  const env = readEnvironment();
  const baseUrl =
    env === "live"
      ? process.env.SHURJOPAY_LIVE_API_URL
      : process.env.SHURJOPAY_API_URL;

  if (!baseUrl) {
    throw new Error("ShurjoPay base URL is not configured");
  }

  return baseUrl.replace(/\/+$/, "");
}

function readCredentials(): { username: string; password: string } {
  const env = readEnvironment();
  const username =
    env === "live"
      ? process.env.SHURJOPAY_LIVE_USERNAME
      : process.env.SHURJOPAY_USERNAME;
  const password =
    env === "live"
      ? process.env.SHURJOPAY_LIVE_PASSWORD
      : process.env.SHURJOPAY_PASSWORD;

  if (!username || !password) {
    throw new Error("ShurjoPay credentials are not configured");
  }

  return { username, password };
}

function readClientIp(): string {
  return process.env.SHURJOPAY_CLIENT_IP || PLACEHOLDER_CLIENT_IP;
}

function readOrderPrefix(): string {
  return process.env.SHURJOPAY_ORDER_PREFIX || "NOK";
}

function readReturnUrl(): string {
  return process.env.SHURJOPAY_RETURN_URL || PLACEHOLDER_RETURN_URL;
}

function readCancelUrl(): string {
  return process.env.SHURJOPAY_CANCEL_URL || PLACEHOLDER_CANCEL_URL;
}

async function parseJsonOrThrow(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new Error("ShurjoPay returned non-JSON response");
  }
}

export async function getShurjopayToken(): Promise<ShurjopayTokenResponse> {
  const baseUrl = readBaseUrl();
  const { username, password } = readCredentials();

  const response = await fetch(`${baseUrl}/api/get_token/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      username,
      password,
      client_ip: readClientIp(),
    }),
    cache: "no-store",
  });
  const payload = (await parseJsonOrThrow(response)) as Record<string, unknown>;

  if (!response.ok) {
    throw new Error(
      `ShurjoPay token request failed with status ${response.status}`,
    );
  }

  console.log("TOKEN RESPONSE BODY:", payload); 

  // support both formats
  const token =
    typeof payload.token === "string"
      ? payload.token
      : typeof payload.sp_token === "string"
      ? payload.sp_token
      : null;
  
  const storeId =
    typeof payload.store_id === "string" ||
    typeof payload.store_id === "number"
      ? payload.store_id
      : typeof payload.sp_store_id === "string" ||
        typeof payload.sp_store_id === "number"
      ? payload.sp_store_id
      : null;
  
  if (!token || !storeId) {
    throw new Error(
      `Invalid token response from ShurjoPay: ${JSON.stringify(payload)}`
    );
  }
  // console.log("TOKEN:", token);
  // console.log("STORE ID:", storeId);
  return {
    token,
    store_id: storeId,
  };
}
export async function initiateShurjopayPayment(
  input: ShurjopayInitiateInput,
): Promise<ShurjopayInitiateResponse> {
  const baseUrl = readBaseUrl();

  const response = await fetch(`${baseUrl}/api/secret-pay`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${input.token}`,
    },
    body: JSON.stringify({
      token: input.token,
      store_id: input.store_id,
      prefix: readOrderPrefix(),
      order_id: input.transactionId,
      amount: input.amount,
      currency: "BDT",
      return_url: readReturnUrl(),
      cancel_url: readCancelUrl(),
      client_ip: readClientIp(),
      value1: input.userId,
      value2: input.courseId,
      // For Testing
      customer_name: "Test User",
      customer_address: "Dhaka",
      customer_phone: "01700000000",
      customer_city: "Dhaka",
    }),
    cache: "no-store",
  });

  const payload = (await parseJsonOrThrow(response)) as Record<string, unknown>;

  if (!response.ok) {
    throw new Error(
      `ShurjoPay secret-pay request failed with status ${response.status}`,
    );
  }

  const checkoutUrl = payload.checkout_url;
  const spOrderId = payload.sp_order_id;
  console.log("payload:", payload);

  if (
    typeof checkoutUrl !== "string" ||
    checkoutUrl.trim() === "" ||
    typeof spOrderId !== "string" ||
    spOrderId.trim() === ""
  ) {
    throw new Error("ShurjoPay secret-pay response is missing required fields");
  }

  return {
    checkout_url: checkoutUrl,
    sp_order_id: spOrderId,
  };
}

export async function verifyShurjopayPayment(
  spOrderId: string,
): Promise<unknown> {
  if (!spOrderId || !spOrderId.trim()) {
    throw new Error("ShurjoPay verification requires spOrderId");
  }

  const tokenData = await getShurjopayToken();
  const baseUrl = readBaseUrl();

  const response = await fetch(`${baseUrl}/api/verification`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${tokenData.token}`,
    },
    body: JSON.stringify({
      order_id: spOrderId,
    }),
    cache: "no-store",
  });

  const payload = await parseJsonOrThrow(response);

  if (!response.ok) {
    throw new Error(
      `ShurjoPay verification request failed with status ${response.status}`,
    );
  }

  return payload;
}
