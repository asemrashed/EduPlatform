import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import BatchClass from "@/models/BatchClass";
import Category from "@/models/Category";
import User from "@/models/User";
import { requireBatchManageAccess, requireBatchViewAccess } from "@/app/api/_lib/batchAccess";
import { mapBatchClass } from "@/app/api/_lib/mapBatchClass";
import { isObjectId, requireSessionUser, toObjectId } from "@/app/api/_lib/phase12";

type RouteContext = { params: Promise<{ id: string }> };

const INSTRUCTOR_SELECT = "fullName firstName lastName email role";

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    await connectDB();
    const auth = await requireSessionUser(["admin", "instructor", "student"]);
    if (auth.error) return auth.error;

    const { id: batchId } = await context.params;
    const access = await requireBatchViewAccess(batchId, auth.user);
    if (access.error) return access.error;

    const rows = await BatchClass.find({ batchId: toObjectId(batchId) })
      .populate("categoryId", "name slug")
      .populate("instructorId", INSTRUCTOR_SELECT)
      .sort({ sortOrder: 1, title: 1 })
      .lean();

    const subjects = rows.map((r) => mapBatchClass(r as Record<string, unknown>));
    return NextResponse.json({
      success: true,
      data: {
        classes: subjects,
        subjects,
        canManage: access.canManage,
      },
    });
  } catch (error) {
    console.error("GET batch classes", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch batch classes" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    await connectDB();
    const auth = await requireSessionUser(["admin", "instructor"]);
    if (auth.error) return auth.error;

    const { id: batchId } = await context.params;
    const access = await requireBatchManageAccess(batchId, auth.user);
    if (access.error) return access.error;

    const body = (await request.json()) as Record<string, unknown>;
    const title = typeof body.title === "string" ? body.title.trim() : "";
    if (!title) {
      return NextResponse.json(
        { success: false, error: "title is required" },
        { status: 400 },
      );
    }

    if (!isObjectId(body.categoryId)) {
      return NextResponse.json(
        { success: false, error: "Valid categoryId is required" },
        { status: 400 },
      );
    }

    if (!isObjectId(body.instructorId)) {
      return NextResponse.json(
        { success: false, error: "Valid instructorId is required" },
        { status: 400 },
      );
    }

    const category = await Category.findById(body.categoryId).select("isActive").lean();
    if (!category || category.isActive === false) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 },
      );
    }

    const instructor = await User.findById(body.instructorId).select("role").lean();
    if (!instructor || instructor.role !== "instructor") {
      return NextResponse.json(
        { success: false, error: "Instructor not found" },
        { status: 404 },
      );
    }

    const row = await BatchClass.create({
      batchId: toObjectId(batchId),
      title,
      categoryId: toObjectId(body.categoryId),
      instructorId: toObjectId(body.instructorId),
      isActive: body.isActive !== false,
      sortOrder: Number(body.sortOrder) || 0,
    });

    const populated = await BatchClass.findById(row._id)
      .populate("categoryId", "name slug")
      .populate("instructorId", INSTRUCTOR_SELECT)
      .lean();

    return NextResponse.json(
      {
        success: true,
        data: { batchClass: mapBatchClass(populated as Record<string, unknown>) },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST batch class", error);
    return NextResponse.json(
      { success: false, error: "Failed to create batch class" },
      { status: 500 },
    );
  }
}
