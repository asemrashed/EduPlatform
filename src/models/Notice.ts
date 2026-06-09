import mongoose, { Schema, type Document } from "mongoose";

export type NoticeCategory = "admin" | "subject" | "teacher";

export interface INotice extends Document {
  title: string;
  body: string;
  category: NoticeCategory;
  /** Subject label when category is `subject`. */
  subject?: string;
  /** Instructor the notice is attributed to when category is `teacher`. */
  instructorId?: mongoose.Types.ObjectId;
  /** Optional batch scope — limits visibility to that batch's enrollees. */
  batchId?: mongoose.Types.ObjectId;
  postedBy: mongoose.Types.ObjectId;
  authorRole: "admin" | "instructor";
  isActive: boolean;
  isPinned: boolean;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NoticeSchema = new Schema<INotice>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    body: {
      type: String,
      required: [true, "Body is required"],
      trim: true,
      maxlength: [10000, "Body cannot exceed 10000 characters"],
    },
    category: {
      type: String,
      enum: ["admin", "subject", "teacher"],
      required: [true, "Category is required"],
      index: true,
    },
    subject: {
      type: String,
      trim: true,
      maxlength: [120, "Subject cannot exceed 120 characters"],
      index: true,
    },
    instructorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    batchId: {
      type: Schema.Types.ObjectId,
      ref: "Batch",
      index: true,
    },
    postedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    authorRole: {
      type: String,
      enum: ["admin", "instructor"],
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isPinned: {
      type: Boolean,
      default: false,
      index: true,
    },
    expiresAt: {
      type: Date,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "notices",
  },
);

NoticeSchema.index({ category: 1, isActive: 1, createdAt: -1 });
NoticeSchema.index({ isPinned: -1, createdAt: -1 });
NoticeSchema.index({
  title: "text",
  body: "text",
  subject: "text",
});

const Notice =
  mongoose.models.Notice || mongoose.model<INotice>("Notice", NoticeSchema);

export default Notice;
