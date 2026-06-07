import { NextResponse } from "next/server";
import BatchClass from "@/models/BatchClass";
import SubjectModule from "@/models/SubjectModule";
import { isObjectId, toObjectId } from "@/app/api/_lib/phase12";

export async function requireSubjectInBatch(batchId: string, subjectId: string) {
  if (!isObjectId(batchId) || !isObjectId(subjectId)) {
    return {
      error: NextResponse.json(
        { success: false, error: "Invalid batch or subject id" },
        { status: 400 },
      ),
      subject: null,
    };
  }

  const subject = await BatchClass.findOne({
    _id: toObjectId(subjectId),
    batchId: toObjectId(batchId),
    isActive: true,
  }).lean();

  if (!subject) {
    return {
      error: NextResponse.json(
        { success: false, error: "Subject not found" },
        { status: 404 },
      ),
      subject: null,
    };
  }

  return { error: null, subject };
}

export async function requireModuleInSubject(
  batchId: string,
  subjectId: string,
  moduleId: string,
) {
  const subjectResolved = await requireSubjectInBatch(batchId, subjectId);
  if (subjectResolved.error) return { ...subjectResolved, module: null };

  if (!isObjectId(moduleId)) {
    return {
      error: NextResponse.json(
        { success: false, error: "Invalid module id" },
        { status: 400 },
      ),
      subject: subjectResolved.subject,
      module: null,
    };
  }

  const moduleRow = await SubjectModule.findOne({
    _id: toObjectId(moduleId),
    batchId: toObjectId(batchId),
    subjectId: toObjectId(subjectId),
  }).lean();

  if (!moduleRow) {
    return {
      error: NextResponse.json(
        { success: false, error: "Module not found" },
        { status: 404 },
      ),
      subject: subjectResolved.subject,
      module: null,
    };
  }

  return { error: null, subject: subjectResolved.subject, module: moduleRow };
}
