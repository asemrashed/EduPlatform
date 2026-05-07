import mongoose from "mongoose";
import Lesson from "@/models/Lesson";
import Course from "@/models/Course";

export type LessonAccessRole = "admin" | "instructor";

type LessonListParams = {
  userId: string;
  role: LessonAccessRole;
  query: URLSearchParams;
};

function toPositiveInt(value: string | null, fallback: number): number {
  const parsed = Number.parseInt(value || "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export async function resolveAccessibleCourseIds(
  userId: string,
  role: LessonAccessRole,
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

function mapLesson(lesson: any) {
  return {
    _id: String(lesson._id),
    title: lesson.title || "",
    description: lesson.description || undefined,
    content: lesson.content || undefined,
    chapter:
      lesson.chapter && typeof lesson.chapter === "object"
        ? {
            _id: String(lesson.chapter._id || ""),
            title: lesson.chapter.title || undefined,
            order:
              typeof lesson.chapter.order === "number"
                ? lesson.chapter.order
                : undefined,
          }
        : String(lesson.chapter),
    course: String(lesson.course),
    order: typeof lesson.order === "number" ? lesson.order : 0,
    duration: typeof lesson.duration === "number" ? lesson.duration : undefined,
    youtubeVideoId: lesson.youtubeVideoId || undefined,
    videoUrl: lesson.videoUrl || undefined,
    videoDuration:
      typeof lesson.videoDuration === "number"
        ? lesson.videoDuration
        : undefined,
    attachments: Array.isArray(lesson.attachments) ? lesson.attachments : [],
    isPublished: Boolean(lesson.isPublished),
    isFree: Boolean(lesson.isFree),
    youtubeEmbedUrl: lesson.youtubeEmbedUrl || undefined,
    youtubeThumbnailUrl: lesson.youtubeThumbnailUrl || undefined,
    youtubeWatchUrl: lesson.youtubeWatchUrl || undefined,
    createdAt: lesson.createdAt,
    updatedAt: lesson.updatedAt,
  };
}

export async function listManagedLessons({
  userId,
  role,
  query,
}: LessonListParams) {
  const chapter = (query.get("chapter") || query.get("chapterId") || "").trim();
  const course = (query.get("course") || query.get("courseId") || "").trim();
  const search = (query.get("search") || query.get("q") || "").trim();
  const isPublishedParam = query.get("isPublished");
  const isFreeParam = query.get("isFree");
  const page = toPositiveInt(query.get("page"), 1);
  const limit = Math.min(toPositiveInt(query.get("limit"), 10), 1000);
  const sortBy = (query.get("sortBy") || "order").trim();
  const sortOrder = (query.get("sortOrder") || "asc").trim() === "desc" ? -1 : 1;

  const allowedSort: Record<string, 1 | -1> = {
    title: sortOrder,
    order: sortOrder,
    duration: sortOrder,
    createdAt: sortOrder,
    updatedAt: sortOrder,
  };
  const sort = allowedSort[sortBy]
    ? { [sortBy]: allowedSort[sortBy] as 1 | -1 }
    : { order: 1 as 1 };

  const filter: Record<string, unknown> = {};
  if (chapter) {
    if (!mongoose.Types.ObjectId.isValid(chapter)) {
      throw new Error("invalid_chapter");
    }
    filter.chapter = new mongoose.Types.ObjectId(chapter);
  }
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
      { content: { $regex: search, $options: "i" } },
    ];
  }
  if (isPublishedParam === "true") {
    filter.isPublished = true;
  } else if (isPublishedParam === "false") {
    filter.isPublished = false;
  }
  if (isFreeParam === "true") {
    filter.isFree = true;
  } else if (isFreeParam === "false") {
    filter.isFree = false;
  }

  const accessibleCourseIds = await resolveAccessibleCourseIds(userId, role);
  if (accessibleCourseIds) {
    if (accessibleCourseIds.length === 0) {
      return {
        lessons: [],
        pagination: { page, limit, total: 0, pages: 0 },
        stats: {
          total: 0,
          published: 0,
          unpublished: 0,
          free: 0,
          paid: 0,
          withVideo: 0,
          withYouTubeVideo: 0,
          withAttachments: 0,
        },
      };
    }
    if (filter.course) {
      const requested = String(filter.course);
      const allowed = accessibleCourseIds.some((id) => String(id) === requested);
      if (!allowed) {
        return {
          lessons: [],
          pagination: { page, limit, total: 0, pages: 0 },
          stats: {
            total: 0,
            published: 0,
            unpublished: 0,
            free: 0,
            paid: 0,
            withVideo: 0,
            withYouTubeVideo: 0,
            withAttachments: 0,
          },
        };
      }
    } else {
      filter.course = { $in: accessibleCourseIds };
    }
  }

  const skip = (page - 1) * limit;
  const [lessons, total, statRows] = await Promise.all([
    Lesson.find(filter)
      .populate("chapter", "title order")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Lesson.countDocuments(filter),
    Lesson.aggregate([
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
          free: {
            $sum: { $cond: [{ $eq: ["$isFree", true] }, 1, 0] },
          },
          paid: {
            $sum: { $cond: [{ $eq: ["$isFree", false] }, 1, 0] },
          },
          withVideo: {
            $sum: {
              $cond: [
                {
                  $or: [
                    { $gt: [{ $strLenCP: { $ifNull: ["$videoUrl", ""] } }, 0] },
                    {
                      $gt: [
                        { $strLenCP: { $ifNull: ["$youtubeVideoId", ""] } },
                        0,
                      ],
                    },
                  ],
                },
                1,
                0,
              ],
            },
          },
          withYouTubeVideo: {
            $sum: {
              $cond: [
                {
                  $gt: [{ $strLenCP: { $ifNull: ["$youtubeVideoId", ""] } }, 0],
                },
                1,
                0,
              ],
            },
          },
          withAttachments: {
            $sum: {
              $cond: [
                { $gt: [{ $size: { $ifNull: ["$attachments", []] } }, 0] },
                1,
                0,
              ],
            },
          },
        },
      },
    ]),
  ]);

  const pages = total > 0 ? Math.ceil(total / limit) : 0;
  const stats = statRows[0] || {
    total: 0,
    published: 0,
    unpublished: 0,
    free: 0,
    paid: 0,
    withVideo: 0,
    withYouTubeVideo: 0,
    withAttachments: 0,
  };

  return {
    lessons: lessons.map(mapLesson),
    pagination: { page, limit, total, pages },
    stats,
  };
}
