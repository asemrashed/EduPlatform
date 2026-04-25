import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import Course from "@/models/Course";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid course ID" },
        { status: 400 },
      );
    }

    const course = await Course.findOne({
      _id: id,
      status: "published",
      isHidden: { $ne: true },
    })
      .populate("createdBy", "name firstName lastName email role phone avatar")
      .lean();

    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found or not published" },
        { status: 404 },
      );
    }

    const courseData = course as any;
    const finalPrice = courseData.isPaid
      ? (courseData.salePrice || courseData.price || 0)
      : 0;
    const discountPercentage =
      courseData.isPaid &&
      courseData.salePrice &&
      courseData.price &&
      courseData.salePrice < courseData.price
        ? Math.round(
            ((courseData.price - courseData.salePrice) / courseData.price) * 100,
          )
        : 0;

    const getDisplayName = (user: any) => {
      const fullName = [user?.firstName, user?.lastName]
        .filter(Boolean)
        .join(" ")
        .trim();
      return fullName || user?.name || user?.email || "Unknown";
    };

    return NextResponse.json({
      success: true,
      data: {
        ...courseData,
        _id: String(courseData._id),
        status: "published",
        finalPrice,
        discountPercentage,
        enrollmentCount:
          typeof courseData.enrollmentCount === "number"
            ? courseData.enrollmentCount
            : 0,
        createdBy: {
          _id: courseData.createdBy?._id
            ? String(courseData.createdBy._id)
            : "",
          name: getDisplayName(courseData.createdBy),
          role: courseData.createdBy?.role || "instructor",
          email: courseData.createdBy?.email || undefined,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching public course:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch course" },
      { status: 500 },
    );
  }
}
