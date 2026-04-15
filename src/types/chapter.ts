export interface Chapter {
  _id: string;
  title: string;
  description?: string;
  course: string;
  order: number;
  isPublished: boolean;
  lessonCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateChapterRequest {
  title: string;
  description?: string;
  course: string;
  order: number;
  isPublished?: boolean;
}

export interface UpdateChapterRequest {
  title?: string;
  description?: string;
  order?: number;
  isPublished?: boolean;
}

export interface ChapterFilters {
  course?: string;
  isPublished?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'title' | 'order' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface ChapterStats {
  total: number;
  published: number;
  unpublished: number;
  averageLessonsPerChapter: number;
  totalLessons: number;
}

export interface ChapterPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ChapterListResponse {
  chapters: Chapter[];
  pagination: ChapterPagination;
  stats: ChapterStats;
}

export interface ChapterSearchParams {
  course?: string;
  isPublished?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'title' | 'order' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}
