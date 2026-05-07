import type { StudentDashboardComposite } from "@/types/studentDashboard";

const iso = (d: string) => new Date(d).toISOString();

/** Composite enrollments + course progress — mirrors reference student dashboard data flow. */
export function getMockStudentDashboardComposite(): StudentDashboardComposite {
  const courseA = {
    _id: "507f1f77bcf86cd799439011",
    title: "HSC Physics — Full syllabus (Bangladesh)",
    description:
      "Complete HSC physics curriculum with problem sets and video explanations aligned to Bangladesh NCTB.",
    thumbnailUrl:
      "https://lh3.googleusercontent.com/a/ACg8ocK_example=s96-c",
    price: 0,
    isPaid: false,
    category: { _id: "cat1", name: "Science" },
    instructor: {
      _id: "ins1",
      firstName: "Dr. Anika",
      lastName: "Rahman",
    },
    createdAt: iso("2025-01-10T10:00:00.000Z"),
    updatedAt: iso("2026-03-01T10:00:00.000Z"),
  };

  const courseB = {
    _id: "507f1f77bcf86cd799439012",
    title: "Introduction to Web Development",
    description: "HTML, CSS, JavaScript fundamentals and responsive layouts.",
    thumbnailUrl: "",
    price: 49,
    isPaid: true,
    category: { _id: "cat2", name: "Technology" },
    instructor: {
      _id: "ins2",
      firstName: "Karim",
      lastName: "Ahmed",
    },
    createdAt: iso("2025-06-01T10:00:00.000Z"),
    updatedAt: iso("2026-02-15T10:00:00.000Z"),
  };

  const enrollments: StudentDashboardComposite["enrollments"] = [
    {
      _id: "enr1",
      course: courseA,
      enrolledAt: iso("2026-03-20T12:00:00.000Z"),
      status: "enrolled",
      progress: 72,
      lastAccessedAt: iso("2026-04-10T14:00:00.000Z"),
      paymentStatus: "paid",
    },
    {
      _id: "enr2",
      course: courseB,
      enrolledAt: iso("2026-04-08T09:30:00.000Z"),
      status: "enrolled",
      progress: 35,
      lastAccessedAt: iso("2026-04-09T11:20:00.000Z"),
      paymentStatus: "paid",
    },
    {
      _id: "enr3",
      course: {
        _id: "507f1f77bcf86cd799439099",
        title: "SSC English Foundations",
        description: "Reading, writing, and exam strategies for SSC English.",
        thumbnailUrl: "",
        price: 29,
        isPaid: true,
        category: { _id: "cat3", name: "Languages" },
        instructor: {
          _id: "ins3",
          firstName: "Meena",
          lastName: "Sultana",
        },
        createdAt: iso("2025-02-01T10:00:00.000Z"),
        updatedAt: iso("2026-01-10T10:00:00.000Z"),
      },
      enrolledAt: iso("2025-11-01T10:00:00.000Z"),
      status: "completed",
      progress: 100,
      lastAccessedAt: iso("2026-04-01T16:00:00.000Z"),
      paymentStatus: "paid",
    },
  ];

  const courseProgress: StudentDashboardComposite["courseProgress"] = [
    {
      _id: "cp1",
      course: courseA._id,
      isCompleted: false,
      progressPercentage: 72,
      totalLessons: 40,
      completedLessons: 28,
      totalTimeSpent: 2520,
      lastAccessedAt: iso("2026-04-10T14:00:00.000Z"),
      startedAt: iso("2026-03-20T12:00:00.000Z"),
    },
    {
      _id: "cp2",
      course: courseB._id,
      isCompleted: false,
      progressPercentage: 35,
      totalLessons: 32,
      completedLessons: 11,
      totalTimeSpent: 840,
      lastAccessedAt: iso("2026-04-09T11:20:00.000Z"),
      startedAt: iso("2026-04-08T09:30:00.000Z"),
    },
    {
      _id: "cp3",
      course: "507f1f77bcf86cd799439099",
      isCompleted: true,
      completedAt: iso("2026-04-01T16:00:00.000Z"),
      progressPercentage: 100,
      totalLessons: 24,
      completedLessons: 24,
      totalTimeSpent: 1800,
      lastAccessedAt: iso("2026-04-01T16:00:00.000Z"),
      startedAt: iso("2025-11-01T10:00:00.000Z"),
    },
  ];

  return { enrollments, courseProgress };
}
