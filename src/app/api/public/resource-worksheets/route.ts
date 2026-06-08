import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import connectDB from "@/lib/mongodb";
import { authOptions } from "@/lib/auth";
import ResourceWorksheet from "@/models/ResourceWorksheet";
import {
  mapResourceWorksheet,
  resolveWorksheetBrowseCanDownload,
  VISIBLE_RESOURCE_WORKSHEET_FILTER,
} from "@/app/api/_lib/resourceWorksheets";
import {
  resolveResourceCenterAccess,
  summarizeResourceBrowseAccess,
} from "@/app/api/_lib/resourceAccess";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    const role = session?.user?.role;
    const access = await resolveResourceCenterAccess(userId, role);

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim();
    const subject = searchParams.get("subject")?.trim();

    const query: Record<string, unknown> = { ...VISIBLE_RESOURCE_WORKSHEET_FILTER };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
        { topic: { $regex: search, $options: "i" } },
      ];
    }
    if (subject) query.subject = { $regex: subject, $options: "i" };

    const rows = await ResourceWorksheet.find(query)
      .sort({ subject: 1, topic: 1, createdAt: -1 })
      .lean();

    const worksheets = await Promise.all(
      rows.map(async (row) => {
        const canDownload = await resolveWorksheetBrowseCanDownload(
          userId,
          role,
          row as { accessPolicy?: string; subject?: string; batchId?: unknown },
        );
        return mapResourceWorksheet(row as Record<string, unknown>, {
          includePdf: false,
          canDownload,
        });
      }),
    );

    return NextResponse.json({
      success: true,
      data: {
        worksheets,
        subjects: [...new Set(worksheets.map((w) => w.subject))].sort(),
        access,
        stats: summarizeResourceBrowseAccess(worksheets),
      },
    });
  } catch (error) {
    console.error("Public resource worksheets error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
