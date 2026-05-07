import mongoose, { Document, Schema } from "mongoose";

export interface ISettings extends Document {
  _id: mongoose.Types.ObjectId;
  category: string;
  settings: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>(
  {
    category: {
      type: String,
      required: [true, "Settings category is required"],
      trim: true,
      index: true,
      unique: true,
    },
    settings: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true },
);

const Settings =
  mongoose.models.Settings || mongoose.model<ISettings>("Settings", SettingsSchema);

export default Settings;
