import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const event =
      payload && typeof payload.event === "string" ? payload.event : "unknown";
    const transactionId =
      payload && typeof payload.transactionId === "string"
        ? payload.transactionId
        : "N/A";

    console.log("PAYMENT_LOG", { event, transactionId });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to log payment event" },
      { status: 500 },
    );
  }
}
