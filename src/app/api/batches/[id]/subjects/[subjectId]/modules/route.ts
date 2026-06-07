import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import BatchClass from "@/models/BatchClass";
import SubjectModule from "@/models/SubjectModule";
import SubjectLesson from "@/models/SubjectLesson";
import {
  requireBatchManageAccess,
  requireBatchViewAccess,
} from "@/app/api/_lib/batchAccess";
import {
  mapSubjectLesson,
  mapSubjectModule,
} from "@/app/api/_lib/mapSubjectCurriculum";
import { mapBatchClass } from "@/app/api/_lib/mapBatchClass";
import { requireSubjectInBatch } from "@/app/api/_lib/subjectAccess";
import { requireSessionUser, toObjectId } from "@/app/api/_lib/phase12";

type RouteContext = { params: Promise<{ id: string; subjectId: string }> };

const INSTRUCTOR_SELECT = "fullName firstName lastName email role";

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    await connectDB();
    const auth = await requireSessionUser(["admin", "instructor", "student"]);
    if (auth.error) return auth.error;

    const { id: batchId, subjectId } = await context.params;
    const access = await requireBatchViewAccess(batchId, auth.user);
    if (access.error) return access.error;

    const subjectResolved = await requireSubjectInBatch(batchId, subjectId);
    if (subjectResolved.error) return subjectResolved.error;

    const subjectRow = await BatchClass.findById(subjectId)
      .populate("categoryId", "name slug")
      .populate("instructorId", INSTRUCTOR_SELECT)
      .lean();

    const batchOid = toObjectId(batchId);
    const subjectOid = toObjectId(subjectId);

    const moduleFilter: Record<string, unknown> = {
      batchId: batchOid,
      subjectId: subjectOid,
    };
    if (!access.canManage) {
      moduleFilter.isPublished = true;
    }

    const modules = await SubjectModule.find(moduleFilter)
      .sort({ order: 1, title: 1 })
      .lean();

    const lessonFilter: Record<string, unknown> = {
      batchId: batchOid,
      subjectId: subjectOid,
    };
    if (!access.canManage) {
      lessonFilter.isPublished = true;
    }

    const lessons = await SubjectLesson.find(lessonFilter)
      .sort({ order: 1, title: 1 })
      .lean();

    const lessonsByModule = new Map<string, ReturnType<typeof mapSubjectLesson>[]>();
    for (const lesson of lessons) {
      const mapped = mapSubjectLesson(lesson as Record<string, unknown>);
      const key = mapped.moduleId;
      const list = lessonsByModule.get(key) ?? [];
      list.push(mapped);
      lessonsByModule.set(key, list);
    }

    const curriculum = modules.map((mod) => {
      const mapped = mapSubjectModule(mod as Record<string, unknown>);
      return {
        ...mapped,
        lessons: lessonsByModule.get(mapped._id) ?? [],
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        subject: mapBatchClass(subjectRow as Record<string, unknown>),
        modules: curriculum,
        canManage: access.canManage,
      },
    });
  } catch (error) {
    console.error("GET subject curriculum", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch subject curriculum" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    await connectDB();
    const auth = await requireSessionUser(["admin", "instructor"]);
    if (auth.error) return auth.error;

    const { id: batchId, subjectId } = await context.params;
    const access = await requireBatchManageAccess(batchId, auth.user);
    if (access.error) return access.error;

    const subjectResolved = await requireSubjectInBatch(batchId, subjectId);
    if (subjectResolved.error) return subjectResolved.error;

    const body = (await request.json()) as Record<string, unknown>;
    const title = typeof body.title === "string" ? body.title.trim() : "";
    if (!title) {
      return NextResponse.json(
        { success: false, error: "title is required" },
        { status: 400 },
      );
    }

    const batchOid = toObjectId(batchId);
    const subjectOid = toObjectId(subjectId);
    const count = await SubjectModule.countDocuments({
      batchId: batchOid,
      subjectId: subjectOid,
    });
    const row = await SubjectModule.create({
      batchId: batchOid,
      subjectId: subjectOid,
      title,
      description:
        typeof body.description === "string" ? body.description.trim() : undefined,
      order:
        typeof body.order === "number" && body.order > 0 ? body.order : count + 1,
      isPublished: body.isPublished !== false,
    });

    return NextResponse.json(
      {
        success: true,
        data: { module: mapSubjectModule(row.toObject() as Record<string, unknown>) },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST subject module", error);
    return NextResponse.json(
      { success: false, error: "Failed to create module" },
      { status: 500 },
    );
  }
}
