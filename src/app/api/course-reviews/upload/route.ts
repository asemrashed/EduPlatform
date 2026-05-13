import { NextResponse } from "next/server";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { requireSessionUser } from "@/app/api/_lib/phase12";

const BASE_DIR = path.join(process.cwd(), "public", "uploads", "review-videos");
const MAX_SIZE = 100 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const auth = await requireSessionUser(["admin", "instructor", "student"]);
    if (auth.error) return auth.error;

    const formData = await request.formData();
    const file = formData.get("video");
    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, error: "video file is required" }, { status: 400 });
    }
    if (!file.type.startsWith("video/")) {
      return NextResponse.json({ success: false, error: "Only video files are allowed" }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: "File size too large. Maximum size is 100MB" },
        { status: 400 },
      );
    }

    await mkdir(BASE_DIR, { recursive: true });
    const ext = path.extname(file.name) || ".mp4";
    const publicId = `${Date.now()}-${randomUUID()}${ext}`;
    const fullPath = path.join(BASE_DIR, publicId);
    await writeFile(fullPath, Buffer.from(await file.arrayBuffer()));

    const videoUrl = `/uploads/review-videos/${publicId}`;
    return NextResponse.json({
      success: true,
      data: {
        videoUrl,
        videoThumbnail: "",
      },
    });
  } catch (error) {
    console.error("course-reviews upload error:", error);
    return NextResponse.json({ success: false, error: "Failed to upload video" }, { status: 500 });
  }
}
