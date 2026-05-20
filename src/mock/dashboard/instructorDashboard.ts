import type { InstructorDashboardApiPayload } from "@/types/dashboard";

/** Mirrors `GET /api/instructor/dashboard` success body (`learning-project`). */
export function getMockInstructorDashboard(): InstructorDashboardApiPayload {
  return {
    overview: {
      totalCourses: 5,
      totalStudents: 128,
      totalEnrollments: 340,
      weeklyCompletions: 24,
      completionChange: 12,
      successfulPayments: 310,
      totalRevenue: 425000,
    },
    recentEnrollments: [
      {
        id: "65f1a1a1a1a1a1a1a1a1a1a1",
        studentName: "Nadia Rahman",
        studentEmail: "nadia@example.com",
        courseTitle: "HSC Physics — Full syllabus (Bangladesh)",
        enrolledAt: new Date("2026-04-11T08:00:00.000Z").toISOString(),
        status: "enrolled",
      },
      {
        id: "65f1a1a1a1a1a1a1a1a1a1a2",
        studentName: "Imran Hossain",
        studentEmail: "imran@example.com",
        courseTitle: "Introduction to Web Development",
        enrolledAt: new Date("2026-04-10T19:15:00.000Z").toISOString(),
        status: "enrolled",
      },
    ],
    trends: {
      enrollments: [
        { _id: "2026-04-07", count: 4 },
        { _id: "2026-04-08", count: 7 },
        { _id: "2026-04-09", count: 5 },
        { _id: "2026-04-10", count: 9 },
        { _id: "2026-04-11", count: 3 },
      ],
    },
    courses: [
      {
        _id: "65f1b1b1b1b1b1b1b1b1b1b1",
        title: "HSC Physics — Full syllabus (Bangladesh)",
        description: "Complete HSC physics preparation.",
        category: { _id: "science", name: "Science" },
        studentCount: 42,
        averageRating: 4.6,
        totalLessons: 48,
        createdAt: new Date("2025-11-01T00:00:00.000Z").toISOString(),
        status: "published",
      },
    ],
    students: [
      {
        _id: "65f1c1c1c1c1c1c1c1c1c1c1",
        firstName: "Nadia",
        lastName: "Rahman",
        email: "nadia@example.com",
        enrolledCourses: 2,
        lastActive: new Date("2026-04-11T08:00:00.000Z").toISOString(),
      },
      {
        _id: "65f1c1c1c1c1c1c1c1c1c1c2",
        firstName: "Imran",
        lastName: "Hossain",
        email: "imran@example.com",
        enrolledCourses: 1,
        lastActive: new Date("2026-04-10T19:15:00.000Z").toISOString(),
      },
    ],
  };
}
