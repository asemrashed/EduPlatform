import { useState, useEffect, useCallback } from 'react';
import { Chapter, CreateChapterRequest, UpdateChapterRequest, ChapterFilters, ChapterListResponse, ChapterSearchParams } from '@/types/chapter';

interface UseChaptersReturn {
  chapters: Chapter[];
  loading: boolean;
  reordering: boolean;
  deleting: boolean;
  updating: boolean;
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
  };
  
  // Actions
  createChapter: (data: CreateChapterRequest) => Promise<Chapter | null>;
  updateChapter: (id: string, data: UpdateChapterRequest) => Promise<Chapter | null>;
  deleteChapter: (id: string) => Promise<boolean>;
  reorderChapters: (courseId: string, chapterOrders: { chapterId: string; order: number }[]) => Promise<boolean>;
  
  // Fetch functions
  fetchChapters: (filters?: ChapterFilters) => Promise<void>;
  searchChapters: (params: ChapterSearchParams) => Promise<void>;
  refreshChapters: () => Promise<void>;
  
  // Utility functions
  getChapterById: (id: string) => Chapter | undefined;
  getChaptersByCourse: (courseId: string) => Chapter[];
}

export function useChapters(): UseChaptersReturn {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [updating, setUpdating] = useState(false);
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
  });

  // Fetch chapters
  const fetchChapters = useCallback(async (filters?: ChapterFilters) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters?.course) params.append('course', filters.course);
      if (filters?.isPublished !== undefined) params.append('isPublished', filters.isPublished.toString());
      if (filters?.search) params.append('search', filters.search);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.sortBy) params.append('sortBy', filters.sortBy);
      if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

      const response = await fetch(`/api/chapters?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setChapters(data.data.chapters);
        setPagination(data.data.pagination);
        setStats(data.data.stats);
      } else {
        setError(data.error || 'Failed to fetch chapters');
      }
    } catch (err) {
      setError('Failed to fetch chapters');
      console.error('Error fetching chapters:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Search chapters
  const searchChapters = useCallback(async (params: ChapterSearchParams) => {
    try {
      setLoading(true);
      setError(null);

      const searchParams = new URLSearchParams();
      if (params.course) searchParams.append('course', params.course);
      if (params.isPublished !== undefined) searchParams.append('isPublished', params.isPublished.toString());
      if (params.search) searchParams.append('search', params.search);
      if (params.page) searchParams.append('page', params.page.toString());
      if (params.limit) searchParams.append('limit', params.limit.toString());
      if (params.sortBy) searchParams.append('sortBy', params.sortBy);
      if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);

      const response = await fetch(`/api/chapters/search?${searchParams.toString()}`);
      const data = await response.json();

      if (data.success) {
        setChapters(data.data.chapters);
        setPagination(data.data.pagination);
        setStats(data.data.stats);
      } else {
        setError(data.error || 'Failed to search chapters');
      }
    } catch (err) {
      setError('Failed to search chapters');
      console.error('Error searching chapters:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create chapter
  const createChapter = useCallback(async (data: CreateChapterRequest): Promise<Chapter | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/chapters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        setChapters(prev => [result.data, ...prev]);
        setStats(prev => ({
          ...prev,
          total: prev.total + 1,
          [result.data.isPublished ? 'published' : 'unpublished']: 
            prev[result.data.isPublished ? 'published' : 'unpublished'] + 1,
        }));
        return result.data;
      } else {
        setError(result.error || 'Failed to create chapter');
        return null;
      }
    } catch (err) {
      setError('Failed to create chapter');
      console.error('Error creating chapter:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update chapter
  const updateChapter = useCallback(async (id: string, data: UpdateChapterRequest): Promise<Chapter | null> => {
    try {
      setUpdating(true);
      setError(null);

      const response = await fetch(`/api/chapters/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        setChapters(prev => 
          prev.map(chapter => chapter._id === id ? result.data : chapter)
        );
        return result.data;
      } else {
        setError(result.error || 'Failed to update chapter');
        return null;
      }
    } catch (err) {
      setError('Failed to update chapter');
      console.error('Error updating chapter:', err);
      return null;
    } finally {
      setUpdating(false);
    }
  }, []);

  // Delete chapter
  const deleteChapter = useCallback(async (id: string): Promise<boolean> => {
    try {
      setDeleting(true);
      setError(null);

      const response = await fetch(`/api/chapters/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        const deletedChapter = chapters.find(c => c._id === id);
        setChapters(prev => prev.filter(chapter => chapter._id !== id));
        if (deletedChapter) {
          setStats(prev => ({
            ...prev,
            total: prev.total - 1,
            [deletedChapter.isPublished ? 'published' : 'unpublished']: 
              Math.max(0, prev[deletedChapter.isPublished ? 'published' : 'unpublished'] - 1),
          }));
        }
        return true;
      } else {
        setError(result.error || 'Failed to delete chapter');
        return false;
      }
    } catch (err) {
      setError('Failed to delete chapter');
      console.error('Error deleting chapter:', err);
      return false;
    } finally {
      setDeleting(false);
    }
  }, [chapters]);

  // Get chapter by ID
  const getChapterById = useCallback((id: string): Chapter | undefined => {
    return chapters.find(chapter => chapter._id === id);
  }, [chapters]);

  // Get chapters by course
  const getChaptersByCourse = useCallback((courseId: string): Chapter[] => {
    return chapters.filter(chapter => chapter.course === courseId);
  }, [chapters]);

  // Reorder chapters
  const reorderChapters = useCallback(async (courseId: string, chapterOrders: { chapterId: string; order: number }[]): Promise<boolean> => {
    setReordering(true);
    setError(null);

    try {
      const response = await fetch('/api/chapters/reorder', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId,
          chapterOrders,
        }),
      });

      const result = await response.json();

      if (result.success) {
        console.log('Reorder API success, updating chapters:', chapterOrders);
        // Update local state with new order
        setChapters(prev => {
          const updatedChapters = [...prev];
          chapterOrders.forEach(({ chapterId, order }) => {
            const chapterIndex = updatedChapters.findIndex(c => c._id === chapterId);
            if (chapterIndex !== -1) {
              updatedChapters[chapterIndex] = {
                ...updatedChapters[chapterIndex],
                order,
              };
            }
          });
          // Sort by order to ensure proper sequence
          const sortedChapters = updatedChapters.sort((a, b) => a.order - b.order);
          console.log('Updated chapters order:', sortedChapters.map(c => ({ id: c._id, title: c.title, order: c.order })));
          return sortedChapters;
        });
        return true;
      } else {
        setError(result.error || 'Failed to reorder chapters');
        return false;
      }
    } catch (err) {
      setError('Failed to reorder chapters');
      console.error('Error reordering chapters:', err);
      return false;
    } finally {
      setReordering(false);
    }
  }, []);

  // Refresh chapters
  const refreshChapters = useCallback(async () => {
    await fetchChapters();
  }, [fetchChapters]);

  // Initial fetch
  useEffect(() => {
    fetchChapters();
  }, [fetchChapters]);

  return {
    chapters,
    loading,
    reordering,
    deleting,
    updating,
    error,
    pagination,
    stats,
    createChapter,
    updateChapter,
    deleteChapter,
    reorderChapters,
    fetchChapters,
    searchChapters,
    refreshChapters,
    getChapterById,
    getChaptersByCourse,
  };
}
