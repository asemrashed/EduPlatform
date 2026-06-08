import mongoose, { Document, Schema } from "mongoose";

export type PaymentEntityType = "course" | "batch" | "qb_access";

export interface IPayment extends Document {
  user: mongoose.Types.ObjectId;
  entityType: PaymentEntityType;
  course?: mongoose.Types.ObjectId;
  enrollment?: mongoose.Types.ObjectId;
  batchId?: mongoose.Types.ObjectId;
  batchEnrollment?: mongoose.Types.ObjectId;
  qbAccessRequest?: mongoose.Types.ObjectId;
  amount: number;
  transactionId: string;
  gateway: "sslcommerz";
  gatewayOrderId: string;
  status: "pending" | "success" | "failed";
  gatewayResponse?: unknown;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    entityType: {
      type: String,
      enum: ["course", "batch", "qb_access"],
      default: "course",
      required: true,
      index: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
    },
    enrollment: {
      type: Schema.Types.ObjectId,
      ref: "Enrollment",
    },
    batchId: {
      type: Schema.Types.ObjectId,
      ref: "Batch",
    },
    batchEnrollment: {
      type: Schema.Types.ObjectId,
      ref: "BatchEnrollment",
    },
    qbAccessRequest: {
      type: Schema.Types.ObjectId,
      ref: "QBAccessRequest",
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    gateway: {
      type: String,
      enum: ["sslcommerz"],
      default: "sslcommerz",
      required: true,
    },
    gatewayOrderId: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
      required: true,
    },
    gatewayResponse: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  },
);

PaymentSchema.index({ transactionId: 1 }, { unique: true });
PaymentSchema.index({ entityType: 1, batchId: 1, status: 1 });
PaymentSchema.index({ user: 1, entityType: 1, status: 1, createdAt: -1 });

const Payment =
  mongoose.models.Payment || mongoose.model<IPayment>("Payment", PaymentSchema);

export default Payment;
