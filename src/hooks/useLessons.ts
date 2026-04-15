import { useState, useEffect, useCallback } from 'react';
import { Lesson, CreateLessonRequest, UpdateLessonRequest, LessonFilters, LessonListResponse, LessonSearchParams } from '@/types/lesson';

interface UseLessonsReturn {
  lessons: Lesson[];
  loading: boolean;
  creating: boolean;
  deleting: boolean;
  reordering: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  stats: {
    total: number;
    published: number;
    unpublished: number;
    free: number;
    paid: number;
    withVideo: number;
    withYouTubeVideo: number;
    withAttachments: number;
  };
  
  // Actions
  createLesson: (data: CreateLessonRequest) => Promise<Lesson | null>;
  updateLesson: (id: string, data: UpdateLessonRequest) => Promise<Lesson | null>;
  deleteLesson: (id: string) => Promise<boolean>;
  reorderLessons: (chapterId: string, lessonOrders: { lessonId: string; order: number }[]) => Promise<boolean>;
  
  // Fetch functions
  fetchLessons: (filters?: LessonFilters) => Promise<void>;
  searchLessons: (params: LessonSearchParams) => Promise<void>;
  refreshLessons: () => Promise<void>;
  
  // Utility functions
  getLessonById: (id: string) => Lesson | undefined;
  getLessonsByChapter: (chapterId: string) => Lesson[];
  getLessonsByCourse: (courseId: string) => Lesson[];
}

export function useLessons(): UseLessonsReturn {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    unpublished: 0,
    free: 0,
    paid: 0,
    withVideo: 0,
    withYouTubeVideo: 0,
    withAttachments: 0,
  });

  // Fetch lessons
  const fetchLessons = useCallback(async (filters?: LessonFilters) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters?.chapter) params.append('chapter', filters.chapter);
      if (filters?.course) params.append('course', filters.course);
      if (filters?.isPublished !== undefined) params.append('isPublished', filters.isPublished.toString());
      if (filters?.isFree !== undefined) params.append('isFree', filters.isFree.toString());
      if (filters?.search) params.append('search', filters.search);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.sortBy) params.append('sortBy', filters.sortBy);
      if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

      const response = await fetch(`/api/lessons?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setLessons(data.data.lessons);
        setPagination(data.data.pagination);
        setStats(data.data.stats);
      } else {
        setError(data.error || 'Failed to fetch lessons');
      }
    } catch (err) {
      setError('Failed to fetch lessons');
      console.error('Error fetching lessons:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Search lessons
  const searchLessons = useCallback(async (params: LessonSearchParams) => {
    try {
      setLoading(true);
      setError(null);

      const searchParams = new URLSearchParams();
      if (params.chapter) searchParams.append('chapter', params.chapter);
      if (params.course) searchParams.append('course', params.course);
      if (params.isPublished !== undefined) searchParams.append('isPublished', params.isPublished.toString());
      if (params.isFree !== undefined) searchParams.append('isFree', params.isFree.toString());
      if (params.search) searchParams.append('search', params.search);
      if (params.page) searchParams.append('page', params.page.toString());
      if (params.limit) searchParams.append('limit', params.limit.toString());
      if (params.sortBy) searchParams.append('sortBy', params.sortBy);
      if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);

      const response = await fetch(`/api/lessons/search?${searchParams.toString()}`);
      const data = await response.json();

      if (data.success) {
        setLessons(data.data.lessons);
        setPagination(data.data.pagination);
        setStats(data.data.stats);
      } else {
        setError(data.error || 'Failed to search lessons');
      }
    } catch (err) {
      setError('Failed to search lessons');
      console.error('Error searching lessons:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create lesson
  const createLesson = useCallback(async (data: CreateLessonRequest): Promise<Lesson | null> => {
    try {
      setCreating(true);
      setError(null);

      const response = await fetch('/api/lessons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        setLessons(prev => [result.data, ...prev]);
        setStats(prev => ({
          ...prev,
          total: prev.total + 1,
          [result.data.isPublished ? 'published' : 'unpublished']: 
            prev[result.data.isPublished ? 'published' : 'unpublished'] + 1,
          [result.data.isFree ? 'free' : 'paid']: 
            prev[result.data.isFree ? 'free' : 'paid'] + 1,
          withVideo: result.data.videoUrl || result.data.youtubeVideoId ? prev.withVideo + 1 : prev.withVideo,
          withYouTubeVideo: result.data.youtubeVideoId ? prev.withYouTubeVideo + 1 : prev.withYouTubeVideo,
          withAttachments: result.data.attachments?.length ? prev.withAttachments + 1 : prev.withAttachments,
        }));
        return result.data;
      } else {
        const errorMessage = result.error || 'Failed to create lesson';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create lesson';
      setError(errorMessage);
      console.error('Error creating lesson:', err);
      throw err instanceof Error ? err : new Error(errorMessage);
    } finally {
      setCreating(false);
    }
  }, []);

  // Update lesson
  const updateLesson = useCallback(async (id: string, data: UpdateLessonRequest): Promise<Lesson | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/lessons/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        setLessons(prev => 
          prev.map(lesson => lesson._id === id ? result.data : lesson)
        );
        return result.data;
      } else {
        const errorMessage = result.error || 'Failed to update lesson';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update lesson';
      setError(errorMessage);
      console.error('Error updating lesson:', err);
      throw err instanceof Error ? err : new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete lesson
  const deleteLesson = useCallback(async (id: string): Promise<boolean> => {
    try {
      setDeleting(true);
      setError(null);

      const response = await fetch(`/api/lessons/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        const deletedLesson = lessons.find(l => l._id === id);
        setLessons(prev => prev.filter(lesson => lesson._id !== id));
        if (deletedLesson) {
          setStats(prev => ({
            ...prev,
            total: prev.total - 1,
            [deletedLesson.isPublished ? 'published' : 'unpublished']: 
              Math.max(0, prev[deletedLesson.isPublished ? 'published' : 'unpublished'] - 1),
            [deletedLesson.isFree ? 'free' : 'paid']: 
              Math.max(0, prev[deletedLesson.isFree ? 'free' : 'paid'] - 1),
            withVideo: deletedLesson.videoUrl || deletedLesson.youtubeVideoId ? Math.max(0, prev.withVideo - 1) : prev.withVideo,
            withYouTubeVideo: deletedLesson.youtubeVideoId ? Math.max(0, prev.withYouTubeVideo - 1) : prev.withYouTubeVideo,
            withAttachments: deletedLesson.attachments?.length ? Math.max(0, prev.withAttachments - 1) : prev.withAttachments,
          }));
        }
        return true;
      } else {
        setError(result.error || 'Failed to delete lesson');
        return false;
      }
    } catch (err) {
      setError('Failed to delete lesson');
      console.error('Error deleting lesson:', err);
      return false;
    } finally {
      setDeleting(false);
    }
  }, [lessons]);

  // Reorder lessons
  const reorderLessons = useCallback(async (chapterId: string, lessonOrders: { lessonId: string; order: number }[]): Promise<boolean> => {
    setReordering(true);
    setError(null);

    try {
      const response = await fetch('/api/lessons/reorder', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chapterId,
          lessonOrders,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Update local state with new order
        setLessons(prev => {
          const updatedLessons = [...prev];
          lessonOrders.forEach(({ lessonId, order }) => {
            const lessonIndex = updatedLessons.findIndex(l => l._id === lessonId);
            if (lessonIndex !== -1) {
              updatedLessons[lessonIndex] = {
                ...updatedLessons[lessonIndex],
                order,
              };
            }
          });
          // Sort by order to ensure proper sequence
          const sortedLessons = updatedLessons.sort((a, b) => a.order - b.order);
          console.log('Updated lessons order:', sortedLessons.map(l => ({ id: l._id, title: l.title, order: l.order })));
          return sortedLessons;
        });
        return true;
      } else {
        setError(result.error || 'Failed to reorder lessons');
        return false;
      }
    } catch (err) {
      setError('Failed to reorder lessons');
      console.error('Error reordering lessons:', err);
      return false;
    } finally {
      setReordering(false);
    }
  }, []);

  // Get lesson by ID
  const getLessonById = useCallback((id: string): Lesson | undefined => {
    return lessons.find(lesson => lesson._id === id);
  }, [lessons]);

  // Get lessons by chapter
  const getLessonsByChapter = useCallback((chapterId: string): Lesson[] => {
    return lessons.filter(lesson => lesson.chapter === chapterId);
  }, [lessons]);

  // Get lessons by course
  const getLessonsByCourse = useCallback((courseId: string): Lesson[] => {
    return lessons.filter(lesson => lesson.course === courseId);
  }, [lessons]);

  // Refresh lessons
  const refreshLessons = useCallback(async () => {
    await fetchLessons();
  }, [fetchLessons]);

  // Initial fetch
  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  return {
    lessons,
    loading,
    creating,
    deleting,
    reordering,
    error,
    pagination,
    stats,
    createLesson,
    updateLesson,
    deleteLesson,
    reorderLessons,
    fetchLessons,
    searchLessons,
    refreshLessons,
    getLessonById,
    getLessonsByChapter,
    getLessonsByCourse,
  };
}
