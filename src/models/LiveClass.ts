import mongoose, { Document, Schema } from "mongoose";

export type LiveClassType = "live" | "recorded";

export interface ILiveClass extends Document {
  _id: mongoose.Types.ObjectId;
  batchId: mongoose.Types.ObjectId;
  title: string;
  scheduledAt: Date;
  durationMinutes: number;
  meetLink?: string;
  type: LiveClassType;
  recordingUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LiveClassSchema = new Schema<ILiveClass>(
  {
    batchId: {
      type: Schema.Types.ObjectId,
      ref: "Batch",
      required: [true, "Batch is required"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    scheduledAt: {
      type: Date,
      required: [true, "Scheduled time is required"],
      index: true,
    },
    durationMinutes: {
      type: Number,
      required: true,
      min: 1,
    },
    meetLink: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ["live", "recorded"],
      default: "live",
      required: true,
      index: true,
    },
    recordingUrl: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

LiveClassSchema.index({ batchId: 1, scheduledAt: 1 });
LiveClassSchema.index({ batchId: 1, isActive: 1, scheduledAt: 1 });

const LiveClass =
  mongoose.models.LiveClass ||
  mongoose.model<ILiveClass>("LiveClass", LiveClassSchema);

export default LiveClass;
