export interface Teacher {
  _id: string;
  email: string;
  phone?: string; // Phone number for teachers
  firstName: string;
  lastName: string;
  role: 'instructor';
  isActive: boolean;
  avatar?: string;
  address?: {
    fullAddress?: string;
  }; // Teacher address information
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  fullName?: string;
}

export interface TeacherFormData {
  phone: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  avatar?: string;
  address?: {
    fullAddress?: string;
  };
  password?: string;
}

export interface TeacherUpdateData {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
  avatar?: string;
  address?: {
    fullAddress?: string;
  };
}

export interface TeachersResponse {
  teachers: Teacher[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface TeacherFilters {
  search: string;
  status: 'all' | 'active' | 'inactive';
  page: number;
  limit: number;
}
