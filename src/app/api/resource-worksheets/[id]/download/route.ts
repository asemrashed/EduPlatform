import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import connectDB from "@/lib/mongodb";
import { authOptions } from "@/lib/auth";
import { assertResourceWorksheetDownload } from "@/app/api/_lib/resourceWorksheets";

interface RouteParams {
  params: Promise<{ id: string }>;
}

function resolveDownloadRedirectUrl(storedUrl: string, request: NextRequest): string {
  const trimmed = storedUrl.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return new URL(trimmed.startsWith("/") ? trimmed : `/${trimmed}`, request.url).toString();
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    await connectDB();
    const { id } = await params;

    const access = await assertResourceWorksheetDownload(
      id,
      session?.user?.id,
      session?.user?.role,
    );

    if (access.error) {
      const status = access.status ?? 403;
      if (status === 403 && !session?.user?.id) {
        return NextResponse.json(
          { success: false, error: "Sign in to download this worksheet" },
          { status: 401 },
        );
      }
      return NextResponse.json(
        { success: false, error: access.error },
        { status },
      );
    }

    return NextResponse.redirect(
      resolveDownloadRedirectUrl(access.url!, request),
      302,
    );
  } catch (error) {
    console.error("Resource worksheet download error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
