import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import Course from "@/models/Course";
import Chapter from "@/models/Chapter";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId") || searchParams.get("course");
    const isPublishedParam = searchParams.get("isPublished");
    const limit = Number.parseInt(searchParams.get("limit") || "100", 10);

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
    if (isPublishedParam === "true") {
      filter.isPublished = true;
    }

    const chapters = await Chapter.find(filter)
      .populate('course', 'title')
      .sort({ order: 1 })
      .limit(Number.isFinite(limit) && limit > 0 ? limit : 100)
      .lean();

    return NextResponse.json({
      success: true,
      data: {
        chapters: chapters.map((chapter: any) => ({
          ...chapter,
          _id: String(chapter._id),
          course: chapter.course ? String(chapter.course) : chapter.course,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching public chapters:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch chapters" },
      { status: 500 },
    );
  }
}
