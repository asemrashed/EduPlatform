import { useState, useEffect } from 'react';
import { Exam } from '@/types/exam';

export function useExams() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/exams?limit=100');
        const data = await response.json();
        
        if (response.ok) {
          setExams(data.data.exams || []);
          setError(null);
        } else {
          setError(data.error || 'Failed to fetch exams');
        }
      } catch (err) {
        setError('Failed to fetch exams');
        console.error('Error fetching exams:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

  return { exams, loading, error };
}
