'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  refundRefId?: string;
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

interface RefundManagementProps {
  className?: string;
}

export default function RefundManagement({ className }: RefundManagementProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refundLoading, setRefundLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState<RefundStats | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [refundReason, setRefundReason] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
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
  const processRefund = async (payment: Payment) => {
    if (!refundReason.trim()) {
      setError('Refund reason is required');
      return;
    }

    const amount = refundAmount ? parseFloat(refundAmount) : (payment.amount || 0);
    if (amount <= 0 || amount > (payment.amount || 0)) {
      setError('Invalid refund amount');
      return;
    }

    try {
      setRefundLoading(payment._id);
      setError('');
      
      const response = await fetch('/api/payment/refund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId: payment._id,
          refundAmount: amount,
          refundReason: refundReason,
          adminNotes: adminNotes
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess(`Refund initiated successfully. Refund ID: ${data.data.refundRefId}`);
        setSelectedPayment(null);
        setRefundReason('');
        setRefundAmount('');
        setAdminNotes('');
        fetchEligiblePayments(); // Refresh the list
      } else {
        setError(data.error || 'Failed to process refund');
      }
    } catch (err) {
      setError('Failed to process refund');
    } finally {
      setRefundLoading(null);
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'initiated':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700"><Clock className="w-3 h-3 mr-1" />Initiated</Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700"><RefreshCw className="w-3 h-3 mr-1" />Processing</Badge>;
      case 'refunded':
        return <Badge variant="outline" className="bg-green-50 text-green-700"><CheckCircle className="w-3 h-3 mr-1" />Refunded</Badge>;
      case 'failed':
        return <Badge variant="outline" className="bg-red-50 text-red-700"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

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
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Refunds</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRefunds}</div>
              <p className="text-xs text-muted-foreground">
                Total refund transactions
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">৳{(stats.totalRefundAmount || 0).toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Total refunded amount
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Refund</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">৳{(stats.averageRefundAmount || 0).toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Average refund amount
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Processing</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.processing}</div>
              <p className="text-xs text-muted-foreground">
                Refunds in progress
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Payments</CardTitle>
          <CardDescription>
            {payments.length > 0 ? `${payments.length} payments found` : 'No payments found'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by student name, email, course, or transaction ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {error && (
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment._id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {payment.student.firstName} {payment.student.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {payment.student.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{payment.course.title}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">৳{payment.amount || 0}</div>
                      {payment.refundAmount && (
                        <div className="text-sm text-muted-foreground">
                          Refund: ৳{payment.refundAmount}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-mono text-sm">{payment.transactionId}</div>
                    </TableCell>
                    <TableCell>
                      {payment.status === 'refunded' && payment.refundStatus ? (
                        getStatusBadge(payment.refundStatus)
                      ) : (
                        <Badge variant="outline">{payment.status}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {payment.refundedAt ? (
                          <div>
                            <div>Refunded: {new Date(payment.refundedAt).toLocaleDateString()}</div>
                            {payment.refundedBy && (
                              <div className="text-muted-foreground">
                                by {payment.refundedBy.firstName} {payment.refundedBy.lastName}
                              </div>
                            )}
                          </div>
                        ) : (
                          new Date(payment.completedAt).toLocaleDateString()
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {payment.status === 'success' && !payment.refundStatus && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedPayment(payment)}
                            >
                              Process Refund
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>Process Refund</DialogTitle>
                              <DialogDescription>
                                Initiate a refund for this payment. This action cannot be undone.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="student" className="text-right">
                                  Student
                                </Label>
                                <div className="col-span-3">
                                  {payment.student.firstName} {payment.student.lastName}
                                </div>
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="course" className="text-right">
                                  Course
                                </Label>
                                <div className="col-span-3">{payment.course.title}</div>
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="amount" className="text-right">
                                  Amount
                                </Label>
                                <div className="col-span-3">৳{payment.amount || 0}</div>
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="refund-amount" className="text-right">
                                  Refund Amount
                                </Label>
                                <Input
                                  id="refund-amount"
                                  type="number"
                                  value={refundAmount}
                                  onChange={(e) => setRefundAmount(e.target.value)}
                                  placeholder={(payment.amount || 0).toString()}
                                  max={payment.amount || 0}
                                  min="0"
                                  step="0.01"
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="reason" className="text-right">
                                  Reason
                                </Label>
                                <Textarea
                                  id="reason"
                                  value={refundReason}
                                  onChange={(e) => setRefundReason(e.target.value)}
                                  placeholder="Enter refund reason..."
                                  className="col-span-3"
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="notes" className="text-right">
                                  Admin Notes
                                </Label>
                                <Textarea
                                  id="notes"
                                  value={adminNotes}
                                  onChange={(e) => setAdminNotes(e.target.value)}
                                  placeholder="Internal notes (optional)..."
                                  className="col-span-3"
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                type="submit"
                                onClick={() => processRefund(payment)}
                                disabled={refundLoading === payment._id}
                              >
                                {refundLoading === payment._id ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Processing...
                                  </>
                                ) : (
                                  'Process Refund'
                                )}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}
                      {payment.refundStatus && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => checkRefundStatus(payment.refundRefId || '')}
                        >
                          Check Status
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
