import { useState, useEffect } from 'react';

interface DashboardData {
  overview: {
    totalStudents: number;
    totalCourses: number;
    totalEnrollments: number;
    totalTeachers: number;
    activeStudents: number;
    completedCourses: number;
    newEnrollmentsThisWeek: number;
    enrollmentChange: number;
    courseCompletionsThisWeek: number;
    completionChange: number;
  };
  leaderboard: Array<{
    _id: string;
    name: string;
    email: string;
    completedCourses: number;
    averageProgress: number;
    totalTimeSpent: number;
  }>;
  recentEnrollments: Array<{
    id: string;
    studentName: string;
    studentEmail: string;
    courseTitle: string;
    enrolledAt: string;
    status: string;
  }>;
  courseStats: Array<{
    id: string;
    title: string;
    price: number;
    status: string;
    enrollmentCount: number;
    completionRate: number;
    createdAt: string;
  }>;
  paymentStats: {
    totalRevenue: number;
    totalTransactions: number;
    successfulPayments: number;
    pendingPayments: number;
    failedPayments: number;
    successRate: number;
  };
  examStats: Array<{
    id: string;
    title: string;
    totalAttempts: number;
    averageScore: number;
    createdAt: string;
  }>;
  trends: {
    enrollments: Array<{ _id: string; count: number }>;
    completions: Array<{ _id: string; count: number }>;
  };
}

interface UseDashboardReturn {
  data: DashboardData | null;
  loading: boolean;
  refreshing: boolean;
  lastUpdated: Date;
  error: string | null;
  refresh: () => Promise<void>;
  setAutoRefresh: (enabled: boolean) => void;
  autoRefresh: boolean;
}

export const useDashboard = (autoRefreshInterval = 5 * 60 * 1000): UseDashboardReturn => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response = await fetch('/api/admin/dashboard');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const dashboardData = await response.json();
      setData(dashboardData);
      setLastUpdated(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch dashboard data';
      setError(errorMessage);
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const refresh = async () => {
    await fetchData(true);
  };

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, []);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchData(true);
    }, autoRefreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, autoRefreshInterval]);

  return {
    data,
    loading,
    refreshing,
    lastUpdated,
    error,
    refresh,
    setAutoRefresh,
    autoRefresh
  };
};
