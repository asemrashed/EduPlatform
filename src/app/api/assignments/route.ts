import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Assignment from "@/models/Assignment";
import AssignmentSubmission from "@/models/AssignmentSubmission";
import Course from "@/models/Course";
import { pagination, parseLimit, parsePage, requireSessionUser, toObjectId } from "@/app/api/_lib/phase12";

function mapAssignment(row: any) {
  return {
    _id: String(row._id),
    title: row.title,
    description: row.description || "",
    instructions: row.instructions || "",
    type: row.type,
    course: row.course || undefined,
    chapter: row.chapter || undefined,
    lesson: row.lesson || undefined,
    createdBy: row.createdBy || undefined,
    totalMarks: row.totalMarks,
    passingMarks: row.passingMarks,
    dueDate: row.dueDate || undefined,
    startDate: row.startDate || undefined,
    isActive: row.isActive !== false,
    isPublished: Boolean(row.isPublished),
    allowLateSubmission: Boolean(row.allowLateSubmission),
    latePenaltyPercentage: row.latePenaltyPercentage || 0,
    maxAttempts: Number(row.maxAttempts || 1),
    allowedFileTypes: Array.isArray(row.allowedFileTypes) ? row.allowedFileTypes : [],
    maxFileSize: row.maxFileSize || undefined,
    attachments: Array.isArray(row.attachments) ? row.attachments : [],
    rubric: Array.isArray(row.rubric) ? row.rubric : [],
    isGroupAssignment: Boolean(row.isGroupAssignment),
    maxGroupSize: row.maxGroupSize || undefined,
    autoGrade: Boolean(row.autoGrade),
    timeLimit: row.timeLimit || undefined,
    showCorrectAnswers: row.showCorrectAnswers !== false,
    allowReview: row.allowReview !== false,
    status: row.status || "draft",
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireSessionUser(["admin", "instructor"]);
    if (auth.error) return auth.error;

    const { searchParams } = new URL(request.url);
    const page = parsePage(searchParams);
    const limit = parseLimit(searchParams, 10, 200);
    const skip = (page - 1) * limit;
    const search = (searchParams.get("search") || "").trim();
    const status = (searchParams.get("status") || "").trim();
    const type = (searchParams.get("type") || "").trim();
    const sortBy = (searchParams.get("sortBy") || "createdAt").trim();
    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;

    const filter: Record<string, unknown> = {};
    if (auth.user.role === "instructor") {
      filter.createdBy = toObjectId(auth.user.id);
    }
    if (search) filter.title = { $regex: search, $options: "i" };
    if (status && status !== "all") filter.status = status;
    if (type && type !== "all") filter.type = type;

    const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder };
    const [rows, total] = await Promise.all([
      Assignment.find(filter)
        .populate("course", "title")
        .populate("createdBy", "name email")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Assignment.countDocuments(filter),
    ]);

    const assignmentIds = rows.map((x) => x._id);
    const submissionCounts = assignmentIds.length
      ? await AssignmentSubmission.aggregate([
          { $match: { assignment: { $in: assignmentIds } } },
          { $group: { _id: "$assignment", count: { $sum: 1 } } },
        ])
      : [];
    const countMap = new Map<string, number>();
    submissionCounts.forEach((x) => countMap.set(String(x._id), Number(x.count || 0)));

    const assignments = rows.map((row) => ({
      ...mapAssignment(row),
      submissionCount: countMap.get(String(row._id)) || 0,
    }));

    return NextResponse.json({
      success: true,
      data: {
        assignments,
        pagination: pagination(page, limit, total),
        stats: { total: total },
      },
    });
  } catch (error) {
    console.error("Assignments GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch assignments" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireSessionUser(["admin", "instructor"]);
    if (auth.error) return auth.error;

    const body = (await request.json()) as Record<string, unknown>;
    const title = String(body.title || "").trim();
    if (!title) {
      return NextResponse.json({ success: false, error: "title is required" }, { status: 400 });
    }
    const courseId = String(body.course || "");
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return NextResponse.json({ success: false, error: "Valid course is required" }, { status: 400 });
    }
    const course = await Course.findById(courseId).select("_id instructor createdBy").lean();
    if (!course) {
      return NextResponse.json({ success: false, error: "Course not found" }, { status: 404 });
    }
    if (auth.user.role === "instructor") {
      const allowed =
        String((course as any).instructor || "") === auth.user.id ||
        String((course as any).createdBy || "") === auth.user.id;
      if (!allowed) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const totalMarks = Number(body.totalMarks || 0);
    const passingMarks = Number(body.passingMarks || 0);
    if (totalMarks <= 0 || passingMarks > totalMarks) {
      return NextResponse.json(
        { success: false, error: "Invalid totalMarks/passingMarks" },
        { status: 400 },
      );
    }

    const created = await Assignment.create({
      title,
      description: String(body.description || "").trim() || undefined,
      instructions: String(body.instructions || "").trim() || undefined,
      type:
        body.type === "file_upload" ||
        body.type === "quiz" ||
        body.type === "project" ||
        body.type === "presentation"
          ? body.type
          : "essay",
      course: new mongoose.Types.ObjectId(courseId),
      chapter:
        typeof body.chapter === "string" && mongoose.Types.ObjectId.isValid(body.chapter)
          ? new mongoose.Types.ObjectId(body.chapter)
          : undefined,
      lesson:
        typeof body.lesson === "string" && mongoose.Types.ObjectId.isValid(body.lesson)
          ? new mongoose.Types.ObjectId(body.lesson)
          : undefined,
      createdBy: toObjectId(auth.user.id),
      totalMarks,
      passingMarks,
      dueDate: body.dueDate ? new Date(String(body.dueDate)) : undefined,
      startDate: body.startDate ? new Date(String(body.startDate)) : undefined,
      isActive: body.isActive !== false,
      isPublished: Boolean(body.isPublished),
      allowLateSubmission: Boolean(body.allowLateSubmission),
      latePenaltyPercentage: Number(body.latePenaltyPercentage || 0) || undefined,
      maxAttempts: Number(body.maxAttempts || 1),
      allowedFileTypes: Array.isArray(body.allowedFileTypes) ? body.allowedFileTypes : [],
      maxFileSize: Number(body.maxFileSize || 0) || undefined,
      attachments: Array.isArray(body.attachments) ? body.attachments : [],
      rubric: Array.isArray(body.rubric) ? body.rubric : [],
      isGroupAssignment: Boolean(body.isGroupAssignment),
      maxGroupSize: Number(body.maxGroupSize || 0) || undefined,
      autoGrade: Boolean(body.autoGrade),
      timeLimit: Number(body.timeLimit || 0) || undefined,
      showCorrectAnswers: body.showCorrectAnswers !== false,
      allowReview: body.allowReview !== false,
      status: body.status || "draft",
    });

    const row = await Assignment.findById(created._id)
      .populate("course", "title")
      .populate("createdBy", "name email")
      .lean();
    return NextResponse.json({ success: true, data: mapAssignment(row) });
  } catch (error) {
    console.error("Assignments POST error:", error);
    return NextResponse.json({ success: false, error: "Failed to create assignment" }, { status: 500 });
  }
}
