import { NextRequest, NextResponse } from "next/server";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { mkdir, stat, unlink, writeFile } from "node:fs/promises";
import { requireSessionUser } from "@/app/api/_lib/phase12";

const BASE_DIR = path.join(process.cwd(), "public", "uploads", "pdf");
const MAX_SIZE = 10 * 1024 * 1024;

function buildPath(publicId: string) {
  return path.join(BASE_DIR, `${publicId}.pdf`);
}

function buildUrl(publicId: string) {
  return `/uploads/pdf/${publicId}.pdf`;
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireSessionUser(["admin", "instructor", "student"]);
    if (auth.error) return auth.error;

    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, error: "file is required" }, { status: 400 });
    }
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json({ success: false, error: "Only PDF files are allowed" }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ success: false, error: "File size too large. Maximum size is 10MB" }, { status: 400 });
    }

    await mkdir(BASE_DIR, { recursive: true });
    const publicId = `${Date.now()}-${randomUUID()}`;
    const fullPath = buildPath(publicId);
    await writeFile(fullPath, Buffer.from(await file.arrayBuffer()));

    const url = buildUrl(publicId);
    return NextResponse.json({
      success: true,
      pdf: {
        publicId,
        url,
        secureUrl: url,
        fileName: file.name,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        uploadedBy: auth.user.id,
        folder: String(formData.get("folder") || "lms/documents"),
        description: String(formData.get("description") || ""),
      },
    });
  } catch (error) {
    console.error("Upload PDF POST error:", error);
    return NextResponse.json({ success: false, error: "Failed to upload PDF" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireSessionUser(["admin", "instructor", "student"]);
    if (auth.error) return auth.error;
    const publicId = request.nextUrl.searchParams.get("publicId") || "";
    if (!publicId) {
      return NextResponse.json({ success: false, error: "publicId is required" }, { status: 400 });
    }
    const filePath = buildPath(publicId);
    const info = await stat(filePath);
    const url = buildUrl(publicId);
    return NextResponse.json({
      success: true,
      pdf: {
        publicId,
        url,
        secureUrl: url,
        fileName: `${publicId}.pdf`,
        size: info.size,
        uploadedAt: info.mtime.toISOString(),
        uploadedBy: auth.user.id,
        folder: "lms/documents",
        description: "",
      },
    });
  } catch {
    return NextResponse.json({ success: false, error: "PDF not found" }, { status: 404 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireSessionUser(["admin", "instructor", "student"]);
    if (auth.error) return auth.error;
    const publicId = request.nextUrl.searchParams.get("publicId") || "";
    if (!publicId) {
      return NextResponse.json({ success: false, error: "publicId is required" }, { status: 400 });
    }
    await unlink(buildPath(publicId));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: "PDF not found" }, { status: 404 });
  }
}
