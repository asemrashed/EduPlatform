import { getEnrollments } from "@/lib/api/enrollmentClient";
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
    const enr = await getEnrollments({ status: "active", limit: 100, page: 1 });
    const allowed = enrollmentCourseIds(enr.data);
    const { passPapers: all } = await getPassPapers({ page: 1, limit: 100 });
    const passPapers = all.filter((p) => {
      const cid = passPaperCourseId(p);
      return cid && allowed.has(String(cid));
    });
    return { enrollmentData: enr.data, passPapers };
  },
};
