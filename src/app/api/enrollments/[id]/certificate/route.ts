import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth/next";
import connectDB from "@/lib/mongodb";
import { authOptions } from "@/lib/auth";
import Course from "@/models/Course";
import Enrollment from "@/models/Enrollment";
import { buildCertificatePdfBuffer } from "@/lib/certificate-pdf";
import { markEnrollmentCertificateIssued } from "@/lib/enrollment-certificate";

interface RouteParams {
  params: Promise<{ id: string }>;
}

async function canManageEnrollmentCourse(
  courseId: unknown,
  userId: string,
  role: string,
): Promise<boolean> {
  if (role === "admin") return true;
  if (role !== "instructor") return false;
  const course = await Course.findById(courseId)
    .select("instructor createdBy")
    .lean();
  if (!course) return false;
  return (
    String(course.instructor || "") === userId ||
    String(course.createdBy || "") === userId
  );
}

function studentOwnsEnrollment(enrollment: { student: unknown }, userId: string): boolean {
  const studentId =
    enrollment.student &&
    typeof enrollment.student === "object" &&
    "_id" in (enrollment.student as object)
      ? String((enrollment.student as { _id: unknown })._id)
      : String(enrollment.student ?? "");
  return studentId === userId;
}

/** GET — download certificate PDF */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    const role = session?.user?.role;
    if (!userId || !role) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid enrollment ID" },
        { status: 400 },
      );
    }

    await connectDB();

    const enrollment = await Enrollment.findById(id)
      .populate("student", "firstName lastName name")
      .populate("course", "title certificateOutcomes certificateEnabled")
      .lean();

    if (!enrollment) {
      return NextResponse.json(
        { success: false, error: "Enrollment not found" },
        { status: 404 },
      );
    }

    const isOwner = studentOwnsEnrollment(enrollment, userId);
    const isStaff =
      role === "admin" ||
      (role === "instructor" &&
        (await canManageEnrollmentCourse(enrollment.course, userId, role)));

    if (!isOwner && !isStaff) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    if (role === "student" && !enrollment.certificateIssued) {
      return NextResponse.json(
        { success: false, error: "Certificate has not been issued yet" },
        { status: 403 },
      );
    }

    const student = enrollment.student as
      | { firstName?: string; lastName?: string; name?: string }
      | undefined;
    const course = enrollment.course as
      | { title?: string; certificateOutcomes?: string[] }
      | undefined;

    const studentName =
      `${student?.firstName || ""} ${student?.lastName || ""}`.trim() ||
      student?.name ||
      "Student";

    const studentRefId =
      student && typeof student === "object" && "_id" in student
        ? String((student as { _id: unknown })._id)
        : String(enrollment.student);

    const outcomes = Array.isArray(course?.certificateOutcomes)
      ? course.certificateOutcomes
      : undefined;

    const pdfBuffer = await buildCertificatePdfBuffer({
      studentName,
      courseTitle: course?.title || "Course",
      rollNo: studentRefId.slice(-8).toUpperCase(),
      certificateOutcomes: outcomes,
    });

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'inline; filename="certificate.pdf"',
      },
    });
  } catch (error) {
    console.error("GET enrollment certificate error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate certificate PDF" },
      { status: 500 },
    );
  }
}

/** POST — manual issue (admin / course instructor) */
export async function POST(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    const role = session?.user?.role;
    if (!userId || !role) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }
    if (role !== "admin" && role !== "instructor") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid enrollment ID" },
        { status: 400 },
      );
    }

    await connectDB();

    const enrollment = await Enrollment.findById(id).select("course").lean();
    if (!enrollment) {
      return NextResponse.json(
        { success: false, error: "Enrollment not found" },
        { status: 404 },
      );
    }

    if (!(await canManageEnrollmentCourse(enrollment.course, userId, role))) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const result = await markEnrollmentCertificateIssued(id);
    if (!result.ok) {
      return NextResponse.json(
        { success: false, error: "Enrollment not found" },
        { status: 404 },
      );
    }

    const updated = await Enrollment.findById(id)
      .select("certificateIssued certificateIssuedAt certificateUrl")
      .lean();

    return NextResponse.json({
      success: true,
      data: {
        certificateIssued: Boolean(updated?.certificateIssued),
        certificateIssuedAt: updated?.certificateIssuedAt
          ? new Date(updated.certificateIssuedAt).toISOString()
          : new Date().toISOString(),
        certificateUrl: updated?.certificateUrl || `/api/enrollments/${id}/certificate`,
      },
    });
  } catch (error) {
    console.error("POST enrollment certificate error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to issue certificate" },
      { status: 500 },
    );
  }
}
