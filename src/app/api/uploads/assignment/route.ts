import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { requireSessionUser } from "@/app/api/_lib/phase12";

const MAX_SIZE = 20 * 1024 * 1024;
const BASE_DIR = path.join(process.cwd(), "public", "uploads", "assignments");

export async function POST(request: NextRequest) {
  try {
    const auth = await requireSessionUser(["student", "instructor", "admin"]);
    if (auth.error) return auth.error;

    const form = await request.formData();
    const filesInput = form.getAll("files");
    const files = filesInput.filter((x): x is File => x instanceof File);
    if (files.length === 0) {
      return NextResponse.json({ success: false, error: "No files provided" }, { status: 400 });
    }

    await mkdir(BASE_DIR, { recursive: true });

    const saved = [];
    for (const file of files) {
      if (file.size > MAX_SIZE) {
        return NextResponse.json({ success: false, error: `${file.name} exceeds max 20MB` }, { status: 400 });
      }
      const ext = path.extname(file.name) || "";
      const cleanName = `${Date.now()}-${randomUUID()}${ext}`;
      const fullPath = path.join(BASE_DIR, cleanName);
      const bytes = Buffer.from(await file.arrayBuffer());
      await writeFile(fullPath, bytes);
      saved.push({
        name: file.name,
        url: `/uploads/assignments/${cleanName}`,
        type: file.type || "application/octet-stream",
        size: file.size,
      });
    }

    return NextResponse.json({ success: true, files: saved });
  } catch (error) {
    console.error("Assignment uploads POST error:", error);
    return NextResponse.json({ success: false, error: "Failed to upload files" }, { status: 500 });
  }
}
