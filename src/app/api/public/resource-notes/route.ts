import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import connectDB from "@/lib/mongodb";
import { authOptions } from "@/lib/auth";
import ResourceNote from "@/models/ResourceNote";
import {
  mapResourceNote,
  resolveBrowseCanDownload,
  VISIBLE_RESOURCE_NOTE_FILTER,
} from "@/app/api/_lib/resourceNotes";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    const role = session?.user?.role;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim();
    const subject = searchParams.get("subject")?.trim();
    const topic = searchParams.get("topic")?.trim();

    const query: Record<string, unknown> = { ...VISIBLE_RESOURCE_NOTE_FILTER };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
        { topic: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    if (subject) query.subject = { $regex: subject, $options: "i" };
    if (topic) query.topic = { $regex: topic, $options: "i" };

    const rows = await ResourceNote.find(query)
      .sort({ subject: 1, topic: 1, createdAt: -1 })
      .lean();

    const notes = await Promise.all(
      rows.map(async (row) => {
        const canDownload = await resolveBrowseCanDownload(
          userId,
          role,
          row as { accessPolicy?: string; subject?: string },
        );
        return mapResourceNote(row as Record<string, unknown>, {
          includePdf: false,
          canDownload,
        });
      }),
    );

    const subjects = [...new Set(notes.map((n) => n.subject))].sort();

    return NextResponse.json({
      success: true,
      data: { notes, subjects },
    });
  } catch (error) {
    console.error("Public resource notes error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
