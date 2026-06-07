import mongoose from "mongoose";
import Question from "@/models/Question";
import Exam from "@/models/Exam";
import Lesson from "@/models/Lesson";
import Chapter from "@/models/Chapter";
import { resolveAccessibleCourseIds } from "@/lib/chapters/management";
import type { AppRole, SessionUser } from "@/app/api/_lib/phase12";
import { isObjectId, pagination, parseLimit, parsePage, toObjectId } from "@/app/api/_lib/phase12";

export function buildQuestionStats(rows: Array<Record<string, unknown>>) {
  const byType: Record<string, number> = {};
  const byDifficulty: Record<string, number> = {};
  const byStatus: Record<string, number> = {};
  let totalMarks = 0;
  for (const q of rows) {
    const type = String(q.type || "unknown");
    const difficulty = String(q.difficulty || "unknown");
    byType[type] = (byType[type] || 0) + 1;
    byDifficulty[difficulty] = (byDifficulty[difficulty] || 0) + 1;
    const key = q.isActive !== false ? "active" : "inactive";
    byStatus[key] = (byStatus[key] || 0) + 1;
    totalMarks += Number(q.marks || 0);
  }
  return {
    totalQuestions: rows.length,
    activeQuestions: rows.filter((q) => q.isActive !== false).length,
    mcqQuestions: rows.filter((q) => q.type === "mcq").length,
    totalMarks,
    byType,
    byDifficulty,
    byStatus,
  };
}

async function getExamIdsForCourses(courseIds: mongoose.Types.ObjectId[]) {
  if (!courseIds.length) return [];
  return Exam.find({ course: { $in: courseIds } }).distinct("_id");
}

async function getLessonIdsForChapters(chapterIds: mongoose.Types.ObjectId[]) {
  if (!chapterIds.length) return [];
  return Lesson.find({ chapter: { $in: chapterIds } }).distinct("_id");
}

async function resolveChapterIds(
  courseId: string | null,
  chapterId: string | null,
  allowedCourseIds: mongoose.Types.ObjectId[] | null,
) {
  const chapterFilter: Record<string, unknown> = {};
  if (chapterId && isObjectId(chapterId)) {
    chapterFilter._id = toObjectId(chapterId);
  }
  if (courseId && isObjectId(courseId)) {
    chapterFilter.course = toObjectId(courseId);
  } else if (allowedCourseIds) {
    chapterFilter.course = { $in: allowedCourseIds };
  }
  if (!Object.keys(chapterFilter).length) return [];
  return Chapter.find(chapterFilter).distinct("_id");
}

/** Build Mongo filter for question-bank list/stats (course → chapter → exam hierarchy). */
export async function buildQuestionBankFilter(
  user: SessionUser,
  searchParams: URLSearchParams,
): Promise<Record<string, unknown>> {
  const search = (searchParams.get("search") || "").trim();
  const type = (searchParams.get("type") || "").trim();
  const difficulty = (searchParams.get("difficulty") || "").trim();
  const status = (searchParams.get("status") || "").trim();
  const examParam = (searchParams.get("exam") || "").trim();
  const courseParam = (searchParams.get("course") || "").trim();
  const chapterParam = (searchParams.get("chapter") || "").trim();
  const lessonParam = (searchParams.get("lesson") || "").trim();

  const filter: Record<string, unknown> = {};

  if (search) filter.question = { $regex: search, $options: "i" };
  if (type && type !== "all") filter.type = type;
  if (difficulty && difficulty !== "all") filter.difficulty = difficulty;
  if (status === "active") filter.isActive = true;
  if (status === "inactive") filter.isActive = false;
  if (examParam && isObjectId(examParam)) {
    filter.exam = toObjectId(examParam);
  }

  const role = user.role as AppRole;
  let allowedCourseIds: mongoose.Types.ObjectId[] | null = null;
  if (role === "instructor") {
    allowedCourseIds = await resolveAccessibleCourseIds(user.id, "instructor");
    if (!allowedCourseIds?.length) {
      return { _id: { $in: [] } };
    }
  }

  let scopeCourseIds = allowedCourseIds;
  if (courseParam && isObjectId(courseParam)) {
    const cid = toObjectId(courseParam);
    if (allowedCourseIds && !allowedCourseIds.some((id) => id.equals(cid))) {
      return { _id: { $in: [] } };
    }
    scopeCourseIds = [cid];
  }

  const hierarchyParts: Record<string, unknown>[] = [];

  if (lessonParam && isObjectId(lessonParam)) {
    hierarchyParts.push({ lesson: toObjectId(lessonParam) });
  } else if (chapterParam && isObjectId(chapterParam)) {
    const chapterIds = await resolveChapterIds(
      courseParam && isObjectId(courseParam) ? courseParam : null,
      chapterParam,
      allowedCourseIds,
    );
    const lessonIds = await getLessonIdsForChapters(chapterIds);
    if (lessonIds.length) hierarchyParts.push({ lesson: { $in: lessonIds } });
    if (!lessonIds.length && !examParam) {
      hierarchyParts.push({ _id: { $in: [] } });
    }
  } else if (scopeCourseIds?.length || (courseParam && isObjectId(courseParam))) {
    const courseIds =
      scopeCourseIds ||
      (courseParam && isObjectId(courseParam) ? [toObjectId(courseParam)] : []);
    const examIds = await getExamIdsForCourses(courseIds);
    const chapterIds = await Chapter.find({ course: { $in: courseIds } }).distinct("_id");
    const lessonIds = await getLessonIdsForChapters(chapterIds);
    if (examIds.length) hierarchyParts.push({ exam: { $in: examIds } });
    if (lessonIds.length) hierarchyParts.push({ lesson: { $in: lessonIds } });
    if (!examIds.length && !lessonIds.length && !examParam) {
      hierarchyParts.push({ _id: { $in: [] } });
    }
  } else if (role === "instructor" && allowedCourseIds?.length) {
    const examIds = await getExamIdsForCourses(allowedCourseIds);
    const chapterIds = await Chapter.find({ course: { $in: allowedCourseIds } }).distinct("_id");
    const lessonIds = await getLessonIdsForChapters(chapterIds);
    const scope: Record<string, unknown>[] = [];
    if (examIds.length) scope.push({ exam: { $in: examIds } });
    if (lessonIds.length) scope.push({ lesson: { $in: lessonIds } });
    if (!scope.length) return { _id: { $in: [] } };
    hierarchyParts.push(...scope);
  }

  if (hierarchyParts.length === 1) {
    Object.assign(filter, hierarchyParts[0]);
  } else if (hierarchyParts.length > 1) {
    filter.$or = hierarchyParts;
  }

  return filter;
}

export async function enrichQuestions(rows: Array<Record<string, unknown>>) {
  const examIds = rows
    .map((q) => q.exam)
    .filter((id) => id && mongoose.Types.ObjectId.isValid(String(id)))
    .map((id) => toObjectId(String(id)));
  const lessonIds = rows
    .map((q) => q.lesson)
    .filter((id) => id && mongoose.Types.ObjectId.isValid(String(id)))
    .map((id) => toObjectId(String(id)));

  const [exams, lessons] = await Promise.all([
    examIds.length
      ? Exam.find({ _id: { $in: examIds } })
          .populate("course", "title")
          .lean()
      : [],
    lessonIds.length
      ? Lesson.find({ _id: { $in: lessonIds } })
          .populate({ path: "chapter", select: "title course", populate: { path: "course", select: "title" } })
          .lean()
      : [],
  ]);

  const examMap = new Map(exams.map((e: any) => [String(e._id), e]));
  const lessonMap = new Map(lessons.map((l: any) => [String(l._id), l]));

  return rows.map((q) => {
    const examDoc = q.exam ? examMap.get(String(q.exam)) : null;
    const lessonDoc = q.lesson ? lessonMap.get(String(q.lesson)) : null;
    const courseFromExam = examDoc?.course as { _id?: unknown; title?: string } | undefined;
    const chapterFromLesson = lessonDoc?.chapter as
      | { _id?: unknown; title?: string; course?: { _id?: unknown; title?: string } }
      | undefined;

    const course =
      courseFromExam || chapterFromLesson?.course
        ? {
            _id: String((courseFromExam?._id ?? chapterFromLesson?.course?._id) || ""),
            title: String((courseFromExam?.title ?? chapterFromLesson?.course?.title) || ""),
          }
        : undefined;

    const chapter = chapterFromLesson
      ? { _id: String(chapterFromLesson._id), title: String(chapterFromLesson.title || "") }
      : undefined;

    const examInfo = examDoc
      ? { _id: String(examDoc._id), title: String(examDoc.title || "") }
      : undefined;

    const lessonInfo = lessonDoc
      ? { _id: String(lessonDoc._id), title: String((lessonDoc as any).title || "") }
      : undefined;

    return {
      ...q,
      _id: String(q._id),
      course,
      chapter,
      examInfo,
      lessonInfo,
    };
  });
}

export async function listQuestionBank(user: SessionUser, searchParams: URLSearchParams) {
  const page = parsePage(searchParams);
  const limit = parseLimit(searchParams, 12, 100);
  const skip = (page - 1) * limit;
  const sortBy = (searchParams.get("sortBy") || "createdAt").trim();
  const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;
  const allowedSort = new Set(["question", "createdAt", "updatedAt", "marks", "type", "difficulty"]);
  const sortField = allowedSort.has(sortBy) ? sortBy : "createdAt";

  const filter = await buildQuestionBankFilter(user, searchParams);
  const sort: Record<string, 1 | -1> = { [sortField]: sortOrder };

  const [rows, total] = await Promise.all([
    Question.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Question.countDocuments(filter),
  ]);

  const questions = await enrichQuestions(rows as Array<Record<string, unknown>>);

  return {
    questions,
    pagination: pagination(page, limit, total),
  };
}

export async function statsQuestionBank(user: SessionUser, searchParams: URLSearchParams) {
  const filter = await buildQuestionBankFilter(user, searchParams);
  const rows = await Question.find(filter).select("type difficulty marks isActive").lean();
  return buildQuestionStats(rows as Array<Record<string, unknown>>);
}

/** Instructor may mutate questions linked to their courses (not only createdBy). */
export async function instructorCanAccessQuestion(
  userId: string,
  questionId: string,
): Promise<boolean> {
  if (!isObjectId(questionId)) return false;
  const q = await Question.findById(questionId).lean();
  if (!q) return false;

  const allowedCourseIds = await resolveAccessibleCourseIds(userId, "instructor");
  if (!allowedCourseIds?.length) return false;

  if (q.exam) {
    const exam = await Exam.findById(q.exam).select("course").lean();
    if (exam?.course && allowedCourseIds.some((id) => id.equals(exam.course as mongoose.Types.ObjectId))) {
      return true;
    }
  }
  if (q.lesson) {
    const lesson = await Lesson.findById(q.lesson).select("chapter").lean();
    if (!lesson?.chapter) return false;
    const chapter = await Chapter.findById(lesson.chapter).select("course").lean();
    if (chapter?.course && allowedCourseIds.some((id) => id.equals(chapter.course as mongoose.Types.ObjectId))) {
      return true;
    }
  }
  return String(q.createdBy) === userId;
}

export async function getInstructorCourseIds(userId: string) {
  return resolveAccessibleCourseIds(userId, "instructor");
}
