import mongoose, { Document, Schema } from "mongoose";

export type SubjectLessonType = "live" | "recorded";

export interface ISubjectLesson extends Document {
  _id: mongoose.Types.ObjectId;
  batchId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  moduleId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  order: number;
  type: SubjectLessonType;
  scheduledAt?: Date;
  durationMinutes?: number;
  meetLink?: string;
  recordingUrl?: string;
  videoUrl?: string;
  youtubeVideoId?: string;
  liveClassId?: mongoose.Types.ObjectId;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SubjectLessonSchema = new Schema<ISubjectLesson>(
  {
    batchId: {
      type: Schema.Types.ObjectId,
      ref: "Batch",
      required: true,
      index: true,
    },
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: "BatchClass",
      required: true,
      index: true,
    },
    moduleId: {
      type: Schema.Types.ObjectId,
      ref: "SubjectModule",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Lesson title is required"],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    order: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    type: {
      type: String,
      enum: ["live", "recorded"],
      required: true,
      default: "recorded",
      index: true,
    },
    scheduledAt: { type: Date, index: true },
    durationMinutes: { type: Number, min: 1 },
    meetLink: { type: String, trim: true },
    recordingUrl: { type: String, trim: true },
    videoUrl: { type: String, trim: true },
    youtubeVideoId: { type: String, trim: true },
    liveClassId: { type: Schema.Types.ObjectId, ref: "LiveClass" },
    isPublished: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true },
);

SubjectLessonSchema.index({ moduleId: 1, order: 1 });
SubjectLessonSchema.index({ subjectId: 1, order: 1 });

const SubjectLesson =
  mongoose.models.SubjectLesson ||
  mongoose.model<ISubjectLesson>("SubjectLesson", SubjectLessonSchema);

export default SubjectLesson;
