'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AttractiveInput } from '@/components/ui/attractive-input';
import { AttractiveTextarea } from '@/components/ui/attractive-textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LuClock as Clock, LuCheck as CheckCircle, LuX as XCircle, LuRefreshCw as RefreshCw, LuDollarSign as DollarSign, LuUser as User, LuBookOpen as BookOpen, LuTriangleAlert as AlertTriangle, LuLoader as Loader2, LuEye as Eye, LuArrowUpDown as ArrowUpDown } from 'react-icons/lu';;

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

interface RefundDataTableProps {
  payments: Payment[];
  loading: boolean;
  onRefund: (payment: Payment, refundData: { amount: number; reason: string; notes?: string }) => Promise<void>;
  onStatusCheck: (refundRefId: string) => Promise<void>;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  onPageChange?: (page: number) => void;
  variant?: 'table' | 'card';
}

export default function RefundDataTable({
  payments,
  loading,
  onRefund,
  onStatusCheck,
  pagination,
  onPageChange,
  variant = 'table'
}: RefundDataTableProps) {
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [refundLoading, setRefundLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

  const handleRefund = async (payment: Payment) => {
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
      
      await onRefund(payment, {
        amount,
        reason: refundReason,
        notes: adminNotes
      });

      setSuccess(`Refund initiated successfully for ${payment.student.firstName} ${payment.student.lastName}`);
      setSelectedPayment(null);
      setRefundAmount('');
      setRefundReason('');
      setAdminNotes('');
    } catch (err) {
      setError('Failed to process refund');
    } finally {
      setRefundLoading(null);
    }
  };

  const handleStatusCheck = async (refundRefId: string) => {
    try {
      await onStatusCheck(refundRefId);
      setSuccess('Refund status updated');
    } catch (err) {
      setError('Failed to check refund status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading payments...</span>
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <Card className="border-2 border-gray-200 shadow-md">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <DollarSign className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Payments Found</h3>
          <p className="text-gray-600 text-center">
            There are no payments available for refund processing at the moment.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'card') {
    return (
      <div className="space-y-4">
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {payments.map((payment) => (
          <Card key={payment._id} className="border-2 border-gray-200 shadow-md hover:shadow-lg transition-all duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      {payment.student.firstName} {payment.student.lastName}
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-600">
                      {payment.student.email}
                    </CardDescription>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-700">৳{payment.amount || 0}</div>
                  {payment.refundAmount && (
                    <div className="text-sm text-gray-600">
                      Refund: ৳{payment.refundAmount}
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">{payment.course.title}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(payment.completedAt).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Transaction ID:</span>
                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                      {payment.transactionId}
                    </span>
                  </div>
                  {payment.status === 'refunded' && payment.refundStatus ? (
                    getStatusBadge(payment.refundStatus)
                  ) : (
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      {payment.status}
                    </Badge>
                  )}
                </div>

                {payment.refundedAt && (
                  <div className="text-sm text-gray-600">
                    <div>Refunded: {new Date(payment.refundedAt).toLocaleDateString()}</div>
                    {payment.refundedBy && (
                      <div className="text-xs text-gray-500">
                        by {payment.refundedBy.firstName} {payment.refundedBy.lastName}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  {payment.status === 'success' && !payment.refundStatus && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedPayment(payment)}
                          className="border-2 border-blue-300 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200"
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
                        <div className="grid gap-6 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="student" className="text-right font-semibold">
                              Student
                            </Label>
                            <div className="col-span-3 text-sm text-gray-600">
                              {payment.student.firstName} {payment.student.lastName}
                            </div>
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="course" className="text-right font-semibold">
                              Course
                            </Label>
                            <div className="col-span-3 text-sm text-gray-600">{payment.course.title}</div>
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="amount" className="text-right font-semibold">
                              Amount
                            </Label>
                            <div className="col-span-3 text-sm font-semibold text-green-600">৳{payment.amount || 0}</div>
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="refund-amount" className="text-right font-semibold">
                              Refund Amount
                            </Label>
                            <div className="col-span-3">
                              <AttractiveInput
                                id="refund-amount"
                                type="number"
                                label="Refund Amount"
                                value={refundAmount}
                                onChange={(e) => setRefundAmount(e.target.value)}
                                placeholder={(payment.amount || 0).toString()}
                                max={payment.amount || 0}
                                min="0"
                                step="0.01"
                                variant="default"
                                colorScheme="primary"
                                size="md"
                                helperText={`Maximum refund amount: ৳${payment.amount || 0}`}
                                isInvalid={parseFloat(refundAmount) > (payment.amount || 0)}
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="reason" className="text-right font-semibold">
                              Reason
                            </Label>
                            <div className="col-span-3">
                              <AttractiveTextarea
                                id="reason"
                                label="Refund Reason"
                                value={refundReason}
                                onChange={(e) => setRefundReason(e.target.value)}
                                placeholder="Enter refund reason..."
                                variant="default"
                                colorScheme="primary"
                                size="md"
                                helperText="Please provide a clear reason for the refund"
                                isInvalid={!refundReason.trim()}
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="notes" className="text-right font-semibold">
                              Admin Notes
                            </Label>
                            <div className="col-span-3">
                              <AttractiveTextarea
                                id="notes"
                                label="Admin Notes"
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                placeholder="Internal notes (optional)..."
                                variant="default"
                                colorScheme="secondary"
                                size="md"
                                helperText="Internal notes for reference (optional)"
                              />
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            type="submit"
                            onClick={() => handleRefund(payment)}
                            disabled={refundLoading === payment._id}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
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
                      onClick={() => handleStatusCheck(payment.refundRefId || '')}
                      className="border-2 border-green-300 hover:border-green-400 hover:bg-green-50 transition-all duration-200"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Check Status
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full">
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

      <div className="border-2 border-gray-200 rounded-lg shadow-md overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="font-semibold text-gray-900">Student</TableHead>
              <TableHead className="font-semibold text-gray-900">Course</TableHead>
              <TableHead className="font-semibold text-gray-900">Amount</TableHead>
              <TableHead className="font-semibold text-gray-900">Transaction ID</TableHead>
              <TableHead className="font-semibold text-gray-900">Status</TableHead>
              <TableHead className="font-semibold text-gray-900">Date</TableHead>
              <TableHead className="font-semibold text-gray-900">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment._id} className="hover:bg-gray-50 transition-colors">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {payment.student.firstName} {payment.student.lastName}
                      </div>
                      <div className="text-sm text-gray-600">
                        {payment.student.email}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-gray-500" />
                    <span className="font-medium text-gray-900">{payment.course.title}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-bold text-green-700">৳{payment.amount || 0}</div>
                  {payment.refundAmount && (
                    <div className="text-sm text-gray-600">
                      Refund: ৳{payment.refundAmount}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                    {payment.transactionId}
                  </span>
                </TableCell>
                <TableCell>
                  {payment.status === 'refunded' && payment.refundStatus ? (
                    getStatusBadge(payment.refundStatus)
                  ) : (
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      {payment.status}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="text-sm text-gray-900">
                    {payment.refundedAt ? (
                      <div>
                        <div>Refunded: {new Date(payment.refundedAt).toLocaleDateString()}</div>
                        {payment.refundedBy && (
                          <div className="text-xs text-gray-500">
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
                  <div className="flex gap-2">
                    {payment.status === 'success' && !payment.refundStatus && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedPayment(payment)}
                            className="border-2 border-blue-300 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200"
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
                              <AttractiveInput
                                id="refund-amount"
                                type="number"
                                label="Refund Amount"
                                value={refundAmount}
                                onChange={(e) => setRefundAmount(e.target.value)}
                                placeholder={(payment.amount || 0).toString()}
                                max={payment.amount || 0}
                                min="0"
                                step="0.01"
                                variant="default"
                                colorScheme="primary"
                                size="md"
                                helperText={`Maximum refund amount: ৳${payment.amount || 0}`}
                                isInvalid={parseFloat(refundAmount) > (payment.amount || 0)}
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="reason" className="text-right">
                                Reason
                              </Label>
                              <AttractiveTextarea
                                id="reason"
                                label="Refund Reason"
                                value={refundReason}
                                onChange={(e) => setRefundReason(e.target.value)}
                                placeholder="Enter refund reason..."
                                variant="default"
                                colorScheme="primary"
                                size="md"
                                helperText="Please provide a clear reason for the refund"
                                isInvalid={!refundReason.trim()}
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="notes" className="text-right">
                                Admin Notes
                              </Label>
                              <AttractiveTextarea
                                id="notes"
                                label="Admin Notes"
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                placeholder="Internal notes (optional)..."
                                variant="default"
                                colorScheme="secondary"
                                size="md"
                                helperText="Internal notes for reference (optional)"
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              type="submit"
                              onClick={() => handleRefund(payment)}
                              disabled={refundLoading === payment._id}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
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
                        onClick={() => handleStatusCheck(payment.refundRefId || '')}
                        className="border-2 border-green-300 hover:border-green-400 hover:bg-green-50 transition-all duration-200"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Check Status
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-600">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="border-2 border-gray-300 hover:border-gray-400 transition-all duration-200"
            >
              Previous
            </Button>
            <span className="flex items-center px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded">
              Page {pagination.page} of {pagination.pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
              className="border-2 border-gray-300 hover:border-gray-400 transition-all duration-200"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
