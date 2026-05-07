import mongoose from "mongoose";
import Chapter from "@/models/Chapter";
import Course from "@/models/Course";

export type ChapterAccessRole = "admin" | "instructor";

type ChapterListParams = {
  userId: string;
  role: ChapterAccessRole;
  query: URLSearchParams;
};

function toPositiveInt(value: string | null, fallback: number): number {
  const parsed = Number.parseInt(value || "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export async function resolveAccessibleCourseIds(
  userId: string,
  role: ChapterAccessRole,
): Promise<mongoose.Types.ObjectId[] | null> {
  if (role === "admin") {
    return null;
  }
  const rows = await Course.find({
    $or: [{ instructor: userId }, { createdBy: userId }],
  })
    .select("_id")
    .lean();
  return rows.map((row: any) => new mongoose.Types.ObjectId(String(row._id)));
}

export async function listManagedChapters({
  userId,
  role,
  query,
}: ChapterListParams) {
  const course = (query.get("course") || query.get("courseId") || "").trim();
  const search = (query.get("search") || query.get("q") || "").trim();
  const isPublishedParam = query.get("isPublished");
  const page = toPositiveInt(query.get("page"), 1);
  const limit = Math.min(toPositiveInt(query.get("limit"), 10), 500);
  const sortBy = (query.get("sortBy") || "order").trim();
  const sortOrder = (query.get("sortOrder") || "asc").trim() === "desc" ? -1 : 1;

  const allowedSort: Record<string, 1 | -1> = {
    title: sortOrder,
    order: sortOrder,
    createdAt: sortOrder,
    updatedAt: sortOrder,
  };
  const sort = allowedSort[sortBy]
    ? { [sortBy]: allowedSort[sortBy] as 1 | -1 }
    : { order: 1 as 1 };

  const filter: Record<string, unknown> = {};
  if (course) {
    if (!mongoose.Types.ObjectId.isValid(course)) {
      throw new Error("invalid_course");
    }
    filter.course = new mongoose.Types.ObjectId(course);
  }
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }
  if (isPublishedParam === "true") {
    filter.isPublished = true;
  } else if (isPublishedParam === "false") {
    filter.isPublished = false;
  }

  const accessibleCourseIds = await resolveAccessibleCourseIds(userId, role);
  if (accessibleCourseIds) {
    if (accessibleCourseIds.length === 0) {
      return {
        chapters: [],
        pagination: { page, limit, total: 0, pages: 0 },
        stats: { total: 0, published: 0, unpublished: 0 },
      };
    }
    if (filter.course) {
      const requested = String(filter.course);
      const allowed = accessibleCourseIds.some((id) => String(id) === requested);
      if (!allowed) {
        return {
          chapters: [],
          pagination: { page, limit, total: 0, pages: 0 },
          stats: { total: 0, published: 0, unpublished: 0 },
        };
      }
    } else {
      filter.course = { $in: accessibleCourseIds };
    }
  }

  const skip = (page - 1) * limit;
  const [chapters, total, statRows] = await Promise.all([
    Chapter.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Chapter.countDocuments(filter),
    Chapter.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          published: {
            $sum: { $cond: [{ $eq: ["$isPublished", true] }, 1, 0] },
          },
          unpublished: {
            $sum: { $cond: [{ $eq: ["$isPublished", false] }, 1, 0] },
          },
        },
      },
    ]),
  ]);

  const pages = total > 0 ? Math.ceil(total / limit) : 0;
  const stats = statRows[0] || { total: 0, published: 0, unpublished: 0 };

  return {
    chapters: chapters.map((chapter: any) => ({
      _id: String(chapter._id),
      title: chapter.title || "",
      description: chapter.description || undefined,
      course: String(chapter.course),
      order: typeof chapter.order === "number" ? chapter.order : 0,
      isPublished: Boolean(chapter.isPublished),
      createdAt: chapter.createdAt,
      updatedAt: chapter.updatedAt,
    })),
    pagination: { page, limit, total, pages },
    stats,
  };
}
