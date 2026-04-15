import type { PassPapersListBody } from "@/types/passPaper";

const iso = (s: string) => new Date(s).toISOString();

/** Mock `GET /api/pass-papers` — includes papers for enrolled course IDs from enrollments mock. */
export function getMockPassPapersList(): PassPapersListBody {
  const passPapers = [
    {
      _id: "pp_1",
      course: {
        _id: "507f1f77bcf86cd799439011",
        title: "HSC Physics — Full syllabus (Bangladesh)",
      },
      sessionName: "2025 Final",
      year: 2025,
      subject: "Physics",
      examType: "Written",
      questionPaperUrl: "https://example.com/q1.pdf",
      marksPdfUrl: "https://example.com/m1.pdf",
      isActive: true,
      createdAt: iso("2026-01-15T10:00:00.000Z"),
    },
    {
      _id: "pp_2",
      course: {
        _id: "507f1f77bcf86cd799439012",
        title: "Introduction to Web Development",
      },
      sessionName: "2024 Model Test",
      year: 2024,
      subject: "ICT",
      examType: "MCQ",
      questionPaperUrl: "https://example.com/q2.pdf",
      isActive: true,
      createdAt: iso("2026-02-01T10:00:00.000Z"),
    },
    {
      _id: "pp_other_course",
      course: {
        _id: "507f1f77bcf86cd799439099",
        title: "Other course (not enrolled in mock)",
      },
      sessionName: "2023",
      year: 2023,
      subject: "English",
      examType: "Written",
      isActive: true,
      createdAt: iso("2025-06-01T10:00:00.000Z"),
    },
  ];

  return {
    passPapers,
    pagination: {
      page: 1,
      limit: 100,
      total: passPapers.length,
      pages: 1,
    },
  };
}
