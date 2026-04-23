import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
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

function toPositiveInt(value: string | null, fallback: number) {
  const parsed = Number.parseInt(value || "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = toPositiveInt(searchParams.get("page"), 1);
    const limit = Math.min(toPositiveInt(searchParams.get("limit"), 10), 100);
    const search = (searchParams.get("search") || "").trim();
    const category = (searchParams.get("category") || "").trim();
    const pricing = (searchParams.get("pricing") || "").trim().toLowerCase();
    const isPaidParam = searchParams.get("isPaid");
    const minPriceParam = searchParams.get("minPrice");
    const maxPriceParam = searchParams.get("maxPrice");
    const sortByRaw = (searchParams.get("sortBy") || "createdAt").trim();
    const sortOrderRaw = (searchParams.get("sortOrder") || "desc").trim();

    const sortBy: SafeSortField = ALLOWED_SORT_FIELDS.includes(
      sortByRaw as SafeSortField,
    )
      ? (sortByRaw as SafeSortField)
      : "createdAt";
    const sortOrder = sortOrderRaw === "asc" ? 1 : -1;

    const filter: Record<string, unknown> = {
      status: "published",
      isHidden: { $ne: true },
    };

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

    if (isPaidParam === "true" || pricing === "paid") {
      filter.isPaid = true;
    } else if (isPaidParam === "false" || pricing === "free") {
      filter.isPaid = false;
    }

    const minPrice = minPriceParam ? Number(minPriceParam) : undefined;
    const maxPrice = maxPriceParam ? Number(maxPriceParam) : undefined;
    if (
      Number.isFinite(minPrice) ||
      Number.isFinite(maxPrice)
    ) {
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

    const [courses, total] = await Promise.all([
      Course.find(filter)
        .populate("createdBy", "name role")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Course.countDocuments(filter),
    ]);

    const safeCourses = courses.map((course: any) => {
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
        status: "published",
        isHidden: Boolean(course.isHidden),
        price,
        salePrice,
        finalPrice,
        discountPercentage,
        displayOrder:
          typeof course.displayOrder === "number"
            ? course.displayOrder
            : undefined,
        duration:
          typeof course.duration === "number" ? course.duration : undefined,
        difficulty: course.difficulty || undefined,
        lessonCount:
          typeof course.lessonCount === "number" ? course.lessonCount : 0,
        enrollmentCount:
          typeof course.enrollmentCount === "number" ? course.enrollmentCount : 0,
        tags: Array.isArray(course.tags) ? course.tags : [],
        createdBy: {
          name: course.createdBy?.name || "Unknown",
          role: course.createdBy?.role || "instructor",
        },
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
      };
    });

    const pages = total > 0 ? Math.ceil(total / limit) : 0;

    return NextResponse.json({
      success: true,
      data: {
        courses: safeCourses,
        pagination: {
          page,
          limit,
          total,
          pages,
          hasNext: page < pages,
          hasPrev: page > 1 && pages > 0,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching public courses:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch public courses",
      },
      { status: 500 },
    );
  }
}
