import { useState, useEffect } from 'react';

interface RefundRequest {
  paymentId: string;
  refundAmount?: number;
  refundReason: string;
  adminNotes?: string;
}

interface RefundResponse {
  success: boolean;
  data?: {
    refundRefId: string;
    refundTransactionId: string;
    refundAmount: number;
    status: string;
    message: string;
  };
  error?: string;
}

interface RefundStatusResponse {
  success: boolean;
  data?: {
    refundRefId: string;
    status: string;
    initiatedOn?: string;
    refundedOn?: string;
    bankTranId?: string;
    transId?: string;
  };
  error?: string;
}

interface Payment {
  _id: string;
  transactionId: string;
  amount: number;
  currency: string;
  status: string;
  refundStatus?: string;
  refundAmount?: number;
  refundReason?: string;
  refundedAt?: string;
  completedAt: string;
  student: {
    firstName: string;
    lastName: string;
    email: string;
  };
  course: {
    title: string;
    price: number;
  };
  refundedBy?: {
    firstName: string;
    lastName: string;
  };
}

interface RefundStats {
  totalRefunds: number;
  totalRefundAmount: number;
  averageRefundAmount: number;
  initiated: number;
  processing: number;
  refunded: number;
  failed: number;
}

export function useRefunds() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Process a refund
  const processRefund = async (refundData: RefundRequest): Promise<RefundResponse> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/payment/refund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(refundData),
      });

      const data = await response.json();
      
      if (!data.success) {
        setError(data.error || 'Failed to process refund');
        return { success: false, error: data.error };
      }

      return { success: true, data: data.data };
    } catch (err) {
      const errorMessage = 'Failed to process refund';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Check refund status
  const checkRefundStatus = async (refundRefId: string): Promise<RefundStatusResponse> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/payment/refund?refundRefId=${refundRefId}`);
      const data = await response.json();
      
      if (!data.success) {
        setError(data.error || 'Failed to check refund status');
        return { success: false, error: data.error };
      }

      return { success: true, data: data.data };
    } catch (err) {
      const errorMessage = 'Failed to check refund status';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    processRefund,
    checkRefundStatus,
    clearError: () => setError(null),
  };
}

export function useEligibleRefunds() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<RefundStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEligiblePayments = async (page = 1, limit = 10, search = '') => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
      });

      const response = await fetch(`/api/payment/eligible-refunds?${params}`);
      const data = await response.json();
      
      if (!data.success) {
        setError(data.error || 'Failed to fetch eligible payments');
        return;
      }

      setPayments(data.data.eligiblePayments);
      setStats(data.data.statistics);
    } catch (err) {
      setError('Failed to fetch eligible payments');
    } finally {
      setLoading(false);
    }
  };

  return {
    payments,
    stats,
    loading,
    error,
    fetchEligiblePayments,
    clearError: () => setError(null),
  };
}

export function useRefundHistory() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<RefundStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRefundHistory = async (page = 1, limit = 10, status = '') => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(status && { status }),
      });

      const response = await fetch(`/api/payment/refund-history?${params}`);
      const data = await response.json();
      
      if (!data.success) {
        setError(data.error || 'Failed to fetch refund history');
        return;
      }

      setPayments(data.data.refundedPayments);
      setStats(data.data.statistics);
    } catch (err) {
      setError('Failed to fetch refund history');
    } finally {
      setLoading(false);
    }
  };

  return {
    payments,
    stats,
    loading,
    error,
    fetchRefundHistory,
    clearError: () => setError(null),
  };
}
