import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import connectDB from "@/lib/mongodb";
import { authOptions } from "@/lib/auth";
import {
  checkTestYourselfAnswers,
  resolveTestYourselfAccess,
} from "@/app/api/_lib/testYourself";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    const access = await resolveTestYourselfAccess(
      session?.user?.id,
      session?.user?.role,
    );

    const body = (await request.json()) as Record<string, unknown>;
    const subject = typeof body.subject === "string" ? body.subject.trim() : "";
    const topic = typeof body.topic === "string" ? body.topic.trim() : "";

    if (!subject || !topic) {
      return NextResponse.json(
        { success: false, error: "subject and topic are required" },
        { status: 400 },
      );
    }

    const rawAnswers = Array.isArray(body.answers) ? body.answers : [];
    const answers = rawAnswers
      .filter(
        (a): a is Record<string, unknown> =>
          typeof a === "object" && a !== null,
      )
      .map((a) => ({
        questionId: String(a.questionId ?? "").trim(),
        optionIndex: Number.parseInt(String(a.optionIndex ?? ""), 10),
      }))
      .filter((a) => a.questionId && Number.isFinite(a.optionIndex));

    if (!answers.length) {
      return NextResponse.json(
        { success: false, error: "At least one answer is required" },
        { status: 400 },
      );
    }

    const checked = await checkTestYourselfAnswers(
      access,
      subject,
      topic,
      answers,
    );

    if (checked.error || !checked.results) {
      return NextResponse.json(
        { success: false, error: checked.error || "Could not check answers" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        score: checked.score,
        total: checked.total,
        results: checked.results,
      },
    });
  } catch (error) {
    console.error("Public test-yourself check error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
