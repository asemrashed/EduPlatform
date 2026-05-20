import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import PastPaper from "@/models/PastPaper";
import { requireSessionUser } from "@/app/api/_lib/phase12";
import {
  hasAtLeastOnePaperUrl,
  pickPastPaperUpdate,
} from "@/app/api/_lib/pastPapers";

interface RouteParams {
  params: Promise<{ id: string }>;
}

function invalidIdResponse() {
  return NextResponse.json({ error: "Invalid past paper ID" }, { status: 400 });
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return invalidIdResponse();
    }

    const pastPaper = await PastPaper.findById(id)
      .populate("course", "title")
      .lean();

    if (!pastPaper) {
      return NextResponse.json(
        { error: "Past paper not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ pastPaper });
  } catch (error) {
    console.error("Get past paper error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await requireSessionUser(["admin", "instructor"]);
    if (auth.error) return auth.error;

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return invalidIdResponse();
    }

    const body = (await request.json()) as Record<string, unknown>;
    const updateData = pickPastPaperUpdate(body);

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 },
      );
    }

    if (updateData.year !== undefined) {
      const year = updateData.year as number;
      if (
        typeof year !== "number" ||
        year < 1900 ||
        year > new Date().getFullYear() + 1
      ) {
        return NextResponse.json(
          { error: "Year must be a valid number between 1900 and next year" },
          { status: 400 },
        );
      }
    }

    const existingPaper = await PastPaper.findById(id);
    if (!existingPaper) {
      return NextResponse.json(
        { error: "Past paper not found" },
        { status: 404 },
      );
    }

    const nextSessionName =
      typeof updateData.sessionName === "string"
        ? updateData.sessionName
        : existingPaper.sessionName;
    const nextYear =
      typeof updateData.year === "number" ? updateData.year : existingPaper.year;
    const nextSubject =
      typeof updateData.subject === "string"
        ? updateData.subject
        : existingPaper.subject;
    const nextExamType =
      typeof updateData.examType === "string"
        ? updateData.examType
        : existingPaper.examType;

    const duplicate = await PastPaper.findOne({
      _id: { $ne: id },
      course: existingPaper.course,
      sessionName: nextSessionName,
      year: nextYear,
      subject: nextSubject,
      examType: nextExamType,
    });

    if (duplicate) {
      return NextResponse.json(
        {
          error:
            "A past paper with this session, year, subject, and exam type already exists",
        },
        { status: 409 },
      );
    }

    const merged = {
      questionPaperUrl:
        updateData.questionPaperUrl !== undefined
          ? (updateData.questionPaperUrl as string | null)
          : existingPaper.questionPaperUrl,
      marksPdfUrl:
        updateData.marksPdfUrl !== undefined
          ? (updateData.marksPdfUrl as string | null)
          : existingPaper.marksPdfUrl,
      workSolutionUrl:
        updateData.workSolutionUrl !== undefined
          ? (updateData.workSolutionUrl as string | null)
          : existingPaper.workSolutionUrl,
    };

    if (!hasAtLeastOnePaperUrl(merged)) {
      return NextResponse.json(
        {
          error:
            "At least one paper URL (question paper, marks PDF, or work solution) is required",
        },
        { status: 400 },
      );
    }

    const updatedPaper = await PastPaper.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("course", "title")
      .lean();

    if (!updatedPaper) {
      return NextResponse.json(
        { error: "Past paper not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      message: "Past paper updated successfully",
      pastPaper: updatedPaper,
    });
  } catch (error) {
    console.error("Update past paper error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await requireSessionUser(["admin"]);
    if (auth.error) return auth.error;

    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return invalidIdResponse();
    }

    const pastPaper = await PastPaper.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true },
    );

    if (!pastPaper) {
      return NextResponse.json(
        { error: "Past paper not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      message: "Past paper deleted successfully",
    });
  } catch (error) {
    console.error("Delete past paper error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
