import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface Payment {
  _id: string;
  transactionId: string;
  student: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  course: {
    _id: string;
    title: string;
    thumbnailUrl?: string;
    price: number;
  };
  enrollment: {
    _id: string;
    status: string;
    progress: number;
  };
  amount: number;
  currency: string;
  status: 'pending' | 'success' | 'failed' | 'cancelled' | 'refunded';
  paymentMethod?: string;
  paymentGateway: string;
  initiatedAt: string;
  completedAt?: string;
  failedAt?: string;
  refundedAt?: string;
  valId?: string;
  bankTranId?: string;
  cardType?: string;
  cardIssuer?: string;
  tranDate?: string;
}

interface PaymentStats {
  total: number;
  pending: number;
  success: number;
  failed: number;
  cancelled: number;
  refunded: number;
  totalAmount: number;
  averageAmount: number;
}

interface UsePaymentsOptions {
  page?: number;
  limit?: number;
  status?: string;
  studentId?: string;
  courseId?: string;
}

interface UsePaymentsReturn {
  payments: Payment[];
  stats: PaymentStats | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null;
  refetch: () => Promise<void>;
  getPaymentDetails: (transactionId: string) => Promise<Payment | null>;
}

export function usePayments(options: UsePaymentsOptions = {}): UsePaymentsReturn {
  const { data: session } = useSession();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null>(null);

  const {
    page = 1,
    limit = 10,
    status,
    studentId,
    courseId
  } = options;

  const fetchPayments = async () => {
    if (!session?.user) {
      setError('Authentication required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(status && { status }),
        ...(studentId && { studentId }),
        ...(courseId && { courseId })
      });

      const response = await fetch(`/api/payments?${params}`);
      const result = await response.json();

      if (result.success) {
        setPayments(result.data.payments);
        setStats(result.data.stats);
        setPagination(result.data.pagination);
      } else {
        setError(result.error || 'Failed to fetch payments');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getPaymentDetails = async (transactionId: string): Promise<Payment | null> => {
    if (!session?.user) {
      setError('Authentication required');
      return null;
    }

    try {
      const response = await fetch(`/api/payments/${transactionId}`);
      const result = await response.json();

      if (result.success) {
        return result.data;
      } else {
        setError(result.error || 'Failed to fetch payment details');
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [session, page, limit, status, studentId, courseId]);

  return {
    payments,
    stats,
    loading,
    error,
    pagination,
    refetch: fetchPayments,
    getPaymentDetails
  };
}

// Hook for getting payments by student (for student dashboard)
export function useStudentPayments(studentId?: string) {
  return usePayments({ 
    studentId: studentId || undefined,
    limit: 20 
  });
}

// Hook for getting payments by course (for course analytics)
export function useCoursePayments(courseId?: string) {
  return usePayments({ 
    courseId: courseId || undefined,
    limit: 20 
  });
}

// Hook for getting recent successful payments (for admin dashboard)
export function useRecentPayments(limit: number = 10) {
  return usePayments({ 
    status: 'success',
    limit 
  });
}
