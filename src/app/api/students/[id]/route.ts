import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth/next";
import connectDB from "@/lib/mongodb";
import { authOptions } from "@/lib/auth";
import User from "@/models/User";
import Enrollment from "@/models/Enrollment";

interface RouteParams {
  params: Promise<{ id: string }>;
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

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const authError = await requireAdminJson();
    if (authError) return authError;

    await connectDB();
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid student ID" }, { status: 400 });
    }

    const existing = await User.findById(id).lean();
    if (!existing || existing.role !== "student") {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const body = (await request.json()) as Record<string, unknown>;
    const updateData: Record<string, unknown> = {};

    if (typeof body.firstName === "string") {
      const v = body.firstName.trim();
      if (!v) {
        return NextResponse.json(
          { error: "First name cannot be empty" },
          { status: 400 },
        );
      }
      updateData.firstName = v;
    }
    if (typeof body.lastName === "string") {
      const v = body.lastName.trim();
      if (!v) {
        return NextResponse.json(
          { error: "Last name cannot be empty" },
          { status: 400 },
        );
      }
      updateData.lastName = v;
    }
    if (typeof body.phone === "string") {
      const phoneClean = cleanPhone(body.phone);
      if (!isValidBdPhone(phoneClean)) {
        return NextResponse.json(
          { error: "Phone number must start with 0 and be like 01XXXXXXXXX" },
          { status: 400 },
        );
      }
      const dup = await User.findOne({
        phone: phoneClean,
        _id: { $ne: id },
      })
        .select("_id")
        .lean();
      if (dup) {
        return NextResponse.json(
          { error: "User already exists with this phone number" },
          { status: 409 },
        );
      }
      updateData.phone = phoneClean;
    }
    if (typeof body.isActive === "boolean") {
      updateData.isActive = body.isActive;
    }
    if (typeof body.avatar === "string") {
      updateData.avatar = body.avatar.trim() || "";
    }
    if (typeof body.email === "string" && body.email.trim()) {
      updateData.email = body.email.trim().toLowerCase();
    }
    if (typeof body.password === "string" && body.password.length > 0) {
      if (body.password.length < 6) {
        return NextResponse.json(
          { error: "Password must be at least 6 characters" },
          { status: 400 },
        );
      }
      updateData.password = await bcrypt.hash(body.password, 12);
    }

    const firstName = String(
      updateData.firstName ?? existing.firstName,
    ).trim();
    const lastName = String(updateData.lastName ?? existing.lastName).trim();
    updateData.name = `${firstName} ${lastName}`.trim();

    const updated = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true },
    ).lean();

    if (!updated) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const agg = await Enrollment.aggregate<{
      enrollmentCount: number;
      totalEnrolledAmount: number;
    }>([
      { $match: { student: new mongoose.Types.ObjectId(id) } },
      {
        $group: {
          _id: null,
          enrollmentCount: { $sum: 1 },
          totalEnrolledAmount: { $sum: { $ifNull: ["$paymentAmount", 0] } },
        },
      },
    ]);
    const stat = agg[0];

    return NextResponse.json(
      mapStudent(updated as Record<string, unknown>, {
        enrollmentCount: stat?.enrollmentCount,
        totalEnrolledAmount: stat?.totalEnrolledAmount,
      }),
    );
  } catch (error) {
    console.error("Student update error:", error);
    return NextResponse.json(
      { error: "Failed to update student" },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const authError = await requireAdminJson();
    if (authError) return authError;

    await connectDB();
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid student ID" }, { status: 400 });
    }

    const existing = await User.findById(id).lean();
    if (!existing || existing.role !== "student") {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const enrollmentCount = await Enrollment.countDocuments({
      student: id,
    });
    if (enrollmentCount > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete student with existing enrollments; deactivate the account instead",
        },
        { status: 409 },
      );
    }

    await User.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Student delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete student" },
      { status: 500 },
    );
  }
}
