import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import connectDB from "@/lib/mongodb";
import { authOptions } from "@/lib/auth";
import { assertResourceNoteDownload } from "@/app/api/_lib/resourceNotes";

interface RouteParams {
  params: Promise<{ id: string }>;
}

function resolveDownloadRedirectUrl(storedUrl: string, request: NextRequest): string {
  const trimmed = storedUrl.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return new URL(trimmed.startsWith("/") ? trimmed : `/${trimmed}`, request.url).toString();
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    const role = session?.user?.role;

    await connectDB();
    const { id } = await params;

    const access = await assertResourceNoteDownload(id, userId, role);
    if (access.error) {
      const status = access.status ?? 403;
      if (status === 403 && !userId) {
        return NextResponse.json(
          { success: false, error: "Sign in to download this note" },
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
    console.error("Resource note download error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
