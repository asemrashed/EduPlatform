import type { CourseFaq } from "@/types/courseFaq";
import type { Chapter } from "@/types/chapter";
import type { Lesson } from "@/types/lesson";
import type { PublicCourseDetailData } from "@/types/publicCourse";

export const MOCK_COURSE_IDS = [
  "507f1f77bcf86cd799439011",
  "507f1f77bcf86cd799439012",
] as const;

const detail011: PublicCourseDetailData = {
  _id: "507f1f77bcf86cd799439011",
  title: "HSC Physics — Full syllabus (Bangladesh)",
  shortDescription: "National curriculum aligned preparation course.",
  description:
    "<p>Full syllabus coverage for HSC Physics with problem-solving and past papers.</p>",
  category: "507f1f77bcf86cd799439021",
  categoryInfo: null,
  thumbnailUrl: undefined,
  isPaid: true,
  status: "published",
  isHidden: false,
  price: 2500,
  salePrice: 2000,
  originalPrice: undefined,
  finalPrice: 2000,
  discountPercentage: 20,
  displayOrder: undefined,
  duration: 1200,
  difficulty: "intermediate",
  lessonCount: 42,
  enrollmentCount: 128,
  tags: ["HSC", "Physics", "BD"],
  createdBy: {
    _id: "507f1f77bcf86cd799439031",
    name: "Dr. Karim Rahman",
    role: "instructor",
    email: "karim@example.com",
  },
  instructor: {
    _id: "507f1f77bcf86cd799439031",
    name: "Dr. Karim Rahman",
    role: "instructor",
    email: "karim@example.com",
    avatar: undefined,
    phone: undefined,
    address: undefined,
  },
  createdAt: new Date("2025-01-15T10:00:00.000Z").toISOString(),
  updatedAt: new Date("2025-03-01T12:00:00.000Z").toISOString(),
};

const detail012: PublicCourseDetailData = {
  _id: "507f1f77bcf86cd799439012",
  title: "Introduction to Web Development",
  shortDescription: "HTML, CSS, and JavaScript fundamentals.",
  description: "<p>Build your first responsive pages and learn the modern web stack.</p>",
  category: "507f1f77bcf86cd799439021",
  categoryInfo: null,
  thumbnailUrl: undefined,
  isPaid: false,
  status: "published",
  isHidden: false,
  price: 0,
  salePrice: undefined,
  originalPrice: undefined,
  finalPrice: 0,
  discountPercentage: 0,
  duration: 180,
  difficulty: "beginner",
  lessonCount: 8,
  enrollmentCount: 540,
  tags: ["Web", "Beginner"],
  createdBy: {
    _id: "507f1f77bcf86cd799439032",
    name: "Ayesha Khan",
    role: "instructor",
  },
  instructor: {
    _id: "507f1f77bcf86cd799439032",
    name: "Ayesha Khan",
    role: "instructor",
  },
  createdAt: new Date("2025-02-01T10:00:00.000Z").toISOString(),
  updatedAt: new Date("2025-02-15T12:00:00.000Z").toISOString(),
};

const byId: Record<string, PublicCourseDetailData> = {
  [detail011._id]: detail011,
  [detail012._id]: detail012,
};

export function getMockPublicCourseDetail(
  id: string,
): PublicCourseDetailData | null {
  return byId[id] ?? null;
}

const chapters011: Chapter[] = [
  {
    _id: "507f1f77bcf86cd799439101",
    title: "Mechanics",
    description: "Motion, forces, and energy.",
    course: detail011._id,
    order: 1,
    isPublished: true,
    createdAt: "2025-01-16T00:00:00.000Z",
    updatedAt: "2025-01-16T00:00:00.000Z",
  },
  {
    _id: "507f1f77bcf86cd799439102",
    title: "Electricity & magnetism",
    course: detail011._id,
    order: 2,
    isPublished: true,
    createdAt: "2025-01-17T00:00:00.000Z",
    updatedAt: "2025-01-17T00:00:00.000Z",
  },
];

const chapters012: Chapter[] = [
  {
    _id: "507f1f77bcf86cd799439201",
    title: "Foundations",
    course: detail012._id,
    order: 1,
    isPublished: true,
    createdAt: "2025-02-02T00:00:00.000Z",
    updatedAt: "2025-02-02T00:00:00.000Z",
  },
];

export function getMockChaptersForCourse(courseId: string): Chapter[] {
  if (courseId === detail011._id) return chapters011;
  if (courseId === detail012._id) return chapters012;
  return [];
}

const lessons011: Lesson[] = [
  {
    _id: "507f1f77bcf86cd799439111",
    title: "Vectors and kinematics",
    description: "Displacement, velocity, acceleration.",
    chapter: "507f1f77bcf86cd799439101",
    course: detail011._id,
    order: 1,
    duration: 45,
    isPublished: true,
    isFree: true,
    createdAt: "2025-01-16T00:00:00.000Z",
    updatedAt: "2025-01-16T00:00:00.000Z",
  },
  {
    _id: "507f1f77bcf86cd799439112",
    title: "Newton's laws",
    chapter: "507f1f77bcf86cd799439101",
    course: detail011._id,
    order: 2,
    duration: 50,
    isPublished: true,
    isFree: false,
    createdAt: "2025-01-16T00:00:00.000Z",
    updatedAt: "2025-01-16T00:00:00.000Z",
  },
  {
    _id: "507f1f77bcf86cd799439113",
    title: "Coulomb's law",
    chapter: "507f1f77bcf86cd799439102",
    course: detail011._id,
    order: 1,
    duration: 40,
    isPublished: true,
    isFree: false,
    createdAt: "2025-01-17T00:00:00.000Z",
    updatedAt: "2025-01-17T00:00:00.000Z",
  },
];

const lessons012: Lesson[] = [
  {
    _id: "507f1f77bcf86cd799439211",
    title: "How the web works",
    chapter: "507f1f77bcf86cd799439201",
    course: detail012._id,
    order: 1,
    duration: 30,
    isPublished: true,
    isFree: true,
    createdAt: "2025-02-02T00:00:00.000Z",
    updatedAt: "2025-02-02T00:00:00.000Z",
  },
];

export function getMockLessonsForCourse(courseId: string): Lesson[] {
  if (courseId === detail011._id) return lessons011;
  if (courseId === detail012._id) return lessons012;
  return [];
}

const faqs011: CourseFaq[] = [
  {
    _id: "507f1f77bcf86cd799439501",
    question: "Are live classes included?",
    answer: "This track is self-paced with recorded lessons; live Q&A sessions are announced in the classroom.",
    order: 1,
  },
  {
    _id: "507f1f77bcf86cd799439502",
    question: "Can I download materials?",
    answer: "Yes, PDF notes are available for each chapter where noted by the instructor.",
    order: 2,
  },
];

const faqs012: CourseFaq[] = [
  {
    _id: "507f1f77bcf86cd799439601",
    question: "Do I need prior coding experience?",
    answer: "No — we start from the basics and build up.",
    order: 1,
  },
];

export function getMockFaqsForCourse(courseId: string): CourseFaq[] {
  if (courseId === detail011._id) return faqs011;
  if (courseId === detail012._id) return faqs012;
  return [];
}
