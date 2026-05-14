import mongoose, { Document, Schema } from "mongoose";

const SocialLinksSchema = new Schema(
  {
    linkedin: { type: String, trim: true },
    twitter: { type: String, trim: true },
    website: { type: String, trim: true },
  },
  { _id: false },
);

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  password: string;
  role: "admin" | "instructor" | "student";
  isActive: boolean;
  /** When true, student cannot create new course reviews */
  isBlockedFromReviews?: boolean;
  avatar?: string;
  bio?: string;
  address?: string;
  parentPhone?: string;
  education?: string;
  specialization?: string;
  experience?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      sparse: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone is required"],
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    role: {
      type: String,
      enum: ["admin", "instructor", "student"],
      default: "student",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isBlockedFromReviews: {
      type: Boolean,
      default: false,
    },
    avatar: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    parentPhone: {
      type: String,
      trim: true,
    },
    education: {
      type: String,
      trim: true,
    },
    specialization: {
      type: String,
      trim: true,
    },
    experience: {
      type: String,
      trim: true,
    },
    socialLinks: {
      type: SocialLinksSchema,
      default: undefined,
    },
    lastLogin: {
      type: Date,
    },
  },
  { timestamps: true },
);

UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1 });

UserSchema.methods.toJSON = function toJSON() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
