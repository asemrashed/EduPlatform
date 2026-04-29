import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

function splitName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const firstName = parts[0] || "";
  const lastName = parts.slice(1).join(" ") || "Student";
  return { firstName, lastName };
}

export async function POST(request: NextRequest) {
  try {
    const { name, phone, password, confirmPassword } = await request.json();

    if (!name || !phone || !password || !confirmPassword) {
      return NextResponse.json(
        { error: "Name, phone, password and confirm password are required" },
        { status: 400 },
      );
    }

    const cleanPhone = String(phone).replace(/[\s\-\(\)]/g, "");
    if (!/^01\d{9}$/.test(cleanPhone)) {
      return NextResponse.json(
        { error: "Phone number must start with 0 and be like 01XXXXXXXXX" },
        { status: 400 },
      );
    }

    if (String(password).length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 },
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Password and confirm password do not match" },
        { status: 400 },
      );
    }

    const trimmedName = String(name).trim();
    if (!trimmedName) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 },
      );
    }

    await connectDB();

    const existingUser = await User.findOne({ phone: cleanPhone });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists with this phone number" },
        { status: 409 },
      );
    }

    const { firstName, lastName } = splitName(trimmedName);
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: trimmedName,
      firstName,
      lastName,
      phone: cleanPhone,
      password: hashedPassword,
      role: "student",
      isActive: true,
    });

    return NextResponse.json(
      { message: "User created successfully", user: user.toJSON() },
      { status: 201 },
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
