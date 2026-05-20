import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import Course from "@/models/Course";
import {
  getInstructorDisplayName,
  getInstructorStats,
  INSTRUCTOR_USER_SELECT,
  mapInstructorProfile,
} from "@/app/api/_lib/instructorProfile";

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
      .populate("instructor", INSTRUCTOR_USER_SELECT)
      .populate("createdBy", INSTRUCTOR_USER_SELECT)
      .lean();

    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found or not published" },
        { status: 404 },
      );
    }

    const courseData = course as Record<string, unknown>;
    const price = Number(courseData.price) || 0;
    const salePrice = Number(courseData.salePrice) || 0;
    const finalPrice = courseData.isPaid ? salePrice || price : 0;
    const discountPercentage =
      courseData.isPaid && salePrice > 0 && price > 0 && salePrice < price
        ? Math.round(((price - salePrice) / price) * 100)
        : 0;

    const instructorUser =
      (courseData.instructor as Record<string, unknown> | null) ||
      (courseData.createdBy as Record<string, unknown> | null);

    let instructor:
      | ReturnType<typeof mapInstructorProfile> & {
          coursesCount: number;
          studentsCount: number;
          rating: number;
        }
      | undefined;

    if (instructorUser?._id) {
      const profile = mapInstructorProfile(instructorUser);
      const stats = await getInstructorStats(profile._id);
      instructor = { ...profile, ...stats };
    }

    const createdByRaw = courseData.createdBy as Record<string, unknown> | null;
    const createdBy = createdByRaw?._id
      ? {
          _id: String(createdByRaw._id),
          name: getInstructorDisplayName(createdByRaw),
          role: String(createdByRaw.role || "instructor"),
          email: createdByRaw.email
            ? String(createdByRaw.email)
            : undefined,
        }
      : {
          _id: "",
          name: "Unknown",
          role: "instructor",
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
        createdBy,
        instructor,
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
