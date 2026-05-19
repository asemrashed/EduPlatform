import { NextRequest, NextResponse } from "next/server";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { requireSessionUser } from "@/app/api/_lib/phase12";

const BASE_DIR = path.join(process.cwd(), "public", "uploads", "cms");
const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
]);

function extensionFor(type: string) {
  if (type === "image/png") return ".png";
  if (type === "image/gif") return ".gif";
  if (type === "image/webp") return ".webp";
  return ".jpg";
}

/** Admin CMS section images (e.g. partner logos). */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireSessionUser(["admin"]);
    if (auth.error) return auth.error;

    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: "file is required" },
        { status: 400 },
      );
    }
    if (!ALLOWED.has(file.type)) {
      return NextResponse.json(
        { success: false, error: "Invalid image type" },
        { status: 400 },
      );
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: "File too large. Maximum size is 5MB." },
        { status: 400 },
      );
    }

    await mkdir(BASE_DIR, { recursive: true });
    const publicId = `${Date.now()}-${randomUUID()}`;
    const ext = extensionFor(file.type);
    const fileName = `${publicId}${ext}`;
    await writeFile(
      path.join(BASE_DIR, fileName),
      Buffer.from(await file.arrayBuffer()),
    );

    const imageUrl = `/uploads/cms/${fileName}`;
    return NextResponse.json({
      success: true,
      imageUrl,
      publicId,
      message: "Image uploaded successfully",
    });
  } catch (error) {
    console.error("Upload cms-image POST error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload image" },
      { status: 500 },
    );
  }
}
