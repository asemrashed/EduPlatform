import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import PassPaper from "@/models/PassPaper";

type PassPaperQuery = Record<string, unknown>;

export async function GET(request: NextRequest) {
  try {
    await connectDB();

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

    const query: PassPaperQuery = {};

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

    if (isActive != null) {
      query.isActive = isActive === "true";
    }

    const sort: Record<string, 1 | -1> = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    const passPapers = await PassPaper.find(query)
      .populate("course", "title")
      .sort(sort)
      .lean();

    return NextResponse.json({
      success: true,
      data: {
        passPapers,
      },
    });
  } catch (error) {
    console.error("Get pass papers error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}
