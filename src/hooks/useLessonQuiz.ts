import { useCallback, useState } from 'react';

export interface LessonQuizQuestionInput {
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation?: string;
  isActive?: boolean;
}

export interface LessonQuizQuestionView {
  _id: string;
  lesson: string;
  course: string;
  question: string;
  options: string[];
  explanation?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export function useLessonQuiz() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestions = useCallback(async (lessonId: string): Promise<LessonQuizQuestionView[]> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/lessons/${lessonId}/quiz`, { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.error || 'Failed to load questions');
      return data.data as LessonQuizQuestionView[];
    } catch (e: any) {
      setError(e.message || 'Failed to load questions');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const bulkCreate = useCallback(async (lessonId: string, questions: LessonQuizQuestionInput[]) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/lessons/${lessonId}/quiz/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.error || 'Failed to create questions');
      return data.data as LessonQuizQuestionView[];
    } catch (e: any) {
      setError(e.message || 'Failed to create questions');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, fetchQuestions, bulkCreate };
}


