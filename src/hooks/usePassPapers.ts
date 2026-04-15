import { useState, useCallback } from 'react';
import { PassPaper, PassPaperFilters, CreatePassPaperDto, UpdatePassPaperDto } from '@/types/pass-paper';

export interface UsePassPapersReturn {
  // Data
  passPapers: PassPaper[];
  stats: any;
  loading: boolean;
  error: string | null;
  
  // Pagination
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  
  // Actions
  fetchPassPapers: (filters?: Partial<PassPaperFilters>) => Promise<void>;
  fetchStats: () => Promise<void>;
  createPassPaper: (data: CreatePassPaperDto) => Promise<PassPaper>;
  updatePassPaper: (id: string, data: UpdatePassPaperDto) => Promise<PassPaper>;
  deletePassPaper: (id: string) => Promise<void>;
  searchPassPapers: (query: string, filters?: Partial<PassPaperFilters>) => Promise<void>;
  
  // Utilities
  reset: () => void;
}

export const usePassPapers = (initialFilters: PassPaperFilters = {
  page: 1,
  limit: 10,
  search: '',
  sortBy: 'createdAt',
  sortOrder: 'desc'
}): UsePassPapersReturn => {
  const [passPapers, setPassPapers] = useState<PassPaper[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: initialFilters.page || 1,
    limit: initialFilters.limit || 10,
    total: 0,
    pages: 0
  });

  // Fetch pass papers
  const fetchPassPapers = useCallback(async (filters?: Partial<PassPaperFilters>) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      const currentFilters = { ...initialFilters, ...filters };
      
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
      
      const response = await fetch(`/api/pass-papers?${params}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch pass papers');
      }
      
      setPassPapers(data.passPapers);
      setPagination({
        page: data.pagination.page,
        limit: data.pagination.limit,
        total: data.pagination.total,
        pages: data.pagination.pages
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching pass papers:', err);
    } finally {
      setLoading(false);
    }
  }, [initialFilters]);

  // Fetch statistics
  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/pass-papers/stats');
      const data = await response.json();
      
      if (response.ok) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }, []);

  // Create pass paper
  const createPassPaper = useCallback(async (data: CreatePassPaperDto): Promise<PassPaper> => {
    try {
      const response = await fetch('/api/pass-papers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create pass paper');
      }
      
      return result.passPaper;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create pass paper';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Update pass paper
  const updatePassPaper = useCallback(async (id: string, data: UpdatePassPaperDto): Promise<PassPaper> => {
    try {
      const response = await fetch(`/api/pass-papers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update pass paper');
      }
      
      return result.passPaper;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update pass paper';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Delete pass paper
  const deletePassPaper = useCallback(async (id: string): Promise<void> => {
    try {
      const response = await fetch(`/api/pass-papers/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete pass paper');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete pass paper';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Search pass papers
  const searchPassPapers = useCallback(async (query: string, filters?: Partial<PassPaperFilters>) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      const searchFilters = { ...initialFilters, ...filters, search: query };
      
      Object.entries(searchFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
      
      const response = await fetch(`/api/pass-papers/search?${params}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to search pass papers');
      }
      
      setPassPapers(data.passPapers);
      setPagination({
        page: data.pagination.page,
        limit: data.pagination.limit,
        total: data.pagination.total,
        pages: data.pagination.pages
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      console.error('Error searching pass papers:', err);
    } finally {
      setLoading(false);
    }
  }, [initialFilters]);

  // Reset state
  const reset = useCallback(() => {
    setPassPapers([]);
    setStats(null);
    setLoading(false);
    setError(null);
    setPagination({
      page: initialFilters.page || 1,
      limit: initialFilters.limit || 10,
      total: 0,
      pages: 0
    });
  }, [initialFilters]);

  return {
    passPapers,
    stats,
    loading,
    error,
    pagination,
    fetchPassPapers,
    fetchStats,
    createPassPaper,
    updatePassPaper,
    deletePassPaper,
    searchPassPapers,
    reset
  };
};
