import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getServerSession } from "next-auth/next";
import connectDB from "@/lib/mongodb";
import { authOptions } from "@/lib/auth";
import Settings from "@/models/Settings";
import { saveWebsiteContentSettings } from "@/app/api/_lib/websiteContentStore";
import {
  CACHE_TAG_WEBSITE_CONTENT,
  defaultWebsiteContent,
  WEBSITE_CONTENT_CATEGORY,
} from "@/lib/websiteContentDefaults";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "admin") {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  try {
    await connectDB();
    const existing = await Settings.findOne({ category: WEBSITE_CONTENT_CATEGORY }).lean();
    if (existing) {
      return NextResponse.json({ success: true, seeded: false });
    }

    await saveWebsiteContentSettings(
      { ...defaultWebsiteContent },
      session.user.id,
    );

    revalidateTag(CACHE_TAG_WEBSITE_CONTENT);

    return NextResponse.json({ success: true, seeded: true });
  } catch (error) {
    console.error("[admin/website-content/seed] POST", error);
    return NextResponse.json(
      { success: false, error: "Failed to seed website content" },
      { status: 500 },
    );
  }
}
