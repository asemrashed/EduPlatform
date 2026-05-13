import { NextResponse } from "next/server";
import { requireSessionUser } from "@/app/api/_lib/phase12";
import {
  getSettingsRecord,
  setSettingsRecord,
  deleteSettingsDoc,
  instructorSettingsCategory,
} from "@/app/api/_lib/roleSettings";

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

export async function GET() {
  const auth = await requireSessionUser(["instructor"]);
  if (auth.error) return auth.error;

  try {
    const category = instructorSettingsCategory(auth.user!.id);
    const stored = await getSettingsRecord(category);
    const instructor = isPlainObject(stored.instructor) ? stored.instructor : {};
    const hasSavedFields = Object.keys(instructor).length > 0;
    if (!hasSavedFields) {
      return NextResponse.json({ success: true, data: {} });
    }
    return NextResponse.json({
      success: true,
      data: { instructor },
    });
  } catch (e) {
    console.error("[instructor/settings] GET", e);
    return NextResponse.json(
      { success: false, error: "Failed to load settings" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  const auth = await requireSessionUser(["instructor"]);
  if (auth.error) return auth.error;

  try {
    const body = (await req.json()) as { category?: string; settings?: unknown };
    if (body.category !== "instructor") {
      return NextResponse.json(
        { success: false, error: "Invalid or missing category" },
        { status: 400 },
      );
    }
    if (!isPlainObject(body.settings)) {
      return NextResponse.json(
        { success: false, error: "settings must be an object" },
        { status: 400 },
      );
    }

    const category = instructorSettingsCategory(auth.user!.id);
    const current = await getSettingsRecord(category);
    const prev = isPlainObject(current.instructor)
      ? (current.instructor as Record<string, unknown>)
      : {};
    const mergedInstructor = { ...prev, ...body.settings };
    await setSettingsRecord(category, { ...current, instructor: mergedInstructor });

    return NextResponse.json({ success: true, data: { instructor: mergedInstructor } });
  } catch (e) {
    console.error("[instructor/settings] POST", e);
    return NextResponse.json(
      { success: false, error: "Failed to update settings" },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request) {
  const auth = await requireSessionUser(["instructor"]);
  if (auth.error) return auth.error;

  try {
    const body = (await req.json()) as { settings?: unknown };
    if (!isPlainObject(body.settings)) {
      return NextResponse.json(
        { success: false, error: "settings must be an object" },
        { status: 400 },
      );
    }

    const incoming = body.settings as Record<string, unknown>;
    const instructor = isPlainObject(incoming.instructor)
      ? { ...incoming.instructor }
      : {};

    const category = instructorSettingsCategory(auth.user!.id);
    await setSettingsRecord(category, { instructor });

    return NextResponse.json({
      success: true,
      data: { instructor },
    });
  } catch (e) {
    console.error("[instructor/settings] PUT", e);
    return NextResponse.json(
      { success: false, error: "Failed to save settings" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  const auth = await requireSessionUser(["instructor"]);
  if (auth.error) return auth.error;

  try {
    const url = new URL(req.url);
    const categoryParam = url.searchParams.get("category");
    const category = instructorSettingsCategory(auth.user!.id);

    if (categoryParam === "instructor") {
      const current = await getSettingsRecord(category);
      const next = { ...current, instructor: {} };
      await setSettingsRecord(category, next);
    } else if (!categoryParam) {
      await deleteSettingsDoc(category);
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid category" },
        { status: 400 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[instructor/settings] DELETE", e);
    return NextResponse.json(
      { success: false, error: "Failed to reset settings" },
      { status: 500 },
    );
  }
}
