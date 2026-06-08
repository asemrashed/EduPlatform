import PlatformQuestion from "@/models/PlatformQuestion";
import { resolveResourceCenterAccess } from "@/app/api/_lib/resourceAccess";
import { isObjectId, toObjectId } from "@/app/api/_lib/phase12";
import { TEST_YOURSELF_VISIBLE_FILTER } from "@/lib/resources/testYourself";

export type TestYourselfAccessInfo = {
  fullAccess: boolean;
  freeLimit: number;
};

export async function resolveTestYourselfAccess(
  userId?: string,
  role?: string,
): Promise<TestYourselfAccessInfo> {
  const access = await resolveResourceCenterAccess(userId, role);
  return {
    fullAccess: access.fullAccess,
    freeLimit: access.freeLimit,
  };
}

export function mapTestYourselfQuestion(row: Record<string, unknown>) {
  const options = Array.isArray(row.options)
    ? (row.options as { text?: string }[]).map((opt, index) => ({
        index,
        text: String(opt.text ?? "").trim(),
      }))
    : [];

  return {
    _id: String(row._id),
    subject: String(row.subject ?? ""),
    topic: String(row.topic ?? ""),
    subtopic: row.subtopic ? String(row.subtopic) : undefined,
    difficulty: Number(row.difficulty) as 1 | 2 | 3,
    questionText: String(row.questionText ?? ""),
    hasDiagram: Boolean(row.hasDiagram),
    diagramUrl: row.diagramUrl ? String(row.diagramUrl) : undefined,
    options: options.filter((o) => o.text),
  };
}

export async function listTestYourselfTopics(access: TestYourselfAccessInfo) {
  const rows = await PlatformQuestion.aggregate([
    { $match: TEST_YOURSELF_VISIBLE_FILTER },
    {
      $group: {
        _id: { subject: "$subject", topic: "$topic" },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.subject": 1, "_id.topic": 1 } },
  ]);

  return rows.map((row) => {
    const subject = String(row._id?.subject ?? "").trim();
    const topic = String(row._id?.topic ?? "").trim();
    const questionCount = row.count as number;
    const previewCount = access.fullAccess
      ? questionCount
      : Math.min(questionCount, access.freeLimit);
    const lockedCount = access.fullAccess
      ? 0
      : Math.max(0, questionCount - access.freeLimit);

    return { subject, topic, questionCount, previewCount, lockedCount };
  });
}

export async function listTestYourselfQuestions(
  _access: TestYourselfAccessInfo,
  subject: string,
  topic: string,
) {
  const filter = {
    ...TEST_YOURSELF_VISIBLE_FILTER,
    subject,
    topic,
  };

  const rows = await PlatformQuestion.find(filter)
    .sort({ difficulty: 1, createdAt: 1 })
    .lean();

  const total = rows.length;

  return {
    total,
    questions: rows.map((r) =>
      mapTestYourselfQuestion(r as Record<string, unknown>),
    ),
  };
}

async function orderedQuestionIds(subject: string, topic: string) {
  const rows = await PlatformQuestion.find({
    ...TEST_YOURSELF_VISIBLE_FILTER,
    subject,
    topic,
  })
    .sort({ difficulty: 1, createdAt: 1 })
    .select("_id")
    .lean();

  return rows.map((r) => String(r._id));
}

export async function checkTestYourselfAnswers(
  access: TestYourselfAccessInfo,
  subject: string,
  topic: string,
  answers: { questionId: string; optionIndex: number }[],
) {
  const ids = answers
    .map((a) => a.questionId)
    .filter((id) => isObjectId(id));

  if (!ids.length) {
    return { error: "No valid answers submitted", results: null as null };
  }

  const orderedIds = await orderedQuestionIds(subject, topic);
  const allowedIds = new Set(
    access.fullAccess
      ? orderedIds
      : orderedIds.slice(0, access.freeLimit),
  );

  if (!access.fullAccess && answers.length > access.freeLimit) {
    return {
      error: `You can submit at most ${access.freeLimit} questions on the free plan`,
      results: null,
    };
  }

  for (const id of ids) {
    if (!allowedIds.has(id)) {
      return {
        error: "One or more questions are not available in your preview",
        results: null,
      };
    }
  }

  const rows = await PlatformQuestion.find({
    _id: { $in: ids.map((id) => toObjectId(id)) },
    ...TEST_YOURSELF_VISIBLE_FILTER,
    subject,
    topic,
  }).lean();

  const byId = new Map(rows.map((r) => [String(r._id), r]));

  const results = answers.map((ans) => {
    const row = byId.get(ans.questionId);
    if (!row) {
      return {
        questionId: ans.questionId,
        correct: false,
        selectedIndex: ans.optionIndex,
        correctIndex: -1,
      };
    }

    const options = Array.isArray(row.options)
      ? (row.options as { isCorrect?: boolean }[])
      : [];
    const correctIndex = options.findIndex((o) => Boolean(o.isCorrect));
    const correct =
      correctIndex >= 0 &&
      ans.optionIndex === correctIndex &&
      ans.optionIndex >= 0 &&
      ans.optionIndex < options.length;

    return {
      questionId: ans.questionId,
      correct,
      selectedIndex: ans.optionIndex,
      correctIndex,
      explanation: row.explanation ? String(row.explanation) : undefined,
    };
  });

  const score = results.filter((r) => r.correct).length;

  return {
    error: null,
    results,
    score,
    total: results.length,
  };
}
