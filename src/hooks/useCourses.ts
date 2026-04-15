import { useState, useEffect, useCallback } from 'react';
import { Course, CourseListResponse, CourseStats, CourseSearchParams } from '@/types/course';

interface UseCoursesReturn {
  courses: Course[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  stats: CourseStats | null;
  fetchCourses: (params?: CourseSearchParams) => Promise<void>;
  createCourse: (courseData: any) => Promise<Course | null>;
  updateCourse: (id: string, courseData: any) => Promise<Course | null>;
  deleteCourse: (id: string) => Promise<boolean>;
  searchCourses: (query: string, params?: CourseSearchParams) => Promise<void>;
}

export const useCourses = (initialParams?: CourseSearchParams): UseCoursesReturn => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [stats, setStats] = useState<CourseStats | null>(null);

  const fetchCourses = useCallback(async (params: CourseSearchParams = {}) => {
    try {
      setLoading(true);
      setError(null);

      const searchParams = new URLSearchParams();
      
      if (params.page) searchParams.append('page', params.page.toString());
      if (params.limit) searchParams.append('limit', params.limit.toString());
      if (params.search) searchParams.append('search', params.search);
      if (params.category) searchParams.append('category', params.category);
      if (params.isPaid !== undefined) searchParams.append('isPaid', params.isPaid.toString());
      if (params.status !== undefined) searchParams.append('status', params.status);
      if (params.minPrice) searchParams.append('minPrice', params.minPrice.toString());
      if (params.maxPrice) searchParams.append('maxPrice', params.maxPrice.toString());
      if (params.sortBy) searchParams.append('sortBy', params.sortBy);
      if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);

      const response = await fetch(`/api/public/courses?${searchParams.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch courses');
      }

      setCourses(data.data.courses);
      setPagination(data.data.pagination);
      setStats(data.data.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch courses');
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createCourse = useCallback(async (courseData: any): Promise<Course | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(courseData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create course');
      }

      // Refresh the courses list
      await fetchCourses();
      
      return data.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create course');
      console.error('Error creating course:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchCourses]);

  const updateCourse = useCallback(async (id: string, courseData: any): Promise<Course | null> => {
    try {
      setLoading(true);
      setError(null);

      console.log('Hook: updateCourse called with:', { id, courseData });

      const response = await fetch(`/api/courses/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(courseData),
      });

      const data = await response.json();
      console.log('Hook: API response:', { status: response.status, data });
      console.log('Hook: Course data from API:', {
        _id: data.data?._id,
        title: data.data?.title,
        isPublished: data.data?.isPublished,
        isPaid: data.data?.isPaid
      });

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update course');
      }

      // Update the course in the local state
      setCourses(prev => prev.map(course => 
        course._id === id ? data.data : course
      ));
      
      console.log('Hook: Local state updated with data:', data.data);
      return data.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update course');
      console.error('Error updating course:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteCourse = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/courses/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete course');
      }

      // Remove the course from the local state
      setCourses(prev => prev.filter(course => course._id !== id));
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete course');
      console.error('Error deleting course:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const searchCourses = useCallback(async (query: string, params: CourseSearchParams = {}) => {
    try {
      setLoading(true);
      setError(null);

      const searchParams = new URLSearchParams();
      searchParams.append('q', query);
      
      if (params.page) searchParams.append('page', params.page.toString());
      if (params.limit) searchParams.append('limit', params.limit.toString());
      if (params.category) searchParams.append('category', params.category);
      if (params.isPaid !== undefined) searchParams.append('isPaid', params.isPaid.toString());
      if (params.status !== undefined) searchParams.append('status', params.status);
      if (params.minPrice) searchParams.append('minPrice', params.minPrice.toString());
      if (params.maxPrice) searchParams.append('maxPrice', params.maxPrice.toString());
      if (params.sortBy) searchParams.append('sortBy', params.sortBy);
      if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);

      const response = await fetch(`/api/courses/search?${searchParams.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to search courses');
      }

      setCourses(data.data.courses);
      setPagination(data.data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search courses');
      console.error('Error searching courses:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Note: fetchCourses should be called manually in components to avoid infinite loops

  return {
    courses,
    loading,
    error,
    pagination,
    stats,
    fetchCourses,
    createCourse,
    updateCourse,
    deleteCourse,
    searchCourses
  };
};

// Hook for course statistics
export const useCourseStats = () => {
  const [stats, setStats] = useState<CourseStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/courses/stats');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch course statistics');
      }

      setStats(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch course statistics');
      console.error('Error fetching course stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats
  };
};
