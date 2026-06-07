import mongoose, { Document, Schema } from "mongoose";

export interface ISubjectModule extends Document {
  _id: mongoose.Types.ObjectId;
  batchId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  order: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SubjectModuleSchema = new Schema<ISubjectModule>(
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
    title: {
      type: String,
      required: [true, "Module title is required"],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    order: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    isPublished: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true },
);

SubjectModuleSchema.index({ subjectId: 1, order: 1 });
SubjectModuleSchema.index({ batchId: 1, subjectId: 1 });

const SubjectModule =
  mongoose.models.SubjectModule ||
  mongoose.model<ISubjectModule>("SubjectModule", SubjectModuleSchema);

export default SubjectModule;
