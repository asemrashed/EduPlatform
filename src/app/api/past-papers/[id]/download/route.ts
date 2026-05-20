import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import connectDB from "@/lib/mongodb";
import { authOptions } from "@/lib/auth";
import {
  assertStudentPastPaperDownload,
  parsePastPaperFileType,
} from "@/app/api/_lib/pastPapers";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/** Next.js redirect requires an absolute URL; uploads are stored as `/uploads/...` paths. */
function resolveDownloadRedirectUrl(storedUrl: string, request: NextRequest): string {
  const trimmed = storedUrl.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return new URL(trimmed.startsWith("/") ? trimmed : `/${trimmed}`, request.url)
    .toString();
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    const role = session?.user?.role;

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    if (role !== "student") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const fileType = parsePastPaperFileType(searchParams.get("type"));

    if (!fileType) {
      return NextResponse.json(
        {
          error:
            "Invalid type. Use question_paper, marks_pdf, or work_solution",
        },
        { status: 400 },
      );
    }

    const access = await assertStudentPastPaperDownload(id, userId, fileType);
    if (access.error) {
      return NextResponse.json(
        { error: access.error },
        { status: access.status ?? 403 },
      );
    }

    return NextResponse.redirect(
      resolveDownloadRedirectUrl(access.url!, request),
      302,
    );
  } catch (error) {
    console.error("Past paper download error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
