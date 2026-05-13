import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import connectDB from "@/lib/mongodb";
import { authOptions } from "@/lib/auth";
import CourseReview from "@/models/CourseReview";
import Enrollment from "@/models/Enrollment";
import User from "@/models/User";
import {
  buildPagination,
  buildPublicCourseReviewsPayload,
  mapCourseReview,
  parseReviewListQuery,
} from "@/app/api/_lib/reviews";
import { isObjectId, toObjectId } from "@/app/api/_lib/phase12";

const ACTIVE_ENROLLMENT = ["enrolled", "in_progress", "completed"] as const;

async function listPublicCourseReviews(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const courseRaw = searchParams.get("course")?.trim();
  if (!courseRaw) {
    return NextResponse.json({ success: false, error: "Valid course id is required" }, { status: 400 });
  }

  const result = await buildPublicCourseReviewsPayload(courseRaw, searchParams);
  if ("error" in result && result.error) {
    return NextResponse.json({ success: false, error: result.error }, { status: result.status });
  }
  return NextResponse.json(result.body);
}

async function listStudentOwnReviews(request: NextRequest, studentId: string) {
  const { searchParams } = new URL(request.url);
  const { page, limit, skip, sort } = parseReviewListQuery(searchParams);

  await connectDB();

  const filter: Record<string, unknown> = {
    student: toObjectId(studentId),
  };

  const course = searchParams.get("course")?.trim();
  if (course && course !== "all" && isObjectId(course)) {
    filter.course = toObjectId(course);
  }

  const search = (searchParams.get("search") || "").trim();
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { comment: { $regex: search, $options: "i" } },
    ];
  }

  const rating = searchParams.get("rating");
  if (rating && rating !== "all") {
    const n = Number(rating);
    if (Number.isFinite(n)) filter.rating = n;
  }

  const [rows, total] = await Promise.all([
    CourseReview.find(filter)
      .populate("student", "firstName lastName avatar role isBlockedFromReviews")
      .populate("course", "title thumbnailUrl")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    CourseReview.countDocuments(filter),
  ]);

  const reviews = rows.map((r) => mapCourseReview(r as Record<string, unknown>));
  return NextResponse.json({
    success: true,
    data: {
      reviews,
      pagination: buildPagination(page, limit, total),
    },
  });
}

async function listAllReviewsAdmin(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const { page, limit, skip, sort } = parseReviewListQuery(searchParams);
  const safeLimit = Math.min(limit, 1000);

  await connectDB();

  const filter: Record<string, unknown> = {};

  const course = searchParams.get("course")?.trim();
  if (course && course !== "all" && isObjectId(course)) {
    filter.course = toObjectId(course);
  }

  const student = searchParams.get("student")?.trim();
  if (student && student !== "all" && isObjectId(student)) {
    filter.student = toObjectId(student);
  }

  const search = (searchParams.get("search") || "").trim();
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { comment: { $regex: search, $options: "i" } },
    ];
  }

  const rating = searchParams.get("rating");
  if (rating && rating !== "all") {
    const n = Number(rating);
    if (Number.isFinite(n)) filter.rating = n;
  }

  const isApproved = searchParams.get("isApproved");
  if (isApproved === "true" || isApproved === "false") {
    filter.isApproved = isApproved === "true";
  }

  const isPublic = searchParams.get("isPublic");
  if (isPublic === "true" || isPublic === "false") {
    filter.isPublic = isPublic === "true";
  }

  const reported = searchParams.get("reportedCount");
  if (reported && reported !== "all") {
    const n = Number(reported);
    if (Number.isFinite(n)) {
      filter.reportedCount = { $gte: n };
    }
  }

  const [rows, total] = await Promise.all([
    CourseReview.find(filter)
      .populate("student", "firstName lastName avatar role isBlockedFromReviews")
      .populate("course", "title thumbnailUrl")
      .sort(sort)
      .skip(skip)
      .limit(safeLimit)
      .lean(),
    CourseReview.countDocuments(filter),
  ]);

  const reviews = rows.map((r) => mapCourseReview(r as Record<string, unknown>));
  return NextResponse.json({
    success: true,
    data: {
      reviews,
      pagination: buildPagination(page, safeLimit, total),
    },
  });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const publicRead =
      (searchParams.get("public") === "true" ||
        searchParams.get("context") === "course-details") &&
      searchParams.get("course")?.trim();

    if (publicRead) {
      return listPublicCourseReviews(request);
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
    }

    const studentFilter = searchParams.get("student")?.trim();

    if (studentFilter && isObjectId(studentFilter)) {
      if (session.user.role === "student" && studentFilter !== session.user.id) {
        return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
      }
      if (session.user.role === "admin" || session.user.role === "student") {
        return listStudentOwnReviews(request, studentFilter);
      }
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    if (session.user.role === "admin") {
      return listAllReviewsAdmin(request);
    }

    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  } catch (error) {
    console.error("GET /api/course-reviews error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
    }
    if (session.user.role !== "student") {
      return NextResponse.json(
        { success: false, error: "Only students can create reviews from this endpoint" },
        { status: 403 },
      );
    }

    const body = (await request.json()) as Record<string, unknown>;
    const courseRaw = body.course;
    const rating = Number(body.rating);

    if (typeof courseRaw !== "string" || !isObjectId(courseRaw)) {
      return NextResponse.json({ success: false, error: "Valid course is required" }, { status: 400 });
    }
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ success: false, error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    const reviewType = body.reviewType === "video" ? "video" : "text";
    const comment = typeof body.comment === "string" ? body.comment : "";
    const videoUrl = typeof body.videoUrl === "string" ? body.videoUrl : "";
    if (reviewType === "text" && !comment.trim()) {
      return NextResponse.json({ success: false, error: "Comment is required for text reviews" }, { status: 400 });
    }
    if (reviewType === "video" && !videoUrl.trim()) {
      return NextResponse.json(
        { success: false, error: "Video URL is required for video reviews" },
        { status: 400 },
      );
    }

    await connectDB();

    const user = await User.findById(session.user.id).select("isBlockedFromReviews").lean();
    if (user && (user as { isBlockedFromReviews?: boolean }).isBlockedFromReviews) {
      return NextResponse.json(
        { success: false, error: "You are blocked from submitting reviews" },
        { status: 403 },
      );
    }

    const enrollment = await Enrollment.findOne({
      student: toObjectId(session.user.id),
      course: toObjectId(courseRaw),
      status: { $in: ACTIVE_ENROLLMENT },
    }).lean();

    if (!enrollment) {
      return NextResponse.json(
        { success: false, error: "You must be enrolled in this course to review it" },
        { status: 403 },
      );
    }

    try {
      const created = await CourseReview.create({
        student: toObjectId(session.user.id),
        course: toObjectId(courseRaw),
        rating,
        reviewType,
        title: typeof body.title === "string" ? body.title : undefined,
        comment: comment || undefined,
        videoUrl: videoUrl || undefined,
        videoThumbnail: typeof body.videoThumbnail === "string" ? body.videoThumbnail : undefined,
        isVerified: false,
        isPublic: true,
        helpfulVotes: 0,
        helpfulVoters: [],
        reportedCount: 0,
        isApproved: false,
        isDisplayed: true,
        displayOrder: 0,
      });

      const populated = await CourseReview.findById(created._id)
        .populate("student", "firstName lastName avatar role isBlockedFromReviews")
        .populate("course", "title thumbnailUrl")
        .lean();

      return NextResponse.json({
        success: true,
        data: mapCourseReview(populated as Record<string, unknown>),
      });
    } catch (e: unknown) {
      if (e && typeof e === "object" && "code" in e && (e as { code?: number }).code === 11000) {
        return NextResponse.json(
          { success: false, error: "You already submitted a review for this course" },
          { status: 409 },
        );
      }
      throw e;
    }
  } catch (error) {
    console.error("POST /api/course-reviews error:", error);
    return NextResponse.json({ success: false, error: "Failed to create review" }, { status: 500 });
  }
}
