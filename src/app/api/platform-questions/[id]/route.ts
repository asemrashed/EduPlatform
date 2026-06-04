import { NextRequest, NextResponse } from "next/server";
import PlatformQuestion from "@/models/PlatformQuestion";
import { isObjectId, requireSessionUser } from "@/app/api/_lib/phase12";
import {
  canMutatePlatformQuestion,
  canViewPlatformQuestion,
  serializePlatformQuestion,
} from "@/app/api/_lib/platformQuestions";

interface RouteCtx {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, ctx: RouteCtx) {
  try {
    const auth = await requireSessionUser(["admin", "instructor"]);
    if (auth.error) return auth.error;
    const { id } = await ctx.params;
    if (!isObjectId(id)) {
      return NextResponse.json({ success: false, error: "Invalid question id" }, { status: 400 });
    }

    const { ok, doc, readOnly } = await canViewPlatformQuestion(auth.user, id);
    if (!ok || !doc) {
      return NextResponse.json({ success: false, error: "Question not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: { ...serializePlatformQuestion(doc), readOnly: Boolean(readOnly) },
    });
  } catch (error) {
    console.error("Platform question by id GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch platform question" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest, ctx: RouteCtx) {
  try {
    const auth = await requireSessionUser(["admin", "instructor"]);
    if (auth.error) return auth.error;
    const { id } = await ctx.params;
    if (!isObjectId(id)) {
      return NextResponse.json({ success: false, error: "Invalid question id" }, { status: 400 });
    }

    const { ok } = await canMutatePlatformQuestion(auth.user, id);
    if (!ok) {
      return NextResponse.json({ success: false, error: "Question not found" }, { status: 404 });
    }

    const q = await PlatformQuestion.findById(id);
    if (!q) {
      return NextResponse.json({ success: false, error: "Question not found" }, { status: 404 });
    }

    const body = (await request.json()) as Record<string, unknown>;
    const keys = [
      "subject",
      "topic",
      "subtopic",
      "difficulty",
      "questionText",
      "options",
      "answerText",
      "explanation",
      "hasDiagram",
      "diagramUrl",
      "tags",
      "isActive",
    ] as const;

    for (const key of keys) {
      if (key in body) (q as Record<string, unknown>)[key] = body[key];
    }

    if (auth.user.role === "admin" && "accessPolicy" in body) {
      const policy = String(body.accessPolicy);
      if (["private", "shared_with_instructors", "public"].includes(policy)) {
        q.accessPolicy = policy as typeof q.accessPolicy;
      }
    }

    if ("tagVerified" in body && auth.user.role === "admin") {
      q.tagVerified = Boolean(body.tagVerified);
    }

    await q.save();
    return NextResponse.json({
      success: true,
      data: serializePlatformQuestion(q.toObject() as Record<string, unknown>),
    });
  } catch (error) {
    console.error("Platform question by id PUT error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update platform question" },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: NextRequest, ctx: RouteCtx) {
  try {
    const auth = await requireSessionUser(["admin", "instructor"]);
    if (auth.error) return auth.error;
    const { id } = await ctx.params;
    if (!isObjectId(id)) {
      return NextResponse.json({ success: false, error: "Invalid question id" }, { status: 400 });
    }

    const { ok } = await canMutatePlatformQuestion(auth.user, id);
    if (!ok) {
      return NextResponse.json({ success: false, error: "Question not found" }, { status: 404 });
    }

    await PlatformQuestion.deleteOne({ _id: id });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Platform question by id DELETE error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete platform question" },
      { status: 500 },
    );
  }
}
