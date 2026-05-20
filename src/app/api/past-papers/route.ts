import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import connectDB from "@/lib/mongodb";
import { authOptions } from "@/lib/auth";
import PastPaper from "@/models/PastPaper";
import { requireSessionUser } from "@/app/api/_lib/phase12";
import type { AppRole } from "@/app/api/_lib/phase12";
import {
  applyPastPaperListScope,
  assertPastPaperCourseAccess,
  parsePastPaperYear,
  resolveCourseId,
  trimOptionalUrl,
} from "@/app/api/_lib/pastPapers";

type PastPaperQuery = Record<string, unknown>;

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    const role = session?.user?.role;
    const userId = session?.user?.id;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const sessionName = searchParams.get("sessionName");
    const year = searchParams.get("year");
    const subject = searchParams.get("subject");
    const examType = searchParams.get("examType");
    const paperType = searchParams.get("paperType");
    const isActive = searchParams.get("isActive");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const query: PastPaperQuery = {};

    if (search) {
      query.$or = [
        { sessionName: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
        { examType: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
    }

    if (sessionName) {
      query.sessionName = { $regex: sessionName, $options: "i" };
    }

    if (year) {
      query.year = Number.parseInt(year, 10);
    }

    if (subject) {
      query.subject = { $regex: subject, $options: "i" };
    }

    if (examType) {
      query.examType = { $regex: examType, $options: "i" };
    }

    if (paperType) {
      switch (paperType) {
        case "question_paper":
          query.questionPaperUrl = { $exists: true, $ne: "" };
          break;
        case "marks_pdf":
          query.marksPdfUrl = { $exists: true, $ne: "" };
          break;
        case "work_solution":
          query.workSolutionUrl = { $exists: true, $ne: "" };
          break;
      }
    }

    if (role !== "student" && isActive != null) {
      query.isActive = isActive === "true";
    }

    await applyPastPaperListScope(query, role as AppRole | undefined, userId);

    const sort: Record<string, 1 | -1> = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    const pastPapers = await PastPaper.find(query)
      .populate("course", "title")
      .sort(sort)
      .lean();

    return NextResponse.json({
      success: true,
      data: {
        pastPapers,
      },
    });
  } catch (error) {
    console.error("Get past papers error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireSessionUser(["admin", "instructor"]);
    if (auth.error) return auth.error;

    const body = (await request.json()) as Record<string, unknown>;
    const courseId = resolveCourseId(body);
    const sessionName =
      typeof body.sessionName === "string" ? body.sessionName.trim() : "";
    const subject = typeof body.subject === "string" ? body.subject.trim() : "";
    const examType =
      typeof body.examType === "string" ? body.examType.trim() : "";
    const year = parsePastPaperYear(body.year);

    if (!courseId) {
      return NextResponse.json({ error: "Course is required" }, { status: 400 });
    }

    if (!sessionName || !subject || !examType || year === null) {
      return NextResponse.json(
        {
          error:
            "Session name, year, subject, and exam type are required and must be valid",
        },
        { status: 400 },
      );
    }

    const courseAccess = await assertPastPaperCourseAccess(courseId, auth.user);
    if (courseAccess.error) {
      return NextResponse.json(
        { error: courseAccess.error },
        { status: courseAccess.status },
      );
    }

    const existingPaper = await PastPaper.findOne({
      course: courseId,
      sessionName,
      year,
      subject,
      examType,
    });

    if (existingPaper) {
      return NextResponse.json(
        {
          error:
            "A past paper with this session, year, subject, and exam type already exists",
        },
        { status: 409 },
      );
    }

    const isActive = typeof body.isActive === "boolean" ? body.isActive : true;

    const pastPaper = await PastPaper.create({
      course: courseId,
      sessionName,
      year,
      subject,
      examType,
      questionPaperUrl: trimOptionalUrl(body.questionPaperUrl),
      marksPdfUrl: trimOptionalUrl(body.marksPdfUrl),
      workSolutionUrl: trimOptionalUrl(body.workSolutionUrl),
      description:
        typeof body.description === "string"
          ? body.description.trim() || undefined
          : undefined,
      tags:
        typeof body.tags === "string" ? body.tags.trim() || undefined : undefined,
      isActive,
      uploadedBy: auth.user.id,
    });

    const created = await PastPaper.findById(pastPaper._id)
      .populate("course", "title")
      .lean();

    return NextResponse.json({ pastPaper: created }, { status: 201 });
  } catch (error) {
    console.error("Create past paper error:", error);
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code: number }).code === 11000
    ) {
      return NextResponse.json(
        {
          error:
            "A past paper with this session, year, subject, and exam type already exists",
        },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
