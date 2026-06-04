import mongoose, { Document, Schema } from "mongoose";

export interface IBatchClass extends Document {
  _id: mongoose.Types.ObjectId;
  batchId: mongoose.Types.ObjectId;
  title: string;
  categoryId: mongoose.Types.ObjectId;
  instructorId: mongoose.Types.ObjectId;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const BatchClassSchema = new Schema<IBatchClass>(
  {
    batchId: {
      type: Schema.Types.ObjectId,
      ref: "Batch",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Class title is required"],
      trim: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
      index: true,
    },
    instructorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Instructor is required"],
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

BatchClassSchema.index({ batchId: 1, sortOrder: 1 });
BatchClassSchema.index({ batchId: 1, isActive: 1 });

const BatchClass =
  mongoose.models.BatchClass ||
  mongoose.model<IBatchClass>("BatchClass", BatchClassSchema);

export default BatchClass;
