import mongoose, { Document, Schema } from "mongoose";

export interface ICourse extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  shortDescription?: string;
  description?: string;
  category?: string;
  thumbnailUrl?: string;
  isPaid: boolean;
  status: "draft" | "published" | "archived";
  isHidden?: boolean;
  price?: number;
  salePrice?: number;
  displayOrder?: number;
  createdBy?: mongoose.Types.ObjectId;
  duration?: number;
  difficulty?: "beginner" | "intermediate" | "advanced";
  lessonCount?: number;
  enrollmentCount?: number;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema = new Schema<ICourse>(
  {
    title: {
      type: String,
      required: [true, "Course title is required"],
      trim: true,
    },
    shortDescription: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
    },
    thumbnailUrl: {
      type: String,
      trim: true,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
      index: true,
    },
    isHidden: {
      type: Boolean,
      default: false,
      index: true,
    },
    price: {
      type: Number,
      min: 0,
    },
    salePrice: {
      type: Number,
      min: 0,
    },
    displayOrder: {
      type: Number,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    duration: {
      type: Number,
      min: 0,
    },
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
    },
    lessonCount: {
      type: Number,
      min: 0,
      default: 0,
    },
    enrollmentCount: {
      type: Number,
      min: 0,
      default: 0,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true },
);

CourseSchema.index({ title: "text", description: "text" });
CourseSchema.index({ category: 1 });
CourseSchema.index({ isPaid: 1 });
CourseSchema.index({ createdAt: -1 });

const Course =
  mongoose.models.Course || mongoose.model<ICourse>("Course", CourseSchema);

export default Course;
