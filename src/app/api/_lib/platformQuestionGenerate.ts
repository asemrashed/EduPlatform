import PlatformQuestion from "@/models/PlatformQuestion";
import type { SessionUser } from "@/app/api/_lib/phase12";
import { toObjectId } from "@/app/api/_lib/phase12";
import { serializePlatformQuestion } from "@/app/api/_lib/platformQuestions";

export const PLATFORM_QUESTION_AI_MODEL = "claude-sonnet-4-20250514";

export type GeneratedPlatformQuestionDraft = {
  subject: string;
  topic: string;
  subtopic?: string;
  difficulty: 1 | 2 | 3;
  questionText: string;
  options: { text: string; isCorrect: boolean }[];
  answerText?: string;
  explanation?: string;
  hasDiagram?: boolean;
  diagramUrl?: string;
  aiTagConfidence?: number;
};

/** Documented in EXECUTION-LOG-2.md — Nasmatics TechSpec v2.0 not present in repo. */
export function buildPlatformQuestionExtractionPrompt(
  rawText: string,
  hints?: { subject?: string; topic?: string; fromPdf?: boolean },
) {
  const subjectHint = hints?.subject?.trim()
    ? `Default subject if unclear: "${hints.subject.trim()}".`
    : "";
  const topicHint = hints?.topic?.trim()
    ? `Default topic if unclear: "${hints.topic.trim()}".`
    : "";

  return `You are an expert Bangladesh curriculum MCQ author (Nasmatics-style platform question bank).

Extract multiple-choice questions from the SOURCE TEXT below. Return ONLY valid JSON (no markdown fences) matching this schema:

{
  "questions": [
    {
      "subject": "string (e.g. Physics, Mathematics)",
      "topic": "string (chapter-level topic)",
      "subtopic": "string or omit",
      "difficulty": 1,
      "questionText": "string",
      "options": [{ "text": "string", "isCorrect": boolean }],
      "answerText": "string (correct option letter or text)",
      "explanation": "string",
      "hasDiagram": boolean,
      "aiTagConfidence": 0.0
    }
  ]
}

Rules:
- difficulty must be 1 (easy), 2 (medium), or 3 (hard).
- Each question needs at least 2 options with exactly one isCorrect: true.
- aiTagConfidence is 0–1 for how confident you are in subject/topic/difficulty tags.
- Set hasDiagram true if the source clearly references a figure/diagram the question depends on.
- Skip duplicate or incomplete items; prefer quality over quantity.
${hints?.fromPdf ? "- Source is a PDF: figures may not be visible in extracted text — still flag hasDiagram when a question clearly refers to a diagram/figure." : ""}
${subjectHint}
${topicHint}

SOURCE TEXT:
---
${rawText.slice(0, 120000)}
---`;
}

function stripJsonFences(text: string) {
  const trimmed = text.trim();
  const fence = trimmed.match(/^```(?:json)?\s*([\s\S]*?)```$/i);
  return fence ? fence[1].trim() : trimmed;
}

function normalizeDraft(raw: Record<string, unknown>): GeneratedPlatformQuestionDraft | null {
  const subject = String(raw.subject || "").trim();
  const topic = String(raw.topic || "").trim();
  const questionText = String(raw.questionText || "").trim();
  const difficulty = Number(raw.difficulty);
  if (!subject || !topic || !questionText) return null;
  if (![1, 2, 3].includes(difficulty)) return null;

  const options = Array.isArray(raw.options)
    ? raw.options
        .map((o) => {
          const row = o as Record<string, unknown>;
          return {
            text: String(row.text || "").trim(),
            isCorrect: Boolean(row.isCorrect),
          };
        })
        .filter((o) => o.text)
    : [];
  if (options.length < 2) return null;
  if (!options.some((o) => o.isCorrect)) {
    options[0] = { ...options[0], isCorrect: true };
  }

  let aiTagConfidence = Number(raw.aiTagConfidence);
  if (!Number.isFinite(aiTagConfidence)) aiTagConfidence = 0.7;
  aiTagConfidence = Math.min(1, Math.max(0, aiTagConfidence));

  return {
    subject,
    topic,
    subtopic: raw.subtopic ? String(raw.subtopic).trim() : undefined,
    difficulty: difficulty as 1 | 2 | 3,
    questionText,
    options,
    answerText: raw.answerText ? String(raw.answerText).trim() : undefined,
    explanation: raw.explanation ? String(raw.explanation).trim() : undefined,
    hasDiagram: Boolean(raw.hasDiagram),
    diagramUrl: raw.diagramUrl ? String(raw.diagramUrl).trim() : undefined,
    aiTagConfidence,
  };
}

export async function callClaudeForQuestionExtraction(
  rawText: string,
  hints?: { subject?: string; topic?: string; fromPdf?: boolean },
): Promise<GeneratedPlatformQuestionDraft[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY_NOT_CONFIGURED");
  }

  const prompt = buildPlatformQuestionExtractionPrompt(rawText, hints);

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: PLATFORM_QUESTION_AI_MODEL,
      max_tokens: 8192,
      temperature: 0.2,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    throw new Error(`ANTHROPIC_API_ERROR:${res.status}:${errBody.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    content?: Array<{ type: string; text?: string }>;
  };
  const textBlock = data.content?.find((c) => c.type === "text");
  const rawJson = stripJsonFences(String(textBlock?.text || ""));

  let parsed: { questions?: unknown[] };
  try {
    parsed = JSON.parse(rawJson) as { questions?: unknown[] };
  } catch {
    throw new Error("ANTHROPIC_PARSE_ERROR");
  }

  const list = Array.isArray(parsed.questions) ? parsed.questions : [];
  return list
    .map((q) => normalizeDraft(q as Record<string, unknown>))
    .filter((q): q is GeneratedPlatformQuestionDraft => q !== null);
}

export type SaveGeneratedMeta = {
  subject?: string;
  topic?: string;
  accessPolicy?: string;
  sourceType?: "claude" | "pdf";
  sourcePdfPublicId?: string;
  sourcePdfUrl?: string;
};

export async function saveGeneratedPlatformQuestions(
  user: SessionUser,
  drafts: GeneratedPlatformQuestionDraft[],
  defaults?: SaveGeneratedMeta,
) {
  const sourceType = defaults?.sourceType === "pdf" ? "pdf" : "claude";
  const pdfUrl = defaults?.sourcePdfUrl?.trim();

  const docs = drafts.map((d) => {
    let accessPolicy = defaults?.accessPolicy || "private";
    if (!["private", "shared_with_instructors", "public"].includes(accessPolicy)) {
      accessPolicy = "private";
    }
    if (user.role === "instructor") accessPolicy = "private";

    const hasDiagram = Boolean(d.hasDiagram);
    let diagramUrl = d.diagramUrl?.trim();
    if (hasDiagram && !diagramUrl && pdfUrl) diagramUrl = pdfUrl;

    return {
      subject: d.subject || defaults?.subject || "General",
      topic: d.topic || defaults?.topic || "General",
      subtopic: d.subtopic,
      difficulty: d.difficulty,
      questionText: d.questionText,
      options: d.options,
      answerText: d.answerText,
      explanation: d.explanation,
      hasDiagram,
      diagramUrl,
      accessPolicy,
      ownerType: user.role,
      ownerId: toObjectId(user.id),
      aiGenerated: true,
      aiModel: PLATFORM_QUESTION_AI_MODEL,
      aiTagConfidence: d.aiTagConfidence,
      tagVerified: false,
      sourceType,
      sourcePdfPublicId:
        sourceType === "pdf" ? defaults?.sourcePdfPublicId : undefined,
      tags: [],
      isActive: true,
    };
  });

  const created = await PlatformQuestion.insertMany(docs);
  return created.map((doc) =>
    serializePlatformQuestion(doc.toObject() as Record<string, unknown>),
  );
}
