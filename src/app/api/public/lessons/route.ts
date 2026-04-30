import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import Course from "@/models/Course";
import Lesson from "@/models/Lesson";
import Chapter from "@/models/Chapter";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId") || searchParams.get("course");
    const chapterId =
      searchParams.get("chapterId") || searchParams.get("chapter");
    const isPublishedParam = searchParams.get("isPublished");
    const limit = Number.parseInt(searchParams.get("limit") || "1000", 10);

    if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
      return NextResponse.json(
        { success: false, error: "Valid course ID is required" },
        { status: 400 },
      );
    }

    const course = await Course.findOne({
      _id: courseId,
      status: "published",
      isHidden: { $ne: true },
    })
      .select("_id")
      .lean();

    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found or not published" },
        { status: 404 },
      );
    }

    const filter: Record<string, unknown> = { course: courseId };

    if (chapterId) {
      if (!mongoose.Types.ObjectId.isValid(chapterId)) {
        return NextResponse.json(
          { success: false, error: "Invalid chapter ID" },
          { status: 400 },
        );
      }
      filter.chapter = chapterId;
    }

    if (isPublishedParam === "true") {
      filter.isPublished = true;
    }

    const lessons = await Lesson.find(filter)
      .populate("chapter", "title order")
      .sort({ order: 1 })
      .limit(Number.isFinite(limit) && limit > 0 ? limit : 1000)
      .lean();

    return NextResponse.json({
      success: true,
      data: {
        lessons: lessons.map((lesson: any) => ({
          ...lesson,
          _id: String(lesson._id),
          course: lesson.course ? String(lesson.course) : lesson.course,
          chapter:
            lesson.chapter && typeof lesson.chapter === "object"
              ? {
                  ...lesson.chapter,
                  _id: lesson.chapter._id
                    ? String(lesson.chapter._id)
                    : lesson.chapter._id,
                }
              : lesson.chapter
                ? String(lesson.chapter)
                : lesson.chapter,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching public lessons:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch lessons" },
      { status: 500 },
    );
  }
}
