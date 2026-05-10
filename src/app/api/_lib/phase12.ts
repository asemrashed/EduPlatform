import mongoose from "mongoose";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { authOptions } from "@/lib/auth";

export type AppRole = "admin" | "instructor" | "student";

export type SessionUser = {
  id: string;
  role: AppRole;
};

export async function requireSessionUser(roles?: AppRole[]) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const role = session?.user?.role as AppRole | undefined;

  if (!userId || !role) {
    return {
      error: NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      ),
      user: null,
    };
  }

  if (roles && !roles.includes(role)) {
    return {
      error: NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 }),
      user: null,
    };
  }

  await connectDB();
  return { error: null, user: { id: userId, role } satisfies SessionUser };
}

export function isObjectId(value: unknown): value is string {
  return typeof value === "string" && mongoose.Types.ObjectId.isValid(value);
}

export function toObjectId(value: string) {
  return new mongoose.Types.ObjectId(value);
}

export function parsePage(searchParams: URLSearchParams, fallback = 1) {
  const page = Number.parseInt(searchParams.get("page") || "", 10);
  return Number.isFinite(page) && page > 0 ? page : fallback;
}

export function parseLimit(searchParams: URLSearchParams, fallback = 10, max = 200) {
  const limit = Number.parseInt(searchParams.get("limit") || "", 10);
  if (!Number.isFinite(limit) || limit <= 0) {
    return fallback;
  }
  return Math.min(limit, max);
}

export function pagination(page: number, limit: number, total: number) {
  const pages = total > 0 ? Math.ceil(total / limit) : 0;
  return {
    page,
    limit,
    total,
    pages,
    hasNext: page < pages,
    hasPrev: page > 1 && pages > 0,
  };
}

export function normalizeStudentName(student: {
  name?: string;
  firstName?: string;
  lastName?: string;
}) {
  const direct = String(student.name || "").trim();
  if (direct) return direct;
  return `${student.firstName || ""} ${student.lastName || ""}`.trim();
}
