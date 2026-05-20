import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth/next";
import connectDB from "@/lib/mongodb";
import { authOptions } from "@/lib/auth";
import User from "@/models/User";
import { isValidBdPhone, toBdLocalPhone } from "@/lib/phone";

function toPositiveInt(value: string | null, fallback: number): number {
  const parsed = Number.parseInt(value || "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

async function requireAdminJson() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    );
  }
  if (session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

function mapTeacher(user: Record<string, unknown>) {
  return {
    _id: String(user._id),
    email: String(user.email || ""),
    phone: user.phone,
    firstName: String(user.firstName || ""),
    lastName: String(user.lastName || ""),
    role: "instructor" as const,
    isActive: user.isActive !== false,
    avatar: user.avatar ? String(user.avatar) : undefined,
    experience: user.experience ? String(user.experience) : undefined,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    lastLogin: user.lastLogin,
    fullName: user.name ? String(user.name) : undefined,
  };
}

export async function GET(request: NextRequest) {
  try {
    const authError = await requireAdminJson();
    if (authError) return authError;

    await connectDB();
    const { searchParams } = new URL(request.url);
    const page = toPositiveInt(searchParams.get("page"), 1);
    const limit = Math.min(toPositiveInt(searchParams.get("limit"), 10), 500);
    const search = String(searchParams.get("search") || "").trim();

    const filter: Record<string, unknown> = { role: "instructor" };
    if (search) {
      const orClause: Record<string, unknown>[] = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
      if (mongoose.Types.ObjectId.isValid(search)) {
        orClause.push({ _id: new mongoose.Types.ObjectId(search) });
      }
      filter.$or = orClause;
    }

    const skip = (page - 1) * limit;
    const [rows, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments(filter),
    ]);

    const teachers = rows.map((u) => mapTeacher(u as Record<string, unknown>));
    const pages = total > 0 ? Math.ceil(total / limit) : 0;

    return NextResponse.json({
      teachers,
      pagination: {
        page,
        limit,
        total,
        pages,
      },
    });
  } catch (error) {
    console.error("Teachers list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch teachers" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authError = await requireAdminJson();
    if (authError) return authError;

    await connectDB();
    const body = (await request.json()) as Record<string, unknown>;
    const firstName = String(body.firstName || "").trim();
    const lastName = String(body.lastName || "").trim();
    const phoneClean = toBdLocalPhone(String(body.phone || ""));

    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: "First and last name are required" },
        { status: 400 },
      );
    }
    if (!isValidBdPhone(phoneClean)) {
      return NextResponse.json(
        { error: "Phone number must start with 0 and be like 01XXXXXXXXX" },
        { status: 400 },
      );
    }

    const password = String(body.password || "");
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 },
      );
    }

    const existing = await User.findOne({ phone: phoneClean }).select("_id").lean();
    if (existing) {
      return NextResponse.json(
        { error: "User already exists with this phone number" },
        { status: 409 },
      );
    }

    const name = `${firstName} ${lastName}`.trim();
    const hashedPassword = await bcrypt.hash(password, 12);
    const isActive = body.isActive !== false;

    const user = await User.create({
      name,
      firstName,
      lastName,
      phone: phoneClean,
      password: hashedPassword,
      role: "instructor",
      isActive,
      avatar:
        typeof body.avatar === "string" && body.avatar.trim()
          ? body.avatar.trim()
          : undefined,
      experience:
        typeof body.experience === "string" && body.experience.trim()
          ? body.experience.trim()
          : undefined,
    });

    return NextResponse.json(mapTeacher(user.toObject()), { status: 201 });
  } catch (error) {
    console.error("Teacher create error:", error);
    return NextResponse.json(
      { error: "Failed to create teacher" },
      { status: 500 },
    );
  }
}
