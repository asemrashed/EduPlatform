import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth/next";
import connectDB from "@/lib/mongodb";
import { authOptions } from "@/lib/auth";
import Lesson from "@/models/Lesson";
import Course from "@/models/Course";

interface RouteParams {
  params: Promise<{ id: string }>;
}

async function canManageLesson(lesson: any, userId: string, role: string) {
  if (role === "admin") {
    return true;
  }
  const course = await Course.findById(lesson.course)
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

function mapLesson(lesson: any) {
  return {
    _id: String(lesson._id),
    title: lesson.title || "",
    description: lesson.description || undefined,
    content: lesson.content || undefined,
    chapter:
      lesson.chapter && typeof lesson.chapter === "object"
        ? {
            _id: String(lesson.chapter._id || ""),
            title: lesson.chapter.title || undefined,
            order:
              typeof lesson.chapter.order === "number"
                ? lesson.chapter.order
                : undefined,
          }
        : String(lesson.chapter),
    course: String(lesson.course),
    order: typeof lesson.order === "number" ? lesson.order : 0,
    duration: typeof lesson.duration === "number" ? lesson.duration : undefined,
    youtubeVideoId: lesson.youtubeVideoId || undefined,
    videoUrl: lesson.videoUrl || undefined,
    videoDuration:
      typeof lesson.videoDuration === "number"
        ? lesson.videoDuration
        : undefined,
    attachments: Array.isArray(lesson.attachments) ? lesson.attachments : [],
    isPublished: Boolean(lesson.isPublished),
    isFree: Boolean(lesson.isFree),
    youtubeEmbedUrl: lesson.youtubeEmbedUrl || undefined,
    youtubeThumbnailUrl: lesson.youtubeThumbnailUrl || undefined,
    youtubeWatchUrl: lesson.youtubeWatchUrl || undefined,
    createdAt: lesson.createdAt,
    updatedAt: lesson.updatedAt,
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
        { success: false, error: "Invalid lesson ID" },
        { status: 400 },
      );
    }

    const existing = await Lesson.findById(id).lean();
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Lesson not found" },
        { status: 404 },
      );
    }
    const allowed = await canManageLesson(existing, userId, role || "");
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
    if (typeof body.content === "string") {
      updateData.content = body.content.trim();
    }
    if (typeof body.order === "number" && body.order > 0) {
      updateData.order = body.order;
    }
    if (typeof body.duration === "number" && body.duration >= 0) {
      updateData.duration = body.duration;
    }
    if (typeof body.youtubeVideoId === "string") {
      updateData.youtubeVideoId = body.youtubeVideoId.trim() || undefined;
    }
    if (typeof body.videoUrl === "string") {
      updateData.videoUrl = body.videoUrl.trim() || undefined;
    }
    if (typeof body.videoDuration === "number" && body.videoDuration >= 0) {
      updateData.videoDuration = body.videoDuration;
    }
    if (Array.isArray(body.attachments)) {
      updateData.attachments = body.attachments;
    }
    if (typeof body.isPublished === "boolean") {
      updateData.isPublished = body.isPublished;
    }
    if (typeof body.isFree === "boolean") {
      updateData.isFree = body.isFree;
    }

    const updated = await Lesson.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true },
    )
      .populate("chapter", "title order")
      .lean();

    return NextResponse.json({ success: true, data: mapLesson(updated) });
  } catch (error) {
    console.error("Lesson update error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update lesson" },
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
        { success: false, error: "Invalid lesson ID" },
        { status: 400 },
      );
    }

    const existing = await Lesson.findById(id).lean();
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Lesson not found" },
        { status: 404 },
      );
    }
    const allowed = await canManageLesson(existing, userId, role || "");
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    await Lesson.findByIdAndDelete(id);
    return NextResponse.json({ success: true, data: { _id: id } });
  } catch (error) {
    console.error("Lesson delete error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete lesson" },
      { status: 500 },
    );
  }
}
