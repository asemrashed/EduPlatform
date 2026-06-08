import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import connectDB from "@/lib/mongodb";
import { authOptions } from "@/lib/auth";
import { resolveResourceCenterAccess } from "@/app/api/_lib/resourceAccess";
import {
  listTestYourselfTopics,
  resolveTestYourselfAccess,
} from "@/app/api/_lib/testYourself";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    const centerAccess = await resolveResourceCenterAccess(
      session?.user?.id,
      session?.user?.role,
    );
    const access = await resolveTestYourselfAccess(
      session?.user?.id,
      session?.user?.role,
    );

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim().toLowerCase();

    let topics = await listTestYourselfTopics(access);

    if (search) {
      topics = topics.filter(
        (t) =>
          t.subject.toLowerCase().includes(search) ||
          t.topic.toLowerCase().includes(search),
      );
    }

    const subjects = [...new Set(topics.map((t) => t.subject))].sort();

    return NextResponse.json({
      success: true,
      data: {
        topics,
        subjects,
        access: centerAccess,
      },
    });
  } catch (error) {
    console.error("Public test-yourself catalog error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
