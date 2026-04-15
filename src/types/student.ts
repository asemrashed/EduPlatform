export interface Student {
  _id: string;
  email: string;
  phone?: string; // Phone number for students
  firstName: string;
  lastName: string;
  role: 'student';
  isActive: boolean;
  avatar?: string;
  studentId?: string; // Optional student ID number
  enrollmentDate?: Date;
  grade?: string; // Optional grade level
  parentPhone?: string; // Optional parent/guardian phone number
  address?: {
    fullAddress?: string;
  }; // Student address information
  totalEnrolledAmount?: number; // Total amount enrolled in courses
  enrollmentCount?: number; // Number of courses enrolled
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  fullName?: string;
}

export interface StudentFormData {
  phone: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  avatar?: string;
  parentPhone?: string;
  address?: {
    fullAddress?: string;
  };
  password?: string;
}

export interface StudentUpdateData {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
  avatar?: string;
  studentId?: string;
  grade?: string;
  parentPhone?: string;
  address?: {
    fullAddress?: string;
  };
}

export interface StudentsResponse {
  students: Student[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface StudentFilters {
  search: string;
  status: 'all' | 'active' | 'inactive';
  grade?: string;
  page: number;
  limit: number;
}
