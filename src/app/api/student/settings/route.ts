import { NextResponse } from "next/server";
import { requireSessionUser } from "@/app/api/_lib/phase12";
import {
  getSettingsRecord,
  setSettingsRecord,
  studentSettingsCategory,
} from "@/app/api/_lib/roleSettings";

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/**
 * Student settings hook expects GET `{ student: { ... } }` (no `success` wrapper).
 * PUT accepts `{ settings: partial | full }` and merges into the scoped document.
 */
export async function GET() {
  const auth = await requireSessionUser(["student"]);
  if (auth.error) return auth.error;

  try {
    const category = studentSettingsCategory(auth.user!.id);
    const stored = await getSettingsRecord(category);
    if (Object.keys(stored).length === 0) {
      return NextResponse.json({});
    }
    return NextResponse.json({ student: stored });
  } catch (e) {
    console.error("[student/settings] GET", e);
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const auth = await requireSessionUser(["student"]);
  if (auth.error) return auth.error;

  try {
    const body = (await req.json()) as { settings?: unknown };
    if (!isPlainObject(body.settings)) {
      return NextResponse.json({ error: "settings must be an object" }, { status: 400 });
    }

    const category = studentSettingsCategory(auth.user!.id);
    const current = await getSettingsRecord(category);
    const merged = { ...current, ...body.settings };
    await setSettingsRecord(category, merged);

    return NextResponse.json({ success: true, student: merged });
  } catch (e) {
    console.error("[student/settings] PUT", e);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
