import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth/next";
import connectDB from "@/lib/mongodb";
import { authOptions } from "@/lib/auth";
import Chapter from "@/models/Chapter";
import Course from "@/models/Course";
import { listManagedChapters } from "@/lib/chapters/management";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    const role = session?.user?.role;
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }
    if (role !== "admin" && role !== "instructor") {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    await connectDB();
    const result = await listManagedChapters({
      userId,
      role,
      query: new URL(request.url).searchParams,
    });
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    if (error instanceof Error && error.message === "invalid_course") {
      return NextResponse.json(
        { success: false, error: "Invalid course ID" },
        { status: 400 },
      );
    }
    console.error("Chapters list error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch chapters" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    const role = session?.user?.role;
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }
    if (role !== "admin" && role !== "instructor") {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    await connectDB();
    const body = (await request.json()) as Record<string, unknown>;
    const title = String(body.title || "").trim();
    const courseId = String(body.course || "").trim();

    if (!title) {
      return NextResponse.json(
        { success: false, error: "Chapter title is required" },
        { status: 400 },
      );
    }
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return NextResponse.json(
        { success: false, error: "Valid course ID is required" },
        { status: 400 },
      );
    }

    const course = await Course.findById(courseId).lean();
    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 },
      );
    }

    if (role === "instructor") {
      const canManage =
        String(course.instructor || "") === userId ||
        String(course.createdBy || "") === userId;
      if (!canManage) {
        return NextResponse.json(
          { success: false, error: "Forbidden" },
          { status: 403 },
        );
      }
    }

    const fallbackOrder =
      (await Chapter.countDocuments({ course: course._id })) + 1;
    const chapter = await Chapter.create({
      title,
      description: String(body.description || "").trim() || undefined,
      course: course._id,
      order:
        typeof body.order === "number" && body.order > 0
          ? body.order
          : fallbackOrder,
      isPublished: Boolean(body.isPublished),
    });

    return NextResponse.json({
      success: true,
      data: {
        _id: String(chapter._id),
        title: chapter.title,
        description: chapter.description || undefined,
        course: String(chapter.course),
        order: chapter.order,
        isPublished: chapter.isPublished,
        createdAt: chapter.createdAt,
        updatedAt: chapter.updatedAt,
      },
    });
  } catch (error) {
    console.error("Chapter create error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create chapter" },
      { status: 500 },
    );
  }
}
