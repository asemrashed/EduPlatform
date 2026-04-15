'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AttractiveInput } from '@/components/ui/attractive-input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import RefundDataTable from '@/components/RefundDataTable';
import { LuLoader as Loader2, LuRefreshCw as RefreshCw, LuSearch as Search, LuDollarSign as DollarSign, LuTriangleAlert as AlertTriangle, LuCheck as CheckCircle, LuClock as Clock, LuX as XCircle } from 'react-icons/lu';;

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

interface RefundManagementSimpleProps {
  className?: string;
}

export default function RefundManagementSimple({ className }: RefundManagementSimpleProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState<RefundStats | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch eligible payments for refund
  const fetchEligiblePayments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/payment/eligible-refunds');
      const data = await response.json();
      
      if (data.success) {
        setPayments(data.data.eligiblePayments);
        setStats(data.data.statistics);
      } else {
        setError('Failed to fetch eligible payments');
      }
    } catch (err) {
      setError('Failed to fetch eligible payments');
    } finally {
      setLoading(false);
    }
  };

  // Fetch refund history
  const fetchRefundHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/payment/refund-history');
      const data = await response.json();
      
      if (data.success) {
        setPayments(data.data.refundedPayments);
        setStats(data.data.statistics);
      } else {
        setError('Failed to fetch refund history');
      }
    } catch (err) {
      setError('Failed to fetch refund history');
    } finally {
      setLoading(false);
    }
  };

  // Process refund
  const processRefund = async (payment: Payment, refundData: { amount: number; reason: string; notes?: string }) => {
    try {
      const response = await fetch('/api/payment/refund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId: payment._id,
          refundAmount: refundData.amount,
          refundReason: refundData.reason,
          adminNotes: refundData.notes
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess(`Refund initiated successfully. Refund ID: ${data.data.refundRefId}`);
        fetchEligiblePayments(); // Refresh the list
      } else {
        setError(data.error || 'Failed to process refund');
      }
    } catch (err) {
      setError('Failed to process refund');
    }
  };

  // Check refund status
  const checkRefundStatus = async (refundRefId: string) => {
    try {
      const response = await fetch(`/api/payment/refund?refundRefId=${refundRefId}`);
      const data = await response.json();
      
      if (data.success) {
        setSuccess(`Refund status: ${data.data.status}`);
      } else {
        setError('Failed to check refund status');
      }
    } catch (err) {
      setError('Failed to check refund status');
    }
  };

  useEffect(() => {
    fetchEligiblePayments();
  }, []);

  const filteredPayments = payments.filter(payment =>
    payment.student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Refund Management</h2>
          <p className="text-muted-foreground">
            Manage payment refunds and track refund status
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchEligiblePayments} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Eligible Refunds
          </Button>
          <Button onClick={fetchRefundHistory} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refund History
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-2 border-blue-200 shadow-md hover:shadow-lg transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Refunds</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">{stats.totalRefunds}</div>
              <p className="text-xs text-muted-foreground">
                Total refund transactions
              </p>
            </CardContent>
          </Card>
          <Card className="border-2 border-green-200 shadow-md hover:shadow-lg transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">৳{(stats.totalRefundAmount || 0).toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Total refunded amount
              </p>
            </CardContent>
          </Card>
          <Card className="border-2 border-purple-200 shadow-md hover:shadow-lg transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Refund</CardTitle>
              <DollarSign className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-700">৳{(stats.averageRefundAmount || 0).toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Average refund amount
              </p>
            </CardContent>
          </Card>
          <Card className="border-2 border-orange-200 shadow-md hover:shadow-lg transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Processing</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-700">{stats.processing}</div>
              <p className="text-xs text-muted-foreground">
                Refunds in progress
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <Card className="border-2 border-gray-200 shadow-md">
        <CardHeader>
          <CardTitle>Payments</CardTitle>
          <CardDescription>
            {payments.length > 0 ? `${payments.length} payments found` : 'No payments found'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="flex-1">
              <AttractiveInput
                type="text"
                label="Search Payments"
                placeholder="Search by student name, email, course, or transaction ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon="search"
                variant="default"
                colorScheme="primary"
                size="md"
                helperText="Find payments by typing keywords"
              />
            </div>
          </div>

          {error && (
            <Alert className="mb-4 border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          <RefundDataTable
            payments={filteredPayments}
            loading={loading}
            onRefund={processRefund}
            onStatusCheck={checkRefundStatus}
            variant="table"
          />
        </CardContent>
      </Card>
    </div>
  );
}
