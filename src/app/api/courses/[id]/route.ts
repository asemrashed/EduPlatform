import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth/next";
import connectDB from "@/lib/mongodb";
import { authOptions } from "@/lib/auth";
import Course from "@/models/Course";

interface RouteParams {
  params: Promise<{ id: string }>;
}

function toObjectId(value: unknown): mongoose.Types.ObjectId | null {
  if (typeof value !== "string" || !mongoose.Types.ObjectId.isValid(value)) {
    return null;
  }
  return new mongoose.Types.ObjectId(value);
}

function mapCourse(course: any) {
  const price = typeof course.price === "number" ? course.price : 0;
  const salePrice =
    typeof course.salePrice === "number" ? course.salePrice : undefined;
  const isPaid = Boolean(course.isPaid);
  const finalPrice = isPaid ? (salePrice ?? price) : 0;
  const discountPercentage =
    isPaid && salePrice !== undefined && price > 0 && salePrice < price
      ? Math.round(((price - salePrice) / price) * 100)
      : 0;

  return {
    _id: String(course._id),
    title: course.title || "",
    shortDescription: course.shortDescription || undefined,
    description: course.description || undefined,
    category: course.category || undefined,
    thumbnailUrl: course.thumbnailUrl || undefined,
    isPaid,
    status: (course.status || "draft") as "draft" | "published" | "archived",
    isHidden: Boolean(course.isHidden),
    price,
    salePrice,
    finalPrice,
    discountPercentage,
    displayOrder:
      typeof course.displayOrder === "number" ? course.displayOrder : undefined,
    duration: typeof course.duration === "number" ? course.duration : undefined,
    difficulty: course.difficulty || undefined,
    lessonCount: typeof course.lessonCount === "number" ? course.lessonCount : 0,
    enrollmentCount:
      typeof course.enrollmentCount === "number" ? course.enrollmentCount : 0,
    tags: Array.isArray(course.tags) ? course.tags : [],
    createdBy: course.createdBy
      ? {
          _id: String(course.createdBy._id || ""),
          name: String(course.createdBy.name || ""),
          email: String(course.createdBy.email || ""),
          role: String(course.createdBy.role || ""),
        }
      : undefined,
    instructor: course.instructor
      ? {
          _id: String(course.instructor._id || ""),
          name:
            String(course.instructor.name || "").trim() ||
            `${course.instructor.firstName || ""} ${course.instructor.lastName || ""}`.trim(),
          email: String(course.instructor.email || ""),
          role: String(course.instructor.role || "instructor"),
        }
      : undefined,
    createdAt: course.createdAt,
    updatedAt: course.updatedAt,
  };
}

async function getAuthContext() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const role = session?.user?.role;
  return { userId, role };
}

function canManageCourse(course: any, userId: string, role: string): boolean {
  if (role === "admin") {
    return true;
  }
  if (role !== "instructor") {
    return false;
  }
  const courseInstructor = course?.instructor
    ? String(course.instructor._id || course.instructor)
    : "";
  const courseCreator = course?.createdBy
    ? String(course.createdBy._id || course.createdBy)
    : "";
  return courseInstructor === userId || courseCreator === userId;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { userId, role } = await getAuthContext();
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
        { success: false, error: "Invalid course ID" },
        { status: 400 },
      );
    }

    const course = await Course.findById(id)
      .populate("createdBy", "name email role")
      .populate("instructor", "name firstName lastName email role")
      .lean();
    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 },
      );
    }
    if (!canManageCourse(course, userId, role || "")) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    return NextResponse.json({ success: true, data: mapCourse(course) });
  } catch (error) {
    console.error("Course read error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch course" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId, role } = await getAuthContext();
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
        { success: false, error: "Invalid course ID" },
        { status: 400 },
      );
    }

    const existing = await Course.findById(id).lean();
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 },
      );
    }
    if (!canManageCourse(existing, userId, role || "")) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    const body = (await request.json()) as Record<string, unknown>;
    const updateData: Record<string, unknown> = {};

    if (typeof body.title === "string") updateData.title = body.title.trim();
    if (typeof body.shortDescription === "string") {
      updateData.shortDescription = body.shortDescription.trim();
    }
    if (typeof body.description === "string") {
      updateData.description = body.description.trim();
    }
    if (typeof body.category === "string") updateData.category = body.category.trim();
    if (typeof body.thumbnailUrl === "string") {
      updateData.thumbnailUrl = body.thumbnailUrl.trim();
    }
    if (typeof body.isPaid === "boolean") updateData.isPaid = body.isPaid;
    if (typeof body.isHidden === "boolean") updateData.isHidden = body.isHidden;
    if (
      body.status === "draft" ||
      body.status === "published" ||
      body.status === "archived"
    ) {
      updateData.status = body.status;
    }
    if (typeof body.price === "number") updateData.price = body.price;
    if (typeof body.salePrice === "number") updateData.salePrice = body.salePrice;
    if (typeof body.displayOrder === "number") {
      updateData.displayOrder = body.displayOrder;
    }

    if (role === "admin") {
      const instructorId = toObjectId(body.instructor);
      if (instructorId) {
        updateData.instructor = instructorId;
      } else if (body.instructor === null) {
        updateData.instructor = undefined;
      }
    } else if (role === "instructor") {
      updateData.instructor = new mongoose.Types.ObjectId(userId);
    }

    if (updateData.isPaid === false) {
      updateData.price = undefined;
      updateData.salePrice = undefined;
    }

    const updated = await Course.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true },
    )
      .populate("createdBy", "name email role")
      .populate("instructor", "name firstName lastName email role")
      .lean();

    return NextResponse.json({ success: true, data: mapCourse(updated) });
  } catch (error) {
    console.error("Course update error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update course" },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { userId, role } = await getAuthContext();
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
        { success: false, error: "Invalid course ID" },
        { status: 400 },
      );
    }

    const existing = await Course.findById(id).lean();
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 },
      );
    }
    if (!canManageCourse(existing, userId, role || "")) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    await Course.findByIdAndDelete(id);
    return NextResponse.json({ success: true, data: { _id: id } });
  } catch (error) {
    console.error("Course delete error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete course" },
      { status: 500 },
    );
  }
}
