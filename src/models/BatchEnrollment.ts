import mongoose, { Document, Schema } from "mongoose";

export type BatchEnrollmentStatus =
  | "pending"
  | "active"
  | "suspended"
  | "dropped";

export type BatchEnrollmentPaymentStatus =
  | "pending"
  | "paid"
  | "refunded"
  | "failed";

export interface IBatchEnrollment extends Document {
  _id: mongoose.Types.ObjectId;
  batchId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  status: BatchEnrollmentStatus;
  paymentStatus: BatchEnrollmentPaymentStatus;
  paymentId?: string;
  paymentAmount?: number;
  enrolledAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BatchEnrollmentSchema = new Schema<IBatchEnrollment>(
  {
    batchId: {
      type: Schema.Types.ObjectId,
      ref: "Batch",
      required: [true, "Batch is required"],
      index: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student is required"],
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "active", "suspended", "dropped"],
      default: "pending",
      required: true,
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "refunded", "failed"],
      default: "pending",
      required: true,
      index: true,
    },
    paymentId: {
      type: String,
      trim: true,
      index: true,
    },
    paymentAmount: {
      type: Number,
      min: 0,
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

BatchEnrollmentSchema.index({ batchId: 1, studentId: 1 }, { unique: true });
BatchEnrollmentSchema.index({ batchId: 1, status: 1 });
BatchEnrollmentSchema.index({ studentId: 1, status: 1 });
BatchEnrollmentSchema.index({ enrolledAt: -1 });

const BatchEnrollment =
  mongoose.models.BatchEnrollment ||
  mongoose.model<IBatchEnrollment>("BatchEnrollment", BatchEnrollmentSchema);

export default BatchEnrollment;
