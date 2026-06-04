import mongoose, { Document, Schema } from "mongoose";

/** Instructor requests access to admin platform question bank; admin approves with optional expiry. */
export type QBAccessRequestStatus = "pending" | "approved" | "rejected";

export interface IQBAccessRequest extends Document {
  _id: mongoose.Types.ObjectId;
  requesterId: mongoose.Types.ObjectId;
  status: QBAccessRequestStatus;
  isPaid: boolean;
  amount?: number;
  grantedAt?: Date;
  expiresAt?: Date;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const QBAccessRequestSchema = new Schema<IQBAccessRequest>(
  {
    requesterId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    isPaid: { type: Boolean, default: false },
    amount: { type: Number, min: 0 },
    grantedAt: { type: Date },
    expiresAt: { type: Date, index: true },
    note: { type: String, trim: true },
  },
  { timestamps: true },
);

QBAccessRequestSchema.index({ requesterId: 1, status: 1 });

const QBAccessRequest =
  mongoose.models.QBAccessRequest ||
  mongoose.model<IQBAccessRequest>("QBAccessRequest", QBAccessRequestSchema);

export default QBAccessRequest;
