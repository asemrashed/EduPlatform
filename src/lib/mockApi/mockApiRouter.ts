import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getMockEnrollmentListActive } from "@/mock/enrollmentsList";
import {
  MOCK_ASSIGNMENT,
  MOCK_EXAM,
  MOCK_EXAM_QUESTIONS,
  SEED_CATEGORIES,
  SEED_COURSES,
  SEED_USERS,
  buildEnrollmentsForStudent,
  defaultPagination,
  getPassPapersBody,
  getSeedChapters,
  getSeedLessons,
  MOCK_USER_ID,
} from "@/mock/api/seedData";

type MockGlobal = typeof globalThis & {
  __eduMockExamAttempts?: Map<string, Record<string, unknown>>;
};

function getAttemptStore(): Map<string, Record<string, unknown>> {
  const g = globalThis as MockGlobal;
  if (!g.__eduMockExamAttempts) {
    g.__eduMockExamAttempts = new Map();
  }
  return g.__eduMockExamAttempts;
}

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

async function readBody(req: NextRequest): Promise<Record<string, unknown>> {
  try {
    const t = await req.text();
    if (!t) return {};
    return JSON.parse(t) as Record<string, unknown>;
  } catch {
    return {};
  }
}

const MOCK_QUESTION_BANK = [
  {
    _id: "qb_q1",
    question: "Sample MCQ",
    type: "mcq",
    marks: 2,
    difficulty: "easy",
    status: "active",
    category: "General",
    createdAt: new Date().toISOString(),
  },
];

const MOCK_EXAMS_LIST = [
  {
    ...MOCK_EXAM,
    courseTitle: SEED_COURSES[0].title,
    questionCount: MOCK_EXAM_QUESTIONS.length,
  },
];

const MOCK_STUDENT_ASSIGNMENTS = [
  {
    ...MOCK_ASSIGNMENT,
    courseTitle: SEED_COURSES[0].title,
    submissionStatus: "not_submitted",
  },
];

const MOCK_SUBMISSION = {
  _id: "sub_mock_1",
  assignment: MOCK_ASSIGNMENT._id,
  student: {
    _id: MOCK_USER_ID,
    firstName: "Mock",
    lastName: "Student",
    email: "student@eduplatform.local",
  },
  submittedAt: new Date().toISOString(),
  status: "submitted",
  grade: null,
  feedback: "",
  files: [{ name: "work.pdf", url: "https://example.com/work.pdf" }],
};

function seedTeachersRows() {
  return SEED_USERS.filter((u) => u.role === "instructor").map((u) => ({
    _id: u._id,
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.email,
    phone: u.phone,
    status: "active",
    createdAt: new Date().toISOString(),
  }));
}

function seedStudentsRows() {
  return [
    {
      _id: MOCK_USER_ID,
      firstName: "Mock",
      lastName: "Student",
      email: "student@eduplatform.local",
      status: "active",
      createdAt: new Date().toISOString(),
    },
  ];
}

export async function handleMockApi(req: NextRequest, segments: string[]) {
  const method = req.method;
  const url = new URL(req.url);
  const sp = url.searchParams;
  const pathKey = segments.join("/");

  if (segments.length === 0) {
    return json({ success: true, mockApi: true, message: "EduPlatform mock API" });
  }

  const body =
    method === "POST" || method === "PUT" || method === "PATCH"
      ? await readBody(req)
      : {};

  // --- Website / public content ---
  if (pathKey === "website-content" && method === "GET") {
    return json({
      data: {
        promotionalBanner: {
          enabled: true,
          imageUrl: "",
          link: "/courses",
          headline: "Explore more courses",
          subtext: "Special offers on new programs",
          ctaLabel: "Browse",
        },
        courseLessonBanner: {
          title: "Welcome to today’s lesson",
          subtitle: "Keep your streak going",
        },
      },
    });
  }

  if (pathKey.startsWith("admin/website-content")) {
    if (method === "GET") return json({ success: true, data: {} });
    return json({ success: true, data: {} });
  }

  if (pathKey === "upload/branding" && method === "POST") {
    return json({ success: true, url: "/mock-brand.png" });
  }

  // --- Users ---
  if (segments[0] === "users") {
    if (segments.length === 1 || segments[1] === "") {
      return json({
        users: SEED_USERS.map((u) => ({
          _id: u._id,
          firstName: u.firstName,
          lastName: u.lastName,
          email: u.email,
          role: u.role,
        })),
      });
    }
    const id = segments[1];
    const u = SEED_USERS.find((x) => x._id === id) ?? SEED_USERS[0];
    if (method === "GET") {
      return json({
        user: {
          _id: u._id,
          firstName: u.firstName,
          lastName: u.lastName,
          email: u.email,
          phone: u.phone ?? "",
          parentPhone: "",
          role: u.role,
          avatar: "",
        },
      });
    }
    if (method === "PUT") {
      return json({
        user: {
          _id: u._id,
          firstName: (body.firstName as string) ?? u.firstName,
          lastName: (body.lastName as string) ?? u.lastName,
          email: (body.email as string) ?? u.email,
          phone: (body.phone as string) ?? u.phone ?? "",
          parentPhone: (body.parentPhone as string) ?? "",
          role: u.role,
          avatar: (body.avatar as string) ?? "",
        },
      });
    }
  }

  // --- Categories ---
  if (pathKey === "categories" && method === "GET") {
    return json({
      success: true,
      data: { categories: SEED_CATEGORIES },
    });
  }

  // --- Courses ---
  if (segments[0] === "courses") {
    if (segments[1] === "reorder" && method === "POST") {
      return json({ success: true });
    }
    if (segments.length === 1 || segments[1] === "") {
      const page = Number(sp.get("page") ?? 1);
      const limit = Number(sp.get("limit") ?? 10);
      const total = SEED_COURSES.length;
      if (method === "GET") {
        return json({
          success: true,
          data: {
            courses: SEED_COURSES,
            pagination: defaultPagination(page, limit, total),
            stats: {
              total,
              published: total,
              draft: 0,
            },
          },
        });
      }
      if (method === "POST") {
        const nc = {
          _id: `course_new_${Date.now()}`,
          title: (body.title as string) ?? "New course",
          description: (body.description as string) ?? "",
          status: "draft",
          isPaid: Boolean(body.isPaid),
          price: Number(body.price ?? 0),
          category: SEED_CATEGORIES[0],
          instructor: SEED_USERS[1],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        return json({ success: true, data: nc });
      }
    }
    const courseId = segments[1];
    const found = SEED_COURSES.find((c) => c._id === courseId);
    if (method === "GET" && courseId) {
      return json({
        success: true,
        data: found ?? SEED_COURSES[0],
      });
    }
    if (method === "DELETE" && courseId) {
      return json({ success: true });
    }
    if (method === "PUT" && courseId) {
      return json({ success: true, data: { ...found, ...body } });
    }
  }

  // --- Enrollments ---
  if (segments[0] === "enrollments") {
    const student = sp.get("student") ?? MOCK_USER_ID;
    let list = buildEnrollmentsForStudent(student);
    const courseFilter = sp.get("course");
    if (courseFilter) {
      list = list.filter((e) => e.course === courseFilter);
    }
    const page = Number(sp.get("page") ?? 1);
    const limit = Number(sp.get("limit") ?? 12);
    const total = list.length;
    return json({
      success: true,
      data: {
        enrollments: list,
        pagination: defaultPagination(page, limit, total),
        stats: getMockEnrollmentListActive().data.stats,
      },
    });
  }

  // --- Chapters / lessons ---
  if (segments[0] === "chapters" && method === "GET") {
    const course = sp.get("course") ?? "";
    return json({
      success: true,
      data: { chapters: getSeedChapters(course) },
    });
  }

  if (segments[0] === "lessons" && segments[1] === "quiz-availability" && method === "GET") {
    return json({ success: true, data: { available: true } });
  }

  if (segments[0] === "lessons" && segments[2] === "quiz") {
    if (segments[3] === "result-details" && method === "GET") {
      return json({
        success: true,
        data: { scorePercentage: 80, passed: true },
      });
    }
    if (segments[3] === "history" && method === "GET") {
      return json({ success: true, data: { attempts: [] } });
    }
    if (method === "GET") {
      return json({
        success: true,
        data: {
          required: false,
          questions: [],
        },
      });
    }
  }

  if (segments[0] === "lessons" && segments.length === 1 && method === "GET") {
    const course = sp.get("course") ?? "";
    return json({
      success: true,
      data: { lessons: getSeedLessons(course) },
    });
  }

  // --- Progress (student course player) ---
  if (pathKey.startsWith("progress/")) {
    return json({
      success: true,
      data: { completed: false, progress: 0 },
    });
  }

  if (pathKey === "progress/completion" && method === "POST") {
    return json({ success: true });
  }

  if (segments[0] === "student" && segments[1] === "quiz" && segments[2] === "completion" && method === "GET") {
    return json({ success: true, data: { completed: false } });
  }

  // --- Student exams & attempts ---
  if (pathKey === "student/exams" && method === "GET") {
    const page = Number(sp.get("page") ?? 1);
    const limit = Number(sp.get("limit") ?? 12);
    return json({
      success: true,
      data: {
        exams: MOCK_EXAMS_LIST,
        pagination: defaultPagination(page, limit, MOCK_EXAMS_LIST.length),
        stats: { availableExams: MOCK_EXAMS_LIST.length },
      },
    });
  }

  if (segments[0] === "student" && segments[1] === "exams" && segments[2] && segments.length === 3) {
    const examId = segments[2];
    if (method === "GET") {
      return json({
        success: true,
        data: {
          exam: { ...MOCK_EXAM, _id: examId },
          questions: MOCK_EXAM_QUESTIONS,
        },
      });
    }
  }

  if (pathKey === "student/exam-attempts") {
    const store = getAttemptStore();
    if (method === "POST") {
      const examId = (body.examId as string) ?? MOCK_EXAM._id;
      const id = `att_${examId}_${Date.now()}`;
      const attempt = {
        _id: id,
        examId,
        status: "in_progress",
        startedAt: new Date().toISOString(),
        answers: [] as unknown[],
        timeSpent: 0,
      };
      store.set(id, attempt);
      return json({
        success: true,
        data: {
          attempt,
          remainingSeconds: (MOCK_EXAM.duration ?? 60) * 60,
        },
      });
    }
    if (method === "GET") {
      const examId = sp.get("examId") ?? "";
      const statusFilter = sp.get("status");
      let all = [...store.values()];
      if (examId) {
        all = all.filter((a) => a.examId === examId);
      }
      if (statusFilter) {
        all = all.filter((a) => a.status === statusFilter);
      }
      return json({ success: true, data: { attempts: all } });
    }
  }

  if (
    segments[0] === "student" &&
    segments[1] === "exam-attempts" &&
    segments[2] &&
    segments[3] === "submit"
  ) {
    const store = getAttemptStore();
    const id = segments[2];
    const prev = store.get(id);
    const answers = (body.answers as unknown[]) ?? [];
    const completed = {
      ...(prev ?? {}),
      _id: id,
      status: "completed",
      answers: answers.map((a: unknown, i: number) => {
        const base = (a && typeof a === "object" ? a : {}) as Record<
          string,
          unknown
        >;
        return {
          ...base,
          isCorrect: i % 2 === 0,
        };
      }),
      score: 85,
      submittedAt: new Date().toISOString(),
    };
    store.set(id, completed);
    return json({ success: true, data: { attempt: completed } });
  }

  if (segments[0] === "student" && segments[1] === "exam-attempts" && segments[2] && !segments[3]) {
    const store = getAttemptStore();
    const id = segments[2];
    if (method === "PUT") {
      const prev = store.get(id) ?? {};
      const next = { ...prev, ...body, _id: id };
      store.set(id, next);
      return json({ success: true, data: { attempt: next } });
    }
  }

  if (pathKey === "student/assignments" && method === "GET") {
    const page = Number(sp.get("page") ?? 1);
    const limit = Number(sp.get("limit") ?? 10);
    return json({
      success: true,
      data: {
        assignments: MOCK_STUDENT_ASSIGNMENTS,
        pagination: defaultPagination(page, limit, MOCK_STUDENT_ASSIGNMENTS.length),
        stats: { total: MOCK_STUDENT_ASSIGNMENTS.length, pending: 1 },
      },
    });
  }

  if (segments[0] === "assignments" && segments[1] && !segments[2]) {
    if (method === "GET") {
      return json({
        success: true,
        data: { assignment: { ...MOCK_ASSIGNMENT, _id: segments[1] } },
      });
    }
  }

  if (segments[0] === "assignments" && segments[2] === "submissions") {
    const assignmentId = segments[1];
    if (!segments[3]) {
      if (method === "GET") {
        const subs = sp.get("submissionId")
          ? [MOCK_SUBMISSION]
          : [MOCK_SUBMISSION];
        return json({
          success: true,
          data: {
            submissions: subs.map((s) => ({
              ...s,
              assignment: assignmentId,
            })),
            pagination: defaultPagination(1, 10, 1),
            stats: { submitted: 1, graded: 0 },
          },
        });
      }
    }
    if (segments[4] === "grade" && method === "POST") {
      return json({ success: true, data: { submission: MOCK_SUBMISSION } });
    }
  }

  if (pathKey === "student/assignments" && method === "POST") {
    return json({ success: true, data: { submission: MOCK_SUBMISSION } });
  }

  if (pathKey.startsWith("student/assignments/") && pathKey.endsWith("/submit")) {
    return json({ success: true, data: { submission: MOCK_SUBMISSION } });
  }

  if (pathKey === "uploads/assignment" && method === "POST") {
    return json({ success: true, url: "https://example.com/upload.pdf" });
  }

  // --- Instructor mirrors ---
  if (segments[0] === "instructor" && segments[1] === "exams" && segments[2] && method === "GET") {
    return json({
      success: true,
      data: {
        exam: { ...MOCK_EXAM, _id: segments[2] },
      },
    });
  }

  if (pathKey.startsWith("instructor/")) {
    if (pathKey === "instructor/exams" && method === "GET") {
      return json({
        success: true,
        data: {
          exams: MOCK_EXAMS_LIST,
          pagination: defaultPagination(1, 10, MOCK_EXAMS_LIST.length),
        },
      });
    }
    if (pathKey === "instructor/questions" && method === "GET") {
      return json({
        success: true,
        data: {
          questions: MOCK_QUESTION_BANK,
          pagination: defaultPagination(1, 10, MOCK_QUESTION_BANK.length),
          stats: {
            totalQuestions: 1,
            activeQuestions: 1,
            mcqQuestions: 1,
            totalMarks: 2,
            byType: {},
            byDifficulty: {},
            byStatus: {},
          },
        },
      });
    }
    if (pathKey === "instructor/students" && method === "GET") {
      return json({
        success: true,
        data: {
          students: seedStudentsRows(),
          pagination: defaultPagination(1, 10, 1),
        },
      });
    }
    if (pathKey === "instructor/enrollments" && method === "GET") {
      return json({
        success: true,
        data: {
          enrollments: buildEnrollmentsForStudent(MOCK_USER_ID),
          pagination: defaultPagination(1, 10, 2),
        },
      });
    }
    if (pathKey === "instructor/assignments" && method === "GET") {
      return json({
        success: true,
        data: {
          assignments: [MOCK_ASSIGNMENT],
          pagination: defaultPagination(1, 10, 1),
        },
      });
    }
    if (pathKey === "instructor/courses" && method === "GET") {
      return json({ success: true, data: { courses: SEED_COURSES } });
    }
    if (pathKey.endsWith("change-password")) {
      return json({ success: true });
    }
  }

  // --- Admin exams / questions ---
  if (segments[0] === "exams") {
    if (segments.length === 1 || segments[1] === "") {
      if (method === "GET") {
        return json({
          success: true,
          data: {
            exams: MOCK_EXAMS_LIST,
            pagination: defaultPagination(1, 10, MOCK_EXAMS_LIST.length),
          },
        });
      }
    }
    if (segments[1] && segments.length === 2 && method === "GET") {
      return json({
        success: true,
        data: {
          exam: { ...MOCK_EXAM, _id: segments[1] },
        },
      });
    }
    if (segments[1] && method === "DELETE") {
      return json({ success: true });
    }
  }

  if (segments[0] === "questions") {
    if (segments.length === 1 || segments[1] === "") {
      if (method === "GET") {
        return json({
          success: true,
          data: {
            questions: MOCK_QUESTION_BANK,
            pagination: defaultPagination(1, 10, MOCK_QUESTION_BANK.length),
            stats: {
              totalQuestions: 1,
              activeQuestions: 1,
              mcqQuestions: 1,
              totalMarks: 2,
              byType: {},
              byDifficulty: {},
              byStatus: {},
            },
          },
        });
      }
      if (method === "POST") {
        return json({ success: true, data: { question: MOCK_QUESTION_BANK[0] } });
      }
    }
    if (segments[1] && method === "DELETE") {
      return json({ success: true });
    }
  }

  // --- Assignments (admin list) ---
  if (pathKey === "assignments" && method === "GET") {
    return json({
      success: true,
      data: {
        assignments: [MOCK_ASSIGNMENT],
        pagination: defaultPagination(1, 10, 1),
        stats: { total: 1 },
      },
    });
  }

  if (segments[0] === "assignments" && segments[1] && method === "DELETE") {
    return json({ success: true });
  }

  // --- Students / teachers ---
  if (pathKey.startsWith("students") && method === "GET") {
    return json({
      success: true,
      data: {
        students: seedStudentsRows(),
        pagination: defaultPagination(1, 10, 1),
      },
    });
  }

  if (segments[0] === "students" && segments[1] && method === "DELETE") {
    return json({ success: true });
  }

  if (pathKey.startsWith("teachers") && method === "GET") {
    const rows = seedTeachersRows();
    return json({
      success: true,
      data: {
        teachers: rows,
        pagination: defaultPagination(1, 10, rows.length),
      },
    });
  }

  if (segments[0] === "teachers" && segments[1] && method === "DELETE") {
    return json({ success: true });
  }

  // --- Pass papers ---
  if (pathKey.startsWith("pass-papers")) {
    const pp = getPassPapersBody();
    if (method === "GET") {
      return json(pp);
    }
    if (method === "DELETE") {
      return json({ success: true });
    }
  }

  // --- Reviews ---
  if (pathKey.includes("course-reviews") && method === "GET") {
    return json({
      success: true,
      data: {
        reviews: [],
        pagination: defaultPagination(1, 10, 0),
      },
    });
  }

  if (pathKey.startsWith("admin/course-reviews")) {
    if (method === "GET") {
      return json({
        success: true,
        data: {
          reviews: [],
          pagination: defaultPagination(1, 10, 0),
        },
      });
    }
    return json({ success: true });
  }

  if (pathKey.startsWith("admin/students") && pathKey.includes("block-reviews")) {
    return json({ success: true });
  }

  if (pathKey === "admin/seed-reviews" && method === "POST") {
    return json({ success: true, seeded: 0 });
  }

  // --- FAQ ---
  if (pathKey.startsWith("admin/faqs")) {
    if (method === "GET") {
      return json({
        success: true,
        data: {
          faqs: [],
          pagination: defaultPagination(1, 10, 0),
        },
      });
    }
    return json({ success: true });
  }

  // --- Payment / refunds ---
  if (pathKey.startsWith("payment/eligible-refunds") && method === "GET") {
    const pag = defaultPagination(1, 10, 0);
    return json({
      success: true,
      data: {
        eligiblePayments: [],
        pagination: pag,
        statistics: { totalAmount: 0, count: 0 },
      },
    });
  }

  if (pathKey.startsWith("payment/refund-history") && method === "GET") {
    const pag = defaultPagination(1, 10, 0);
    return json({
      success: true,
      data: {
        refundedPayments: [],
        pagination: pag,
        statistics: { totalRefunded: 0, count: 0 },
      },
    });
  }

  // --- Password ---
  if (pathKey.endsWith("change-password")) {
    return json({ success: true, message: "ok" });
  }

  // --- Generic OK for unmapped mutation ---
  if (method === "POST" || method === "PUT" || method === "PATCH" || method === "DELETE") {
    return json({ success: true, data: body });
  }

  return json({
    success: true,
    data: {
      message: "mock",
      path: pathKey,
      hint: "Unmapped GET; returning empty envelope.",
    },
  });
}
