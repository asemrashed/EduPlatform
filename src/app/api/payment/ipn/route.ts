import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const tran_id = formData.get("tran_id");
  const status = formData.get("status");
  
  // Store raw response for debugging - helps with disputes[citation:2]
  console.log("IPN Raw Data:", Object.fromEntries(formData));
  
  if (status === "VALID") {
    // Update order status to confirmed in your database
    // This is the AUTHORITATIVE confirmation - don't rely only on success_url[citation:2]
  }
  
  return NextResponse.json({ status: "success" });
}