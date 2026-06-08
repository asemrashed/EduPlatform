import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import BatchClass from "@/models/BatchClass";
import Category from "@/models/Category";
import User from "@/models/User";
import { requireBatchManageAccess } from "@/app/api/_lib/batchAccess";
import { mapBatchClass } from "@/app/api/_lib/mapBatchClass";
import { isObjectId, requireSessionUser, toObjectId } from "@/app/api/_lib/phase12";

type RouteContext = { params: Promise<{ id: string; classId: string }> };

const INSTRUCTOR_SELECT = "fullName firstName lastName email role";

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    await connectDB();
    const auth = await requireSessionUser(["admin"]);
    if (auth.error) return auth.error;

    const { id: batchId, classId } = await context.params;
    const access = await requireBatchManageAccess(batchId, auth.user);
    if (access.error) return access.error;

    if (!isObjectId(classId)) {
      return NextResponse.json(
        { success: false, error: "Invalid class id" },
        { status: 400 },
      );
    }

    const body = (await request.json()) as Record<string, unknown>;
    const updates: Record<string, unknown> = {};

    if (typeof body.title === "string") updates.title = body.title.trim();
    if (isObjectId(body.categoryId)) {
      const category = await Category.findById(body.categoryId).select("isActive").lean();
      if (!category || category.isActive === false) {
        return NextResponse.json(
          { success: false, error: "Category not found" },
          { status: 404 },
        );
      }
      updates.categoryId = toObjectId(body.categoryId);
    }
    if (isObjectId(body.instructorId)) {
      const instructor = await User.findById(body.instructorId).select("role").lean();
      if (!instructor || instructor.role !== "instructor") {
        return NextResponse.json(
          { success: false, error: "Instructor not found" },
          { status: 404 },
        );
      }
      updates.instructorId = toObjectId(body.instructorId);
    }
    if (typeof body.isActive === "boolean") updates.isActive = body.isActive;
    if (body.sortOrder !== undefined) updates.sortOrder = Number(body.sortOrder);

    const row = await BatchClass.findOneAndUpdate(
      { _id: toObjectId(classId), batchId: toObjectId(batchId) },
      { $set: updates },
      { new: true },
    )
      .populate("categoryId", "name slug")
      .populate("instructorId", INSTRUCTOR_SELECT)
      .lean();

    if (!row) {
      return NextResponse.json(
        { success: false, error: "Class not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: { batchClass: mapBatchClass(row as Record<string, unknown>) },
    });
  } catch (error) {
    console.error("PATCH batch class", error);
    return NextResponse.json(
      { success: false, error: "Failed to update batch class" },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    await connectDB();
    const auth = await requireSessionUser(["admin"]);
    if (auth.error) return auth.error;

    const { id: batchId, classId } = await context.params;
    const access = await requireBatchManageAccess(batchId, auth.user);
    if (access.error) return access.error;

    const row = await BatchClass.findOneAndUpdate(
      { _id: toObjectId(classId), batchId: toObjectId(batchId) },
      { $set: { isActive: false } },
      { new: true },
    ).lean();

    if (!row) {
      return NextResponse.json(
        { success: false, error: "Class not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: { deactivated: true } });
  } catch (error) {
    console.error("DELETE batch class", error);
    return NextResponse.json(
      { success: false, error: "Failed to deactivate batch class" },
      { status: 500 },
    );
  }
}
