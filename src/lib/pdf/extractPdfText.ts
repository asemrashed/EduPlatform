import path from "node:path";
import { readFile } from "node:fs/promises";
import { PDFParse } from "pdf-parse";

const BASE_DIR = path.join(process.cwd(), "public", "uploads", "pdf");

/** Safe publicId from `/api/upload/pdf` (no path traversal). */
export function sanitizePdfPublicId(publicId: string) {
  const trimmed = publicId.trim();
  if (!trimmed || !/^[a-zA-Z0-9._-]+$/.test(trimmed)) {
    return null;
  }
  return trimmed;
}

export function pdfPublicUrl(publicId: string) {
  return `/uploads/pdf/${publicId}.pdf`;
}

export async function extractTextFromUploadedPdf(publicId: string): Promise<{
  text: string;
  publicId: string;
  url: string;
}> {
  const safeId = sanitizePdfPublicId(publicId);
  if (!safeId) {
    throw new Error("INVALID_PDF_PUBLIC_ID");
  }

  const filePath = path.join(BASE_DIR, `${safeId}.pdf`);
  let buffer: Buffer;
  try {
    buffer = await readFile(filePath);
  } catch {
    throw new Error("PDF_NOT_FOUND");
  }

  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  try {
    const result = await parser.getText();
    const text = String(result.text || "")
      .replace(/\s+\n/g, "\n")
      .trim();

    if (text.length < 50) {
      throw new Error("PDF_TEXT_TOO_SHORT");
    }

    return { text, publicId: safeId, url: pdfPublicUrl(safeId) };
  } finally {
    await parser.destroy();
  }
}
