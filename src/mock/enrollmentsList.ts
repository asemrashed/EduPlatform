import type { EnrollmentListSuccessBody } from "@/types/enrollmentList";

/** Mock `GET /api/enrollments` — course IDs align with `studentComposite` + pass-paper fixtures. */
export function getMockEnrollmentListActive(): EnrollmentListSuccessBody {
  const enrollments = [
    {
      _id: "enr_mock_1",
      student: "student_mock_1",
      course: "507f1f77bcf86cd799439011",
      status: "active",
      progress: 72,
      enrolledAt: "2026-03-20T12:00:00.000Z",
      lastAccessedAt: "2026-04-10T14:00:00.000Z",
      paymentStatus: "paid",
    },
    {
      _id: "enr_mock_2",
      student: "student_mock_1",
      course: "507f1f77bcf86cd799439012",
      status: "active",
      progress: 35,
      enrolledAt: "2026-04-08T09:30:00.000Z",
      lastAccessedAt: "2026-04-09T11:20:00.000Z",
      paymentStatus: "paid",
    },
  ];

  return {
    success: true,
    data: {
      enrollments,
      pagination: {
        page: 1,
        limit: 100,
        total: enrollments.length,
        pages: 1,
        hasNext: false,
        hasPrev: false,
      },
      stats: {
        total: enrollments.length,
        active: enrollments.length,
        completed: 0,
        dropped: 0,
        suspended: 0,
        paid: enrollments.length,
        pending: 0,
        refunded: 0,
        failed: 0,
        totalRevenue: 0,
        averageProgress: 53.5,
        completionRate: 0,
        dropRate: 0,
      },
    },
  };
}
