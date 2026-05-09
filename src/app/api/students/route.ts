import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth/next";
import connectDB from "@/lib/mongodb";
import { authOptions } from "@/lib/auth";
import User from "@/models/User";
import Enrollment from "@/models/Enrollment";

function toPositiveInt(value: string | null, fallback: number): number {
  const parsed = Number.parseInt(value || "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function cleanPhone(phone: string): string {
  return String(phone).replace(/[\s\-\(\)]/g, "");
}

function isValidBdPhone(phone: string): boolean {
  return /^01\d{9}$/.test(cleanPhone(phone));
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

function mapStudent(
  user: Record<string, unknown>,
  extras?: { enrollmentCount?: number; totalEnrolledAmount?: number },
) {
  return {
    _id: String(user._id),
    email: String(user.email || ""),
    phone: user.phone,
    firstName: String(user.firstName || ""),
    lastName: String(user.lastName || ""),
    role: "student" as const,
    isActive: user.isActive !== false,
    avatar: user.avatar ? String(user.avatar) : undefined,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    lastLogin: user.lastLogin,
    fullName: user.name ? String(user.name) : undefined,
    enrollmentCount: extras?.enrollmentCount ?? 0,
    totalEnrolledAmount: extras?.totalEnrolledAmount ?? 0,
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

    const filter: Record<string, unknown> = { role: "student" };
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

    const ids = rows.map((r) => r._id as mongoose.Types.ObjectId);
    const statMap = new Map<
      string,
      { enrollmentCount: number; totalEnrolledAmount: number }
    >();

    if (ids.length > 0) {
      const agg = await Enrollment.aggregate<{
        _id: mongoose.Types.ObjectId;
        enrollmentCount: number;
        totalEnrolledAmount: number;
      }>([
        { $match: { student: { $in: ids } } },
        {
          $group: {
            _id: "$student",
            enrollmentCount: { $sum: 1 },
            totalEnrolledAmount: { $sum: { $ifNull: ["$paymentAmount", 0] } },
          },
        },
      ]);
      for (const row of agg) {
        statMap.set(String(row._id), {
          enrollmentCount: row.enrollmentCount,
          totalEnrolledAmount: row.totalEnrolledAmount,
        });
      }
    }

    const students = rows.map((u) => {
      const s = statMap.get(String(u._id));
      return mapStudent(u as Record<string, unknown>, {
        enrollmentCount: s?.enrollmentCount,
        totalEnrolledAmount: s?.totalEnrolledAmount,
      });
    });

    const pages = total > 0 ? Math.ceil(total / limit) : 0;

    return NextResponse.json({
      students,
      pagination: {
        page,
        limit,
        total,
        pages,
      },
    });
  } catch (error) {
    console.error("Students list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch students" },
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
    const phoneClean = cleanPhone(String(body.phone || ""));

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
      role: "student",
      isActive,
      avatar:
        typeof body.avatar === "string" && body.avatar.trim()
          ? body.avatar.trim()
          : undefined,
    });

    return NextResponse.json(mapStudent(user.toObject()), { status: 201 });
  } catch (error) {
    console.error("Student create error:", error);
    return NextResponse.json(
      { error: "Failed to create student" },
      { status: 500 },
    );
  }
}
