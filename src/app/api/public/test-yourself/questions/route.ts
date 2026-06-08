import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import connectDB from "@/lib/mongodb";
import { authOptions } from "@/lib/auth";
import {
  listTestYourselfQuestions,
  resolveTestYourselfAccess,
} from "@/app/api/_lib/testYourself";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    const access = await resolveTestYourselfAccess(
      session?.user?.id,
      session?.user?.role,
    );

    const { searchParams } = new URL(request.url);
    const subject = searchParams.get("subject")?.trim();
    const topic = searchParams.get("topic")?.trim();

    if (!subject || !topic) {
      return NextResponse.json(
        { success: false, error: "subject and topic are required" },
        { status: 400 },
      );
    }

    const payload = await listTestYourselfQuestions(access, subject, topic);

    if (payload.total === 0) {
      return NextResponse.json(
        { success: false, error: "No questions found for this topic" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        subject,
        topic,
        questions: payload.questions,
        access: {
          fullAccess: access.fullAccess,
          freeLimit: access.freeLimit,
          total: payload.total,
          lockedCount: access.fullAccess
            ? 0
            : Math.max(0, payload.total - access.freeLimit),
        },
      },
    });
  } catch (error) {
    console.error("Public test-yourself questions error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
