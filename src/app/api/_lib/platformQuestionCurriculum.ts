import Batch from "@/models/Batch";
import BatchClass from "@/models/BatchClass";
import SubjectModule from "@/models/SubjectModule";
import SubjectLesson from "@/models/SubjectLesson";
import { instructorBatchFilter } from "@/app/api/_lib/batchAccess";
import type { SessionUser } from "@/app/api/_lib/phase12";

export type CurriculumModuleOption = {
  _id: string;
  title: string;
  batchId: string;
  batchClassId: string;
  lessons: { _id: string; title: string }[];
};

export async function getCurriculumOptionsForSubject(
  user: SessionUser,
  subjectTitle: string,
): Promise<CurriculumModuleOption[]> {
  const title = subjectTitle.trim();
  if (!title) return [];

  const batchFilter: Record<string, unknown> = { isActive: { $ne: false } };
  if (user.role === "instructor") {
    Object.assign(batchFilter, instructorBatchFilter(user.id));
  } else if (user.role !== "admin") {
    return [];
  }

  const batches = await Batch.find(batchFilter).select("_id").lean();
  const batchIds = batches.map((b) => b._id);
  if (!batchIds.length) return [];

  const classes = await BatchClass.find({
    batchId: { $in: batchIds },
    title,
    isActive: { $ne: false },
  })
    .select("_id title batchId")
    .lean();

  if (!classes.length) return [];

  const classIds = classes.map((c) => c._id);
  const [modules, lessons] = await Promise.all([
    SubjectModule.find({ subjectId: { $in: classIds } })
      .sort({ order: 1, title: 1 })
      .select("_id title batchId subjectId")
      .lean(),
    SubjectLesson.find({ subjectId: { $in: classIds } })
      .sort({ order: 1, title: 1 })
      .select("_id title moduleId batchId subjectId")
      .lean(),
  ]);

  const lessonsByModule = new Map<string, { _id: string; title: string }[]>();
  for (const lesson of lessons) {
    const key = String(lesson.moduleId);
    const list = lessonsByModule.get(key) ?? [];
    list.push({ _id: String(lesson._id), title: String(lesson.title) });
    lessonsByModule.set(key, list);
  }

  return modules.map((mod) => ({
    _id: String(mod._id),
    title: String(mod.title),
    batchId: String(mod.batchId),
    batchClassId: String(mod.subjectId),
    lessons: lessonsByModule.get(String(mod._id)) ?? [],
  }));
}
