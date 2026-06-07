import path from "node:path";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";

const BASE_DIR = path.join(process.cwd(), "public", "uploads", "pdf");

function buildPath(publicId: string) {
  return path.join(BASE_DIR, `${publicId}.pdf`);
}

export function pdfPublicUrl(publicId: string) {
  return `/uploads/pdf/${publicId}.pdf`;
}

export async function persistPdfBuffer(buffer: Buffer) {
  await mkdir(BASE_DIR, { recursive: true });
  const publicId = `${Date.now()}-${randomUUID()}`;
  await writeFile(buildPath(publicId), buffer);
  return { publicId, url: pdfPublicUrl(publicId) };
}
