import mongoose, { Document, Schema } from "mongoose";

export type PlatformQuestionOwnerType = "admin" | "instructor";
export type PlatformQuestionAccessPolicy =
  | "private"
  | "shared_with_instructors"
  | "public";
export type PlatformQuestionSourceType = "manual" | "claude" | "pdf";

export interface IPlatformQuestionOption {
  text: string;
  isCorrect: boolean;
}

export interface IPlatformQuestion extends Document {
  _id: mongoose.Types.ObjectId;
  subject: string;
  topic: string;
  subtopic?: string;
  difficulty: 1 | 2 | 3;
  questionText: string;
  options: IPlatformQuestionOption[];
  answerText?: string;
  explanation?: string;
  hasDiagram: boolean;
  diagramUrl?: string;
  ownerType: PlatformQuestionOwnerType;
  ownerId: mongoose.Types.ObjectId;
  accessPolicy: PlatformQuestionAccessPolicy;
  aiGenerated: boolean;
  aiModel?: string;
  aiTagConfidence?: number;
  tagVerified?: boolean;
  sourceType: PlatformQuestionSourceType;
  sourceFileId?: mongoose.Types.ObjectId;
  /** Public id from `POST /api/upload/pdf` when sourceType is pdf. */
  sourcePdfPublicId?: string;
  tags: string[];
  /** Optional batch curriculum linkage (Phase 18+). */
  batchId?: mongoose.Types.ObjectId;
  batchClassId?: mongoose.Types.ObjectId;
  subjectModuleId?: mongoose.Types.ObjectId;
  subjectLessonId?: mongoose.Types.ObjectId;
  /** Optional course curriculum linkage. */
  courseId?: mongoose.Types.ObjectId;
  chapterId?: mongoose.Types.ObjectId;
  lessonId?: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PlatformQuestionOptionSchema = new Schema<IPlatformQuestionOption>(
  {
    text: { type: String, required: true, trim: true },
    isCorrect: { type: Boolean, default: false, required: true },
  },
  { _id: false },
);

const PlatformQuestionSchema = new Schema<IPlatformQuestion>(
  {
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
      index: true,
    },
    topic: {
      type: String,
      required: [true, "Topic is required"],
      trim: true,
      index: true,
    },
    subtopic: { type: String, trim: true, index: true },
    difficulty: {
      type: Number,
      enum: [1, 2, 3],
      required: true,
      index: true,
    },
    questionText: {
      type: String,
      required: [true, "Question text is required"],
      trim: true,
    },
    options: {
      type: [PlatformQuestionOptionSchema],
      default: [],
    },
    answerText: { type: String, trim: true },
    explanation: { type: String, trim: true },
    hasDiagram: { type: Boolean, default: false },
    diagramUrl: { type: String, trim: true },
    ownerType: {
      type: String,
      enum: ["admin", "instructor"],
      required: true,
      index: true,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    accessPolicy: {
      type: String,
      enum: ["private", "shared_with_instructors", "public"],
      default: "private",
      index: true,
    },
    aiGenerated: { type: Boolean, default: false, index: true },
    aiModel: { type: String, trim: true },
    aiTagConfidence: { type: Number, min: 0, max: 1 },
    tagVerified: { type: Boolean, default: false },
    sourceType: {
      type: String,
      enum: ["manual", "claude", "pdf"],
      default: "manual",
      index: true,
    },
    sourceFileId: { type: Schema.Types.ObjectId },
    sourcePdfPublicId: { type: String, trim: true, index: true },
    tags: { type: [String], default: [] },
    batchId: { type: Schema.Types.ObjectId, ref: "Batch", index: true },
    batchClassId: { type: Schema.Types.ObjectId, ref: "BatchClass", index: true },
    subjectModuleId: { type: Schema.Types.ObjectId, ref: "SubjectModule", index: true },
    subjectLessonId: { type: Schema.Types.ObjectId, ref: "SubjectLesson", index: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", index: true },
    chapterId: { type: Schema.Types.ObjectId, ref: "Chapter", index: true },
    lessonId: { type: Schema.Types.ObjectId, ref: "Lesson", index: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

PlatformQuestionSchema.index({ subject: 1, topic: 1, createdAt: -1 });
PlatformQuestionSchema.index({ ownerId: 1, isActive: 1 });

const PlatformQuestion =
  mongoose.models.PlatformQuestion ||
  mongoose.model<IPlatformQuestion>("PlatformQuestion", PlatformQuestionSchema);

export default PlatformQuestion;
