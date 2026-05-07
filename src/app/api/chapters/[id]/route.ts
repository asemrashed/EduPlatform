import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth/next";
import connectDB from "@/lib/mongodb";
import { authOptions } from "@/lib/auth";
import Chapter from "@/models/Chapter";
import Course from "@/models/Course";
import Lesson from "@/models/Lesson";

interface RouteParams {
  params: Promise<{ id: string }>;
}

async function canManageChapter(chapter: any, userId: string, role: string) {
  if (role === "admin") {
    return true;
  }
  const course = await Course.findById(chapter.course)
    .select("_id instructor createdBy")
    .lean();
  if (!course) {
    return false;
  }
  return (
    String(course.instructor || "") === userId ||
    String(course.createdBy || "") === userId
  );
}

function mapChapter(chapter: any) {
  return {
    _id: String(chapter._id),
    title: chapter.title || "",
    description: chapter.description || undefined,
    course: String(chapter.course),
    order: typeof chapter.order === "number" ? chapter.order : 0,
    isPublished: Boolean(chapter.isPublished),
    createdAt: chapter.createdAt,
    updatedAt: chapter.updatedAt,
  };
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
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
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid chapter ID" },
        { status: 400 },
      );
    }

    const existing = await Chapter.findById(id).lean();
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Chapter not found" },
        { status: 404 },
      );
    }
    const allowed = await canManageChapter(existing, userId, role || "");
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    const body = (await request.json()) as Record<string, unknown>;
    const updateData: Record<string, unknown> = {};
    if (typeof body.title === "string") updateData.title = body.title.trim();
    if (typeof body.description === "string") {
      updateData.description = body.description.trim();
    }
    if (typeof body.order === "number" && body.order > 0) {
      updateData.order = body.order;
    }
    if (typeof body.isPublished === "boolean") {
      updateData.isPublished = body.isPublished;
    }

    const updated = await Chapter.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true },
    ).lean();

    return NextResponse.json({ success: true, data: mapChapter(updated) });
  } catch (error) {
    console.error("Chapter update error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update chapter" },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
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
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid chapter ID" },
        { status: 400 },
      );
    }

    const existing = await Chapter.findById(id).lean();
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Chapter not found" },
        { status: 404 },
      );
    }
    const allowed = await canManageChapter(existing, userId, role || "");
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    const lessonCount = await Lesson.countDocuments({ chapter: id });
    if (lessonCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot delete chapter with existing lessons",
        },
        { status: 409 },
      );
    }

    await Chapter.findByIdAndDelete(id);
    return NextResponse.json({ success: true, data: { _id: id } });
  } catch (error) {
    console.error("Chapter delete error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete chapter" },
      { status: 500 },
    );
  }
}
