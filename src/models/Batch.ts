import mongoose, { Document, Schema } from "mongoose";

export interface IBatchScheduleSlot {
  /** 0 = Sunday … 6 = Saturday */
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  startTime: string;
  endTime: string;
  title?: string;
}

export interface IBatch extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  subject: string;
  instructorId: mongoose.Types.ObjectId;
  schedule: IBatchScheduleSlot[];
  startDate: Date;
  endDate: Date;
  maxStudents: number;
  fee: number;
  isActive: boolean;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BatchScheduleSlotSchema = new Schema<IBatchScheduleSlot>(
  {
    dayOfWeek: {
      type: Number,
      required: true,
      min: 0,
      max: 6,
    },
    startTime: {
      type: String,
      required: true,
      trim: true,
    },
    endTime: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      trim: true,
    },
  },
  { _id: false },
);

const BatchSchema = new Schema<IBatch>(
  {
    name: {
      type: String,
      required: [true, "Batch name is required"],
      trim: true,
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
      index: true,
    },
    instructorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Instructor is required"],
      index: true,
    },
    schedule: {
      type: [BatchScheduleSlotSchema],
      default: [],
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
      index: true,
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },
    maxStudents: {
      type: Number,
      required: true,
      min: 1,
    },
    fee: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

BatchSchema.index({ isActive: 1, startDate: 1 });
BatchSchema.index({ instructorId: 1, isActive: 1 });

const Batch =
  mongoose.models.Batch || mongoose.model<IBatch>("Batch", BatchSchema);

export default Batch;
