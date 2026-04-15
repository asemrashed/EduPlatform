export interface LessonAttachment {
  name: string;
  url: string;
  type: string;
  size?: number;
}

export interface Lesson {
  _id: string;
  title: string;
  description?: string;
  content?: string;
  chapter: string;
  course: string;
  order: number;
  duration?: number;
  youtubeVideoId?: string;
  videoUrl?: string;
  videoDuration?: number;
  attachments?: LessonAttachment[];
  isPublished: boolean;
  isFree: boolean;
  completionCount?: number;
  averageCompletionTime?: number;
  createdAt: string;
  updatedAt: string;
  youtubeEmbedUrl?: string;
  youtubeThumbnailUrl?: string;
  youtubeWatchUrl?: string;
}

export interface CreateLessonRequest {
  title: string;
  description?: string;
  content?: string;
  chapter: string;
  course: string;
  order: number;
  duration?: number;
  youtubeVideoId?: string;
  videoUrl?: string;
  videoDuration?: number;
  attachments?: LessonAttachment[];
  isPublished?: boolean;
  isFree?: boolean;
}

export interface UpdateLessonRequest {
  title?: string;
  description?: string;
  content?: string;
  order?: number;
  duration?: number;
  youtubeVideoId?: string;
  videoUrl?: string;
  videoDuration?: number;
  attachments?: LessonAttachment[];
  isPublished?: boolean;
  isFree?: boolean;
}

export interface LessonFilters {
  chapter?: string;
  course?: string;
  isPublished?: boolean;
  isFree?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'title' | 'order' | 'duration' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface LessonStats {
  total: number;
  published: number;
  unpublished: number;
  free: number;
  paid: number;
  averageDuration: number;
  totalDuration: number;
  withVideo: number;
  withYouTubeVideo: number;
  withAttachments: number;
}

export interface LessonPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface LessonListResponse {
  lessons: Lesson[];
  pagination: LessonPagination;
  stats: LessonStats;
}

export interface LessonSearchParams {
  chapter?: string;
  course?: string;
  isPublished?: boolean;
  isFree?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'title' | 'order' | 'duration' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}
