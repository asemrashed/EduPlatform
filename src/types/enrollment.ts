import type { User } from "./user";
import type { Course } from "./course";

export interface Enrollment {
  _id: string;
  student: string;
  course: string;
  enrolledAt: string;
  status: 
    | "enrolled"
    | "in_progress"
    | "completed"
    | "suspended"
    | "dropped";
  progress: number;
  lastAccessedAt?: string;
  completedAt?: string;
  droppedAt?: string;
  suspendedAt?: string;
  paymentStatus: "pending" | "paid" | "refunded" | "failed";
  paymentAmount?: number;
  paymentMethod?: string;
  paymentId?: string;
  notes?: string;
  certificateIssued?: boolean;
  certificateIssuedAt?: string;
  certificateUrl?: string;
  createdAt: string;
  updatedAt: string;
  studentInfo?: Pick<User, "_id" | "firstName" | "lastName" | "email" | "avatar">;
  courseLuInfo?: Pick<
    Course,
    "_id" | "title" | "description" | "thumbnailUrl" | "price" | "category" | "isPaid"
  >;
  courseInfo?: Pick<
    Course,
    "_id" | "title" | "description" | "thumbnailUrl" | "price" | "category" | "isPaid"
  >;
}

export interface CreateEnrollmentRequest {
  course: string;
  student?: string;
  paymentStatus?: "pending" | "paid" | "refunded" | "failed";
  paymentAmount?: number;
  paymentMethod?: string;
  paymentId?: string;
  notes?: string;
}

export interface UpdateEnrollmentRequest {
  status?: 
  | "enrolled"
    | "in_progress"
    | "completed"
    | "suspended"
    | "dropped";
  progress?: number;
  paymentStatus?: "pending" | "paid" | "refunded" | "failed";
  paymentAmount?: number;
  paymentMethod?: string;
  paymentId?: string;
  notes?: string;
  certificateIssued?: boolean;
  certificateIssuedAt?: string;
  certificateUrl?: string;
}

export interface EnrollmentFilters {
  student?: string;
  course?: string;
  status?: 
    | "enrolled"
    | "in_progress"
    | "completed"
    | "suspended"
    | "dropped";
  paymentStatus?: "pending" | "paid" | "refunded" | "failed";
  enrolledAfter?: string;
  enrolledBefore?: string;
  progressMin?: number;
  progressMax?: number;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: "enrolledAt" | "progress" | "status" | "paymentStatus";
  sortOrder?: "asc" | "desc";
}

export interface EnrollmentStats {
  total: number;
  active: number;
  completed: number;
  dropped: number;
  suspended: number;
  paid: number;
  pending: number;
  refunded: number;
  failed: number;
  totalRevenue: number;
  averageProgress: number;
  completionRate: number;
  dropRate: number;
}

export interface EnrollmentPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface EnrollmentListResponse {
  enrollments: Enrollment[];
  pagination: EnrollmentPagination;
  stats: EnrollmentStats;
}

export interface EnrollmentSearchParams {
  search?: string;
  student?: string;
  course?: string;
  status?: string;
  paymentStatus?: string;
  enrolledAfter?: string;
  enrolledBefore?: string;
  progressMin?: string;
  progressMax?: string;
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: string;
}

export interface CourseEnrollmentStats {
  courseId: string;
  courseTitle: string;
  totalEnrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
  completionRate: number;
  averageProgress: number;
  revenue: number;
}

export interface StudentEnrollmentStats {
  studentId: string;
  studentName: string;
  totalEnrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
  completionRate: number;
  averageProgress: number;
  totalSpent: number;
}
