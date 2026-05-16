import connectDB from "@/lib/mongodb";
import Settings from "@/models/Settings";
import {
  WEBSITE_CONTENT_CATEGORY,
  defaultWebsiteContent,
} from "@/lib/websiteContentDefaults";

export async function loadWebsiteContentSettings(): Promise<Record<string, unknown>> {
  await connectDB();
  const doc = await Settings.findOne({ category: WEBSITE_CONTENT_CATEGORY }).lean();
  const raw = doc?.settings;
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    return { ...(raw as Record<string, unknown>) };
  }
  return { ...defaultWebsiteContent };
}

export async function saveWebsiteContentSettings(
  settings: Record<string, unknown>,
  updatedBy?: string,
) {
  await connectDB();
  const update: Record<string, unknown> = {
    category: WEBSITE_CONTENT_CATEGORY,
    settings,
  };
  if (updatedBy) {
    update.updatedBy = updatedBy;
  }
  const result = await Settings.findOneAndUpdate(
    { category: WEBSITE_CONTENT_CATEGORY },
    { $set: update },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  return result?.settings && typeof result.settings === "object" && !Array.isArray(result.settings)
    ? (result.settings as Record<string, unknown>)
    : settings;
}
