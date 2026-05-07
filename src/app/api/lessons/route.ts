import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth/next";
import connectDB from "@/lib/mongodb";
import { authOptions } from "@/lib/auth";
import Lesson from "@/models/Lesson";
import Chapter from "@/models/Chapter";
import Course from "@/models/Course";
import { listManagedLessons } from "@/lib/lessons/management";

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
    const result = await listManagedLessons({
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
    if (error instanceof Error && error.message === "invalid_chapter") {
      return NextResponse.json(
        { success: false, error: "Invalid chapter ID" },
        { status: 400 },
      );
    }
    console.error("Lessons list error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch lessons" },
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
    const chapterId = String(body.chapter || "").trim();
    const courseId = String(body.course || "").trim();

    if (!title) {
      return NextResponse.json(
        { success: false, error: "Lesson title is required" },
        { status: 400 },
      );
    }
    if (!mongoose.Types.ObjectId.isValid(chapterId)) {
      return NextResponse.json(
        { success: false, error: "Valid chapter ID is required" },
        { status: 400 },
      );
    }
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return NextResponse.json(
        { success: false, error: "Valid course ID is required" },
        { status: 400 },
      );
    }

    const chapter = await Chapter.findById(chapterId)
      .select("_id course")
      .lean();
    if (!chapter || String(chapter.course) !== courseId) {
      return NextResponse.json(
        { success: false, error: "Chapter not found for this course" },
        { status: 400 },
      );
    }

    const course = await Course.findById(courseId)
      .select("_id instructor createdBy")
      .lean();
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
      (await Lesson.countDocuments({ chapter: chapter._id })) + 1;
    const lesson = await Lesson.create({
      title,
      description: String(body.description || "").trim() || undefined,
      content: String(body.content || "").trim() || undefined,
      chapter: chapter._id,
      course: course._id,
      order:
        typeof body.order === "number" && body.order > 0
          ? body.order
          : fallbackOrder,
      duration:
        typeof body.duration === "number" && body.duration >= 0
          ? body.duration
          : undefined,
      youtubeVideoId: String(body.youtubeVideoId || "").trim() || undefined,
      videoUrl: String(body.videoUrl || "").trim() || undefined,
      videoDuration:
        typeof body.videoDuration === "number" && body.videoDuration >= 0
          ? body.videoDuration
          : undefined,
      attachments: Array.isArray(body.attachments) ? body.attachments : [],
      isPublished: Boolean(body.isPublished),
      isFree: Boolean(body.isFree),
    });

    const populated = await Lesson.findById(lesson._id)
      .populate("chapter", "title order")
      .lean();
    const mapped = {
      _id: String(populated?._id || lesson._id),
      title: populated?.title || lesson.title,
      description: populated?.description || undefined,
      content: populated?.content || undefined,
      chapter: populated?.chapter
        ? {
            _id: String((populated.chapter as any)._id || ""),
            title: (populated.chapter as any).title || undefined,
            order:
              typeof (populated.chapter as any).order === "number"
                ? (populated.chapter as any).order
                : undefined,
          }
        : String(lesson.chapter),
      course: String(populated?.course || lesson.course),
      order: populated?.order || lesson.order,
      duration: populated?.duration || undefined,
      youtubeVideoId: populated?.youtubeVideoId || undefined,
      videoUrl: populated?.videoUrl || undefined,
      videoDuration: populated?.videoDuration || undefined,
      attachments: Array.isArray(populated?.attachments)
        ? populated?.attachments
        : [],
      isPublished: Boolean(populated?.isPublished),
      isFree: Boolean(populated?.isFree),
      youtubeEmbedUrl: (populated as any)?.youtubeEmbedUrl || undefined,
      youtubeThumbnailUrl: (populated as any)?.youtubeThumbnailUrl || undefined,
      youtubeWatchUrl: (populated as any)?.youtubeWatchUrl || undefined,
      createdAt: populated?.createdAt || lesson.createdAt,
      updatedAt: populated?.updatedAt || lesson.updatedAt,
    };

    return NextResponse.json({ success: true, data: mapped });
  } catch (error) {
    console.error("Lesson create error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create lesson" },
      { status: 500 },
    );
  }
}
