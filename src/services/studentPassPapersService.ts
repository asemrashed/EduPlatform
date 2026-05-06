import { getMyEnrollments } from "@/lib/api/enrollmentClient";
import { getPassPapers } from "@/lib/api/passPapersClient";
import type { PassPaperRow } from "@/types/passPaper";
import type { EnrollmentListData } from "@/types/enrollmentList";

function enrollmentCourseIds(data: EnrollmentListData): Set<string> {
  const ids = new Set<string>();
  for (const e of data.enrollments) {
    if (e.course) ids.add(String(e.course));
  }
  return ids;
}

function passPaperCourseId(p: PassPaperRow): string {
  if (!p.course) return "";
  if (typeof p.course === "string") return p.course;
  return p.course._id ?? "";
}

/**
 * Student pass-papers view: **enrollments-based filter** (PLAN Phase 5) — no
 * `/api/student/courses` shim; derives allowed course IDs from `GET /api/enrollments`.
 */
export const studentPassPapersService = {
  async load(): Promise<{
    enrollmentData: EnrollmentListData;
    passPapers: PassPaperRow[];
  }> {
    const enr = await getMyEnrollments();
    const enrollmentData: EnrollmentListData = {
      enrollments: enr.data.enrollments,
      pagination: {
        page: 1,
        limit: enr.data.enrollments.length,
        total: enr.data.enrollments.length,
        pages: enr.data.enrollments.length > 0 ? 1 : 0,
        hasNext: false,
        hasPrev: false,
      },
      stats: {
        total: enr.data.enrollments.length,
        active: enr.data.enrollments.filter((e) =>
          ["enrolled", "in_progress"].includes(String(e.status || "").toLowerCase()),
        ).length,
        completed: enr.data.enrollments.filter((e) => e.status === "completed").length,
        dropped: enr.data.enrollments.filter((e) => e.status === "dropped").length,
        suspended: enr.data.enrollments.filter((e) => e.status === "suspended").length,
        paid: enr.data.enrollments.filter((e) => e.paymentStatus === "paid").length,
        pending: enr.data.enrollments.filter((e) => e.paymentStatus === "pending").length,
        refunded: enr.data.enrollments.filter((e) => e.paymentStatus === "refunded").length,
        failed: enr.data.enrollments.filter((e) => e.paymentStatus === "failed").length,
        totalRevenue: 0,
        averageProgress:
          enr.data.enrollments.length > 0
            ? enr.data.enrollments.reduce((sum, e) => sum + (e.progress ?? 0), 0) /
              enr.data.enrollments.length
            : 0,
        completionRate: 0,
        dropRate: 0,
      },
    };
    const allowed = enrollmentCourseIds(enrollmentData);
    const { passPapers: all } = await getPassPapers({ page: 1, limit: 100 });
    const passPapers = all.filter((p) => {
      const cid = passPaperCourseId(p);
      return cid && allowed.has(String(cid));
    });
    return { enrollmentData, passPapers };
  },
};
