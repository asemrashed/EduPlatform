import connectDB from "@/lib/mongodb";
import Course from "@/models/Course";
import Enrollment from "@/models/Enrollment";

export function enrollmentCertificateApiPath(enrollmentId: string): string {
  return `/api/enrollments/${enrollmentId}/certificate`;
}

/**
 * Marks an enrollment as issued (manual admin/instructor or forced issue).
 */
export async function markEnrollmentCertificateIssued(
  enrollmentId: string,
): Promise<{ ok: true } | { ok: false; reason: "not_found" }> {
  await connectDB();

  const enrollment = await Enrollment.findById(enrollmentId);
  if (!enrollment) return { ok: false, reason: "not_found" };

  enrollment.certificateIssued = true;
  enrollment.certificateIssuedAt = enrollment.certificateIssuedAt || new Date();
  enrollment.certificateUrl = enrollmentCertificateApiPath(enrollmentId);

  await enrollment.save();
  return { ok: true };
}

/**
 * Auto-issue when a student completes a course with certificates enabled.
 * Does not overwrite if already issued.
 */
export async function issueEnrollmentCertificateIfNotIssued(
  enrollmentId: string,
): Promise<boolean> {
  await connectDB();

  const enrollment = await Enrollment.findById(enrollmentId);
  if (!enrollment || enrollment.certificateIssued) return false;

  const course = await Course.findById(enrollment.course)
    .select("certificateEnabled")
    .lean();
  if (!course?.certificateEnabled) return false;

  enrollment.certificateIssued = true;
  enrollment.certificateIssuedAt = enrollment.certificateIssuedAt || new Date();
  enrollment.certificateUrl = enrollmentCertificateApiPath(enrollmentId);

  await enrollment.save();
  return true;
}
