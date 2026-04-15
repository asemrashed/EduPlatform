import { getMockChaptersForCourse, getMockLessonsForCourse } from "@/mock/publicCourseDetail";
import { getMockPassPapersList } from "@/mock/passPapersList";

export const MOCK_USER_ID = "mock-user-id";

const catScience = { _id: "507f1f77bcf86cd799439021", name: "Science" };
const catWeb = { _id: "507f1f77bcf86cd799439022", name: "Web" };

/** Admin / instructor course list shape */
export const SEED_COURSES = [
  {
    _id: "507f1f77bcf86cd799439011",
    title: "HSC Physics — Full syllabus (Bangladesh)",
    description: "<p>Full syllabus coverage for HSC Physics.</p>",
    shortDescription: "National curriculum aligned preparation course.",
    status: "published",
    isPaid: true,
    price: 2500,
    salePrice: 2000,
    thumbnailUrl: "",
    category: catScience,
    instructor: {
      _id: "507f1f77bcf86cd799439031",
      firstName: "Dr. Karim",
      lastName: "Rahman",
      email: "karim@example.com",
    },
    duration: 1200,
    lessonCount: 42,
    enrollmentCount: 128,
    createdAt: "2025-01-15T10:00:00.000Z",
    updatedAt: "2025-03-01T12:00:00.000Z",
  },
  {
    _id: "507f1f77bcf86cd799439012",
    title: "Introduction to Web Development",
    description: "<p>HTML, CSS, and JavaScript fundamentals.</p>",
    shortDescription: "Build your first responsive pages.",
    status: "published",
    isPaid: false,
    price: 0,
    thumbnailUrl: "",
    category: catWeb,
    instructor: {
      _id: "507f1f77bcf86cd799439032",
      firstName: "Ayesha",
      lastName: "Khan",
      email: "ayesha@example.com",
    },
    duration: 180,
    lessonCount: 8,
    enrollmentCount: 540,
    createdAt: "2025-02-01T10:00:00.000Z",
    updatedAt: "2025-02-15T12:00:00.000Z",
  },
];

export const SEED_CATEGORIES = [catScience, catWeb];

export const SEED_USERS = [
  {
    _id: MOCK_USER_ID,
    firstName: "Mock",
    lastName: "Student",
    email: "student@eduplatform.local",
    phone: "+8801700000000",
    parentPhone: "",
    role: "student",
    avatar: "",
  },
  {
    _id: "507f1f77bcf86cd799439031",
    firstName: "Dr. Karim",
    lastName: "Rahman",
    email: "karim@example.com",
    phone: "+8801711111111",
    role: "instructor",
  },
];

export const MOCK_EXAM = {
  _id: "exam_mock_1",
  title: "Sample Midterm Exam",
  description: "Covers weeks 1–4.",
  duration: 60,
  timeLimit: true,
  isPublished: true,
  isActive: true,
  startDate: new Date(Date.now() - 86400000).toISOString(),
  endDate: new Date(Date.now() + 86400000 * 7).toISOString(),
  course: "507f1f77bcf86cd799439011",
  totalMarks: 10,
  passingMarks: 5,
};

export const MOCK_EXAM_QUESTIONS = [
  {
    _id: "exam_q1",
    question: "What is 2 + 2?",
    type: "mcq" as const,
    marks: 5,
    difficulty: "easy" as const,
    options: [
      { _id: "exam_o1", text: "4", isCorrect: true },
      { _id: "exam_o2", text: "3", isCorrect: false },
    ],
  },
  {
    _id: "exam_q2",
    question: "Earth is round.",
    type: "true_false" as const,
    marks: 5,
    difficulty: "easy" as const,
    correctAnswer: "true",
  },
];

export function defaultPagination(page = 1, limit = 10, total = 0) {
  const pages = Math.max(1, Math.ceil(total / limit) || 1);
  return {
    page,
    limit,
    total,
    pages,
    hasNext: page < pages,
    hasPrev: page > 1,
  };
}

export function buildCourseLuInfo(courseId: string) {
  const c = SEED_COURSES.find((x) => x._id === courseId);
  if (!c) return undefined;
  return {
    _id: c._id,
    title: c.title,
    description: c.description,
    thumbnailUrl: c.thumbnailUrl,
    price: c.price,
    isPaid: c.isPaid,
    category: c.category,
    instructor: {
      _id: c.instructor._id,
      firstName: c.instructor.firstName,
      lastName: c.instructor.lastName,
    },
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    duration: c.duration,
    rating: 4.7,
  };
}

export function buildEnrollmentsForStudent(studentId: string) {
  const now = new Date().toISOString();
  return [
    {
      _id: "enr_mock_1",
      student: studentId,
      course: "507f1f77bcf86cd799439011",
      status: "active",
      progress: 72,
      enrolledAt: now,
      lastAccessedAt: now,
      paymentStatus: "paid",
      createdAt: now,
      updatedAt: now,
      courseLuInfo: buildCourseLuInfo("507f1f77bcf86cd799439011"),
    },
    {
      _id: "enr_mock_2",
      student: studentId,
      course: "507f1f77bcf86cd799439012",
      status: "active",
      progress: 35,
      enrolledAt: now,
      lastAccessedAt: now,
      paymentStatus: "paid",
      createdAt: now,
      updatedAt: now,
      courseLuInfo: buildCourseLuInfo("507f1f77bcf86cd799439012"),
    },
  ];
}

export function getSeedChapters(courseId: string) {
  return getMockChaptersForCourse(courseId);
}

export function getSeedLessons(courseId: string) {
  return getMockLessonsForCourse(courseId);
}

export function getPassPapersBody() {
  return getMockPassPapersList();
}

export const MOCK_ASSIGNMENT = {
  _id: "asg_mock_1",
  title: "Problem Set 1",
  description: "Submit your solutions as PDF.",
  course: "507f1f77bcf86cd799439011",
  dueDate: new Date(Date.now() + 86400000 * 3).toISOString(),
  status: "active",
  type: "file",
  maxScore: 100,
  createdAt: new Date().toISOString(),
};
