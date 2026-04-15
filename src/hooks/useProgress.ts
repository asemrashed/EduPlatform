import { useState, useEffect, useCallback } from 'react';
import { UserProgress, CourseProgress, CreateUserProgressRequest, UpdateUserProgressRequest, ProgressFilters, ProgressListResponse, CourseProgressListResponse } from '@/types/progress';

interface UseProgressReturn {
  // User Progress
  userProgress: UserProgress[];
  courseProgress: CourseProgress[];
  loading: boolean;
  error: string | null;
  
  // Actions
  createUserProgress: (data: CreateUserProgressRequest) => Promise<UserProgress | null>;
  updateUserProgress: (id: string, data: UpdateUserProgressRequest) => Promise<UserProgress | null>;
  deleteUserProgress: (id: string) => Promise<boolean>;
  markLessonComplete: (courseId: string, lessonId: string, timeSpent?: number) => Promise<boolean>;
  markLessonIncomplete: (courseId: string, lessonId: string) => Promise<boolean>;
  updateLessonProgress: (courseId: string, lessonId: string, progressPercentage: number, timeSpent?: number) => Promise<boolean>;
  
  // Course Progress Actions
  createCourseProgress: (courseId: string) => Promise<CourseProgress | null>;
  getCourseProgress: (courseId: string) => Promise<CourseProgress | null>;
  
  // Fetch functions
  fetchUserProgress: (filters?: ProgressFilters) => Promise<void>;
  fetchCourseProgress: (filters?: ProgressFilters) => Promise<void>;
  refreshProgress: () => Promise<void>;
}

export function useProgress(): UseProgressReturn {
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [courseProgress, setCourseProgress] = useState<CourseProgress[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user progress
  const fetchUserProgress = useCallback(async (filters?: ProgressFilters) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters?.user) params.append('user', filters.user);
      if (filters?.course) params.append('course', filters.course);
      if (filters?.lesson) params.append('lesson', filters.lesson);
      if (filters?.isCompleted !== undefined) params.append('isCompleted', filters.isCompleted.toString());
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.sortBy) params.append('sortBy', filters.sortBy);
      if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

      const response = await fetch(`/api/progress?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setUserProgress(data.data.progress);
      } else {
        setError(data.error || 'Failed to fetch progress');
      }
    } catch (err) {
      setError('Failed to fetch progress');
      console.error('Error fetching user progress:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch course progress
  const fetchCourseProgress = useCallback(async (filters?: ProgressFilters) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters?.user) params.append('user', filters.user);
      if (filters?.course) params.append('course', filters.course);
      if (filters?.isCompleted !== undefined) params.append('isCompleted', filters.isCompleted.toString());
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.sortBy) params.append('sortBy', filters.sortBy);
      if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

      const response = await fetch(`/api/course-progress?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setCourseProgress(data.data.courseProgress);
      } else {
        setError(data.error || 'Failed to fetch course progress');
      }
    } catch (err) {
      setError('Failed to fetch course progress');
      console.error('Error fetching course progress:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create user progress
  const createUserProgress = useCallback(async (data: CreateUserProgressRequest): Promise<UserProgress | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        setUserProgress(prev => [result.data, ...prev]);
        return result.data;
      } else {
        setError(result.error || 'Failed to create progress');
        return null;
      }
    } catch (err) {
      setError('Failed to create progress');
      console.error('Error creating user progress:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update user progress
  const updateUserProgress = useCallback(async (id: string, data: UpdateUserProgressRequest): Promise<UserProgress | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/progress/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        setUserProgress(prev => 
          prev.map(progress => progress._id === id ? result.data : progress)
        );
        return result.data;
      } else {
        setError(result.error || 'Failed to update progress');
        return null;
      }
    } catch (err) {
      setError('Failed to update progress');
      console.error('Error updating user progress:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete user progress
  const deleteUserProgress = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/progress/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        setUserProgress(prev => prev.filter(progress => progress._id !== id));
        return true;
      } else {
        setError(result.error || 'Failed to delete progress');
        return false;
      }
    } catch (err) {
      setError('Failed to delete progress');
      console.error('Error deleting user progress:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Mark lesson as complete
  const markLessonComplete = useCallback(async (courseId: string, lessonId: string, timeSpent?: number): Promise<boolean> => {
    try {
      const result = await createUserProgress({
        user: '', // Will be set by the API based on session
        course: courseId,
        lesson: lessonId,
        isCompleted: true,
        progressPercentage: 100,
        timeSpent: timeSpent || 0,
      });

      return result !== null;
    } catch (err) {
      console.error('Error marking lesson complete:', err);
      return false;
    }
  }, [createUserProgress]);

  // Mark lesson as incomplete
  const markLessonIncomplete = useCallback(async (courseId: string, lessonId: string): Promise<boolean> => {
    try {
      // Find existing progress
      const existingProgress = userProgress.find(
        p => p.course === courseId && p.lesson === lessonId
      );

      if (existingProgress) {
        const result = await updateUserProgress(existingProgress._id, {
          isCompleted: false,
          progressPercentage: 0,
        });

        return result !== null;
      }

      return false;
    } catch (err) {
      console.error('Error marking lesson incomplete:', err);
      return false;
    }
  }, [userProgress, updateUserProgress]);

  // Update lesson progress
  const updateLessonProgress = useCallback(async (courseId: string, lessonId: string, progressPercentage: number, timeSpent?: number): Promise<boolean> => {
    try {
      // Find existing progress
      const existingProgress = userProgress.find(
        p => p.course === courseId && p.lesson === lessonId
      );

      if (existingProgress) {
        const result = await updateUserProgress(existingProgress._id, {
          progressPercentage,
          timeSpent,
        });

        return result !== null;
      } else {
        // Create new progress
        const result = await createUserProgress({
          user: '', // Will be set by the API based on session
          course: courseId,
          lesson: lessonId,
          isCompleted: progressPercentage === 100,
          progressPercentage,
          timeSpent: timeSpent || 0,
        });

        return result !== null;
      }
    } catch (err) {
      console.error('Error updating lesson progress:', err);
      return false;
    }
  }, [userProgress, updateUserProgress, createUserProgress]);

  // Create course progress
  const createCourseProgress = useCallback(async (courseId: string): Promise<CourseProgress | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/course-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ course: courseId }),
      });

      const result = await response.json();

      if (result.success) {
        setCourseProgress(prev => [result.data, ...prev]);
        return result.data;
      } else {
        setError(result.error || 'Failed to create course progress');
        return null;
      }
    } catch (err) {
      setError('Failed to create course progress');
      console.error('Error creating course progress:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get course progress
  const getCourseProgress = useCallback(async (courseId: string): Promise<CourseProgress | null> => {
    try {
      const response = await fetch(`/api/course-progress?course=${courseId}`);
      const data = await response.json();

      if (data.success && data.data.courseProgress.length > 0) {
        return data.data.courseProgress[0];
      }

      return null;
    } catch (err) {
      console.error('Error getting course progress:', err);
      return null;
    }
  }, []);

  // Refresh all progress
  const refreshProgress = useCallback(async () => {
    await Promise.all([
      fetchUserProgress(),
      fetchCourseProgress(),
    ]);
  }, [fetchUserProgress, fetchCourseProgress]);

  return {
    userProgress,
    courseProgress,
    loading,
    error,
    createUserProgress,
    updateUserProgress,
    deleteUserProgress,
    markLessonComplete,
    markLessonIncomplete,
    updateLessonProgress,
    createCourseProgress,
    getCourseProgress,
    fetchUserProgress,
    fetchCourseProgress,
    refreshProgress,
  };
}
