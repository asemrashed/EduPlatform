import { useState, useCallback } from "react";
import {
  PastPaper,
  PastPaperFilters,
  CreatePastPaperDto,
  UpdatePastPaperDto,
} from "@/types/past-paper";

export interface UsePastPapersReturn {
  pastPapers: PastPaper[];
  stats: unknown;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  fetchPastPapers: (filters?: Partial<PastPaperFilters>) => Promise<void>;
  fetchStats: () => Promise<void>;
  createPastPaper: (data: CreatePastPaperDto) => Promise<PastPaper>;
  updatePastPaper: (id: string, data: UpdatePastPaperDto) => Promise<PastPaper>;
  deletePastPaper: (id: string) => Promise<void>;
  searchPastPapers: (
    query: string,
    filters?: Partial<PastPaperFilters>,
  ) => Promise<void>;
  reset: () => void;
}

export const usePastPapers = (
  initialFilters: PastPaperFilters = {
    page: 1,
    limit: 10,
    search: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  },
): UsePastPapersReturn => {
  const [pastPapers, setPastPapers] = useState<PastPaper[]>([]);
  const [stats, setStats] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: initialFilters.page || 1,
    limit: initialFilters.limit || 10,
    total: 0,
    pages: 0,
  });

  const fetchPastPapers = useCallback(
    async (filters?: Partial<PastPaperFilters>) => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        const currentFilters = { ...initialFilters, ...filters };

        Object.entries(currentFilters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.append(key, value.toString());
          }
        });

        const response = await fetch(`/api/past-papers?${params}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch past papers");
        }

        const list =
          data?.data?.pastPapers ?? data?.pastPapers ?? [];
        setPastPapers(Array.isArray(list) ? list : []);
        setPagination(
          data?.pagination ?? {
            page: currentFilters.page || 1,
            limit: currentFilters.limit || 10,
            total: Array.isArray(list) ? list.length : 0,
            pages: 1,
          },
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error("Error fetching past papers:", err);
      } finally {
        setLoading(false);
      }
    },
    [initialFilters],
  );

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch("/api/past-papers/stats");
      const data = await response.json();

      if (response.ok) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  }, []);

  const createPastPaper = useCallback(
    async (data: CreatePastPaperDto): Promise<PastPaper> => {
      const response = await fetch("/api/past-papers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create past paper");
      }

      return result.pastPaper;
    },
    [],
  );

  const updatePastPaper = useCallback(
    async (id: string, data: UpdatePastPaperDto): Promise<PastPaper> => {
      const response = await fetch(`/api/past-papers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update past paper");
      }

      return result.pastPaper;
    },
    [],
  );

  const deletePastPaper = useCallback(async (id: string): Promise<void> => {
    const response = await fetch(`/api/past-papers/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to delete past paper");
    }
  }, []);

  const searchPastPapers = useCallback(
    async (query: string, filters?: Partial<PastPaperFilters>) => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        const searchFilters = { ...initialFilters, ...filters, search: query };

        Object.entries(searchFilters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.append(key, value.toString());
          }
        });

        const response = await fetch(`/api/past-papers/search?${params}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to search past papers");
        }

        setPastPapers(data.pastPapers);
        setPagination({
          page: data.pagination.page,
          limit: data.pagination.limit,
          total: data.pagination.total,
          pages: data.pagination.pages,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Search failed");
        console.error("Error searching past papers:", err);
      } finally {
        setLoading(false);
      }
    },
    [initialFilters],
  );

  const reset = useCallback(() => {
    setPastPapers([]);
    setStats(null);
    setLoading(false);
    setError(null);
    setPagination({
      page: initialFilters.page || 1,
      limit: initialFilters.limit || 10,
      total: 0,
      pages: 0,
    });
  }, [initialFilters]);

  return {
    pastPapers,
    stats,
    loading,
    error,
    pagination,
    fetchPastPapers,
    fetchStats,
    createPastPaper,
    updatePastPaper,
    deletePastPaper,
    searchPastPapers,
    reset,
  };
};
