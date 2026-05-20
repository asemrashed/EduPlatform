import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth/next";
import connectDB from "@/lib/mongodb";
import { authOptions } from "@/lib/auth";
import User from "@/models/User";
import Course from "@/models/Course";
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

async function requireInstructorJson() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return {
      error: NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      ),
    };
  }
  if (session.user.role !== "instructor") {
    return {
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }
  return { userId: session.user.id };
}

async function getInstructorCourseIds(userId: string): Promise<mongoose.Types.ObjectId[]> {
  const courses = await Course.find({ instructor: userId }).select("_id").lean();
  return courses.map((c) => c._id as mongoose.Types.ObjectId);
}

function mapStudent(
  user: Record<string, unknown>,
  extras?: {
    enrollmentCount?: number;
    totalEnrolledAmount?: number;
    enrollmentDate?: Date;
  },
) {
  const address =
    typeof user.address === "string" && user.address.trim()
      ? { fullAddress: user.address }
      : undefined;

  return {
    _id: String(user._id),
    email: String(user.email || ""),
    phone: user.phone ? String(user.phone) : undefined,
    firstName: String(user.firstName || ""),
    lastName: String(user.lastName || ""),
    role: "student" as const,
    isActive: user.isActive !== false,
    avatar: user.avatar ? String(user.avatar) : undefined,
    parentPhone: user.parentPhone ? String(user.parentPhone) : undefined,
    address,
    enrollmentDate: extras?.enrollmentDate,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    lastLogin: user.lastLogin,
    fullName: user.name ? String(user.name) : undefined,
    enrollmentCount: extras?.enrollmentCount ?? 0,
    totalEnrolledAmount: extras?.totalEnrolledAmount ?? 0,
  };
}

type StudentEnrollmentRollup = {
  _id: mongoose.Types.ObjectId;
  enrollmentCount: number;
  totalEnrolledAmount: number;
  firstEnrolledAt: Date;
};

export async function GET(request: NextRequest) {
  try {
    const auth = await requireInstructorJson();
    if ("error" in auth && auth.error) return auth.error;
    const userId = auth.userId!;

    await connectDB();
    const courseIds = await getInstructorCourseIds(userId);

    if (courseIds.length === 0) {
      return NextResponse.json({
        students: [],
        pagination: { page: 1, limit: 10, total: 0, pages: 0 },
        stats: {
          totalStudents: 0,
          activeStudents: 0,
          inactiveStudents: 0,
          totalEnrolledAmount: 0,
          totalEnrollments: 0,
          enrolledThisMonth: 0,
        },
      });
    }

    const { searchParams } = new URL(request.url);
    const page = toPositiveInt(searchParams.get("page"), 1);
    const limit = Math.min(toPositiveInt(searchParams.get("limit"), 10), 500);
    const search = String(searchParams.get("search") || "").trim();
    const status = searchParams.get("status");

    const rollups = await Enrollment.aggregate<StudentEnrollmentRollup>([
      { $match: { course: { $in: courseIds } } },
      {
        $group: {
          _id: "$student",
          enrollmentCount: { $sum: 1 },
          totalEnrolledAmount: {
            $sum: {
              $cond: [
                { $eq: ["$paymentStatus", "paid"] },
                { $ifNull: ["$paymentAmount", 0] },
                0,
              ],
            },
          },
          firstEnrolledAt: { $min: "$enrolledAt" },
        },
      },
    ]);

    const studentIds = rollups.map((r) => r._id);
    const rollupMap = new Map(
      rollups.map((r) => [
        String(r._id),
        {
          enrollmentCount: r.enrollmentCount,
          totalEnrolledAmount: r.totalEnrolledAmount,
          firstEnrolledAt: r.firstEnrolledAt,
        },
      ]),
    );

    const userFilter: Record<string, unknown> = {
      _id: { $in: studentIds },
      role: "student",
    };

    if (status === "active") userFilter.isActive = true;
    if (status === "inactive") userFilter.isActive = false;

    if (search) {
      const orClause: Record<string, unknown>[] = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
      if (mongoose.Types.ObjectId.isValid(search)) {
        orClause.push({ _id: new mongoose.Types.ObjectId(search) });
      }
      userFilter.$or = orClause;
    }

    const allMatchingUsers = await User.find(userFilter)
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    const studentsAll = allMatchingUsers.map((u) => {
      const rollup = rollupMap.get(String(u._id));
      return mapStudent(u as Record<string, unknown>, {
        enrollmentCount: rollup?.enrollmentCount,
        totalEnrolledAmount: rollup?.totalEnrolledAmount,
        enrollmentDate: rollup?.firstEnrolledAt,
      });
    });

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const stats = {
      totalStudents: studentsAll.length,
      activeStudents: studentsAll.filter((s) => s.isActive).length,
      inactiveStudents: studentsAll.filter((s) => !s.isActive).length,
      totalEnrolledAmount: studentsAll.reduce(
        (sum, s) => sum + (s.totalEnrolledAmount || 0),
        0,
      ),
      totalEnrollments: studentsAll.reduce(
        (sum, s) => sum + (s.enrollmentCount || 0),
        0,
      ),
      enrolledThisMonth: studentsAll.filter((s) => {
        const d = s.enrollmentDate ? new Date(s.enrollmentDate) : null;
        return d && d >= monthStart;
      }).length,
    };

    const total = studentsAll.length;
    const pages = total > 0 ? Math.ceil(total / limit) : 0;
    const skip = (page - 1) * limit;
    const students = studentsAll.slice(skip, skip + limit);

    return NextResponse.json({
      students,
      pagination: { page, limit, total, pages },
      stats,
    });
  } catch (error) {
    console.error("Get instructor students error:", error);
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireInstructorJson();
    if ("error" in auth && auth.error) return auth.error;

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
      parentPhone:
        typeof body.parentPhone === "string" && body.parentPhone.trim()
          ? cleanPhone(body.parentPhone)
          : undefined,
      address:
        typeof body.address === "object" &&
        body.address &&
        typeof (body.address as { fullAddress?: string }).fullAddress === "string"
          ? String((body.address as { fullAddress: string }).fullAddress).trim()
          : undefined,
    });

    return NextResponse.json(
      {
        message: "Student created successfully",
        student: mapStudent(user.toObject()),
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create instructor student error:", error);
    return NextResponse.json(
      { error: "Failed to create student" },
      { status: 500 },
    );
  }
}
