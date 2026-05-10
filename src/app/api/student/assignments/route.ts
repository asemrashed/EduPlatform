import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Assignment from "@/models/Assignment";
import AssignmentSubmission from "@/models/AssignmentSubmission";
import Enrollment from "@/models/Enrollment";
import { pagination, parseLimit, parsePage, requireSessionUser } from "@/app/api/_lib/phase12";

function computeStatus(row: any) {
  const now = Date.now();
  const start = row.startDate ? new Date(row.startDate).getTime() : null;
  const due = row.dueDate ? new Date(row.dueDate).getTime() : null;
  if (start && start > now) return "upcoming";
  if (due && due < now) return "overdue";
  return "active";
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireSessionUser(["student"]);
    if (auth.error) return auth.error;

    const { searchParams } = new URL(request.url);
    const page = parsePage(searchParams);
    const limit = parseLimit(searchParams, 10, 200);
    const skip = (page - 1) * limit;
    const status = (searchParams.get("status") || "").trim();
    const type = (searchParams.get("type") || "").trim();
    const sortBy = (searchParams.get("sortBy") || "dueDate").trim();
    const sortOrder = searchParams.get("sortOrder") === "desc" ? -1 : 1;

    const enrolled = await Enrollment.find({
      student: auth.user.id,
      status: { $in: ["enrolled", "in_progress", "completed"] },
    })
      .select("course")
      .lean();
    const courseIds = enrolled.map((x) => x.course);
    const filter: Record<string, unknown> = {
      course: { $in: courseIds },
      isActive: true,
      isPublished: true,
    };
    if (type && type !== "all") filter.type = type;

    const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder };
    const [rows, total] = await Promise.all([
      Assignment.find(filter).populate("course", "title").sort(sort).skip(skip).limit(limit).lean(),
      Assignment.countDocuments(filter),
    ]);

    const assignmentIds = rows.map((x) => x._id);
    const submissions = assignmentIds.length
      ? await AssignmentSubmission.find({
          assignment: { $in: assignmentIds },
          student: new mongoose.Types.ObjectId(auth.user.id),
        })
          .sort({ createdAt: -1 })
          .lean()
      : [];
    const byAssignment = new Map<string, any>();
    for (const sub of submissions) {
      const key = String(sub.assignment);
      if (!byAssignment.has(key) || new Date(sub.createdAt) > new Date(byAssignment.get(key).createdAt)) {
        byAssignment.set(key, sub);
      }
    }

    let mapped = rows.map((row) => {
      const latest = byAssignment.get(String(row._id));
      return {
        ...row,
        submissionStatus: latest?.status || "not_submitted",
        latestSubmission: latest || undefined,
      };
    });
    if (status && status !== "all") {
      mapped = mapped.filter((row) => computeStatus(row) === status);
    }

    const stats = {
      total: mapped.length,
      pending: mapped.filter((x) => !x.latestSubmission).length,
      submitted: mapped.filter((x) => x.latestSubmission?.status === "submitted").length,
      graded: mapped.filter((x) => x.latestSubmission?.status === "graded").length,
    };

    return NextResponse.json({
      success: true,
      data: {
        assignments: mapped,
        pagination: pagination(page, limit, total),
        stats,
      },
    });
  } catch (error) {
    console.error("Student assignments GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch student assignments" },
      { status: 500 },
    );
  }
}
