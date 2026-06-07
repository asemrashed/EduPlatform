import Question from "@/models/Question";
import { isObjectId, toObjectId, type AppRole } from "@/app/api/_lib/phase12";
import { instructorCanAccessQuestion } from "@/app/api/_lib/questionBank";
import { buildWorksheetPdfBuffer } from "@/lib/pdf/worksheetPdf";
import { persistPdfBuffer } from "@/lib/pdf/storePdf";

export async function assertStaffCanUseQuestions(
  role: AppRole,
  userId: string,
  questionIds: string[],
) {
  if (!questionIds.length) {
    return { error: "Select at least one question", questions: null as null };
  }

  const unique = [...new Set(questionIds.filter((id) => isObjectId(id)))];
  if (!unique.length) {
    return { error: "Invalid question selection", questions: null as null };
  }

  const rows = await Question.find({
    _id: { $in: unique.map((id) => toObjectId(id)) },
    isActive: { $ne: false },
  }).lean();

  if (rows.length !== unique.length) {
    return { error: "One or more questions were not found or are inactive", questions: null };
  }

  if (role === "instructor") {
    for (const id of unique) {
      const allowed = await instructorCanAccessQuestion(userId, id);
      if (!allowed) {
        return { error: "You do not have access to one or more selected questions", questions: null };
      }
    }
  }

  const order = new Map(unique.map((id, i) => [id, i]));
  const sorted = [...rows].sort(
    (a, b) => (order.get(String(a._id)) ?? 0) - (order.get(String(b._id)) ?? 0),
  );

  return { error: null, questions: sorted };
}

export async function generateWorksheetPdfFromQuestions(options: {
  title: string;
  subtitle?: string;
  questions: Array<Record<string, unknown>>;
  includeAnswers?: boolean;
}) {
  const buffer = await buildWorksheetPdfBuffer({
    title: options.title,
    subtitle: options.subtitle,
    includeAnswers: options.includeAnswers,
    questions: options.questions.map((q) => ({
      question: String(q.question ?? ""),
      type: String(q.type ?? "written"),
      marks: Number(q.marks ?? 1),
      options: Array.isArray(q.options)
        ? (q.options as { text?: string; isCorrect?: boolean }[]).map((opt) => ({
            text: String(opt.text ?? ""),
            isCorrect: Boolean(opt.isCorrect),
          }))
        : undefined,
      correctAnswer: q.correctAnswer ? String(q.correctAnswer) : undefined,
    })),
  });

  return persistPdfBuffer(buffer);
}
