import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth/next";
import connectDB from "@/lib/mongodb";
import { authOptions } from "@/lib/auth";
import Course from "@/models/Course";

type SafeSortField =
  | "createdAt"
  | "updatedAt"
  | "title"
  | "price"
  | "salePrice"
  | "displayOrder";

const ALLOWED_SORT_FIELDS: SafeSortField[] = [
  "createdAt",
  "updatedAt",
  "title",
  "price",
  "salePrice",
  "displayOrder",
];

function toPositiveInt(value: string | null, fallback: number): number {
  const parsed = Number.parseInt(value || "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
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
    certificateEnabled: Boolean(course.certificateEnabled),
    certificateOutcomes: Array.isArray(course.certificateOutcomes)
      ? course.certificateOutcomes
      : [],
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

    const { searchParams } = new URL(request.url);
    const page = toPositiveInt(searchParams.get("page"), 1);
    const limit = Math.min(toPositiveInt(searchParams.get("limit"), 10), 500);
    const search = (searchParams.get("search") || "").trim();
    const category = (searchParams.get("category") || "").trim();
    const status = (searchParams.get("status") || "").trim();
    const sortByRaw = (searchParams.get("sortBy") || "createdAt").trim();
    const sortOrderRaw = (searchParams.get("sortOrder") || "desc").trim();
    const createdBy = (searchParams.get("createdBy") || "").trim();
    const isPaidParam = searchParams.get("isPaid");
    const minPriceParam = searchParams.get("minPrice");
    const maxPriceParam = searchParams.get("maxPrice");

    const sortBy: SafeSortField = ALLOWED_SORT_FIELDS.includes(
      sortByRaw as SafeSortField,
    )
      ? (sortByRaw as SafeSortField)
      : "createdAt";
    const sortOrder: 1 | -1 = sortOrderRaw === "asc" ? 1 : -1;

    const filter: Record<string, unknown> = {};

    if (role === "instructor") {
      filter.instructor = userId;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { shortDescription: { $regex: search, $options: "i" } },
      ];
    }
    if (category && category !== "all") {
      filter.category = category;
    }
    if (status && status !== "all") {
      filter.status = status;
    }
    if (createdBy && createdBy !== "all" && role === "admin") {
      const createdByObjectId = toObjectId(createdBy);
      if (createdByObjectId) {
        filter.createdBy = createdByObjectId;
      }
    }
    if (isPaidParam === "true") {
      filter.isPaid = true;
    } else if (isPaidParam === "false") {
      filter.isPaid = false;
    }

    const minPrice = minPriceParam ? Number(minPriceParam) : undefined;
    const maxPrice = maxPriceParam ? Number(maxPriceParam) : undefined;
    if (Number.isFinite(minPrice) || Number.isFinite(maxPrice)) {
      const priceRange: Record<string, number> = {};
      if (Number.isFinite(minPrice)) {
        priceRange.$gte = Number(minPrice);
      }
      if (Number.isFinite(maxPrice)) {
        priceRange.$lte = Number(maxPrice);
      }
      filter.price = priceRange;
    }

    const skip = (page - 1) * limit;
    const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder };

    const [courses, total, statsRows] = await Promise.all([
      Course.find(filter)
        .populate("createdBy", "name email role")
        .populate("instructor", "name firstName lastName email role")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Course.countDocuments(filter),
      Course.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            totalCourses: { $sum: 1 },
            publishedCourses: {
              $sum: { $cond: [{ $eq: ["$status", "published"] }, 1, 0] },
            },
            draftCourses: {
              $sum: { $cond: [{ $eq: ["$status", "draft"] }, 1, 0] },
            },
            archivedCourses: {
              $sum: { $cond: [{ $eq: ["$status", "archived"] }, 1, 0] },
            },
            paidCourses: {
              $sum: { $cond: [{ $eq: ["$isPaid", true] }, 1, 0] },
            },
            freeCourses: {
              $sum: { $cond: [{ $eq: ["$isPaid", false] }, 1, 0] },
            },
            totalRevenue: {
              $sum: {
                $cond: [
                  { $eq: ["$isPaid", true] },
                  { $ifNull: ["$price", 0] },
                  0,
                ],
              },
            },
            averagePrice: {
              $avg: {
                $cond: [{ $eq: ["$isPaid", true] }, { $ifNull: ["$price", 0] }, null],
              },
            },
          },
        },
      ]),
    ]);

    const pages = total > 0 ? Math.ceil(total / limit) : 0;
    const stats = statsRows[0] || {
      totalCourses: 0,
      publishedCourses: 0,
      draftCourses: 0,
      archivedCourses: 0,
      paidCourses: 0,
      freeCourses: 0,
      totalRevenue: 0,
      averagePrice: 0,
    };

    return NextResponse.json({
      success: true,
      data: {
        courses: courses.map(mapCourse),
        pagination: {
          page,
          limit,
          total,
          pages,
          hasNext: page < pages,
          hasPrev: page > 1 && pages > 0,
        },
        stats: {
          ...stats,
          averagePrice: Number(stats.averagePrice || 0),
          categories: {},
        },
      },
    });
  } catch (error) {
    console.error("Courses list error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch courses" },
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
    if (!title) {
      return NextResponse.json(
        { success: false, error: "Course title is required" },
        { status: 400 },
      );
    }

    const instructorFromBody = toObjectId(body.instructor);
    const createdBy = new mongoose.Types.ObjectId(userId);
    const instructor =
      role === "instructor"
        ? createdBy
        : instructorFromBody || undefined;

    const isPaid = Boolean(body.isPaid);
    const price =
      typeof body.price === "number"
        ? body.price
        : Number.isFinite(Number(body.price))
          ? Number(body.price)
          : undefined;
    const salePrice =
      typeof body.salePrice === "number"
        ? body.salePrice
        : Number.isFinite(Number(body.salePrice))
          ? Number(body.salePrice)
          : undefined;

    const certificateEnabled = body.certificateEnabled === true;
    const certificateOutcomes = certificateEnabled
      ? (Array.isArray(body.certificateOutcomes)
          ? body.certificateOutcomes
          : []
        )
          .map((line) => String(line).trim())
          .filter((line) => line.length > 0)
      : [];

    const course = await Course.create({
      title,
      shortDescription: String(body.shortDescription || "").trim() || undefined,
      description: String(body.description || "").trim() || undefined,
      category: String(body.category || "").trim() || undefined,
      thumbnailUrl: String(body.thumbnailUrl || "").trim() || undefined,
      isPaid,
      status:
        body.status === "published" || body.status === "archived"
          ? body.status
          : "draft",
      isHidden: Boolean(body.isHidden),
      price: isPaid ? price : undefined,
      salePrice: isPaid ? salePrice : undefined,
      displayOrder:
        typeof body.displayOrder === "number"
          ? body.displayOrder
          : undefined,
      createdBy,
      instructor,
      certificateEnabled,
      certificateOutcomes,
    });

    const populated = await Course.findById(course._id)
      .populate("createdBy", "name email role")
      .populate("instructor", "name firstName lastName email role")
      .lean();

    return NextResponse.json({
      success: true,
      data: mapCourse(populated),
    });
  } catch (error) {
    console.error("Course create error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create course" },
      { status: 500 },
    );
  }
}
