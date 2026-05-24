import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isMockApiEnabled } from "@/lib/mockApi/isMockApiEnabled";
import { handleMockApi } from "@/lib/mockApi/mockApiRouter";

export const dynamic = "force-dynamic";

function apiNotFound(segments: string[]) {
  return NextResponse.json(
    {
      success: false,
      error: "Not found",
      path: segments.length > 0 ? segments.join("/") : undefined,
    },
    { status: 404 },
  );
}

async function run(req: NextRequest, segments: string[]) {
  if (!isMockApiEnabled()) {
    return apiNotFound(segments);
  }
  return handleMockApi(req, segments);
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ path?: string[] }> },
) {
  const { path = [] } = await ctx.params;
  return run(req, path);
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ path?: string[] }> },
) {
  const { path = [] } = await ctx.params;
  return run(req, path);
}

export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ path?: string[] }> },
) {
  const { path = [] } = await ctx.params;
  return run(req, path);
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ path?: string[] }> },
) {
  const { path = [] } = await ctx.params;
  return run(req, path);
}

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ path?: string[] }> },
) {
  const { path = [] } = await ctx.params;
  return run(req, path);
}
