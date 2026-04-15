'use client';

import { useState, useEffect } from 'react';
import { useAppSelector } from '@/lib/hooks';
import { AdminRoleShell } from '@/components/role-area/AdminRoleShell';
import PageSection from '@/components/PageSection';
import WelcomeSection from '@/components/WelcomeSection';
import AdminPageWrapper from '@/components/AdminPageWrapper';
import RefundManagementSimple from '@/components/RefundManagementSimple';
import { Button } from '@/components/ui/button';
import { AttractiveInput } from '@/components/ui/attractive-input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { LuRefreshCw as RefreshCw, LuSearch as Search, LuX as X, LuDollarSign as DollarSign, LuFilter as Filter, LuTag as Tag, LuCalendar as Calendar, LuArrowUpDown as ArrowUpDown, LuSettings as Settings, LuUser as User, LuTriangleAlert as AlertTriangle, LuCheck as CheckCircle, LuClock as Clock, LuX as XCircle } from 'react-icons/lu';;
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

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

function RefundsPageContent() {
  const { user } = useAppSelector((state) => state.auth);
  
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    page: 1,
    limit: 10,
    status: 'all' as 'all' | 'eligible' | 'refunded',
    sortBy: 'completedAt' as 'completedAt' | 'amount' | 'student',
    sortOrder: 'desc' as 'asc' | 'desc'
  });
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [stats, setStats] = useState<RefundStats | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchEligiblePayments = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: filters.page.toString(),
        limit: filters.limit.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.sortBy && { sortBy: filters.sortBy }),
        ...(filters.sortOrder && { sortOrder: filters.sortOrder }),
      });

      const response = await fetch(`/api/payment/eligible-refunds?${queryParams}`);
      const data = await response.json();

      if (response.ok) {
        setPayments(data.data.eligiblePayments || []);
        setPagination(data.data.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          pages: 0
        });
        setStats(data.data.statistics);
      } else {
        setError('Failed to fetch eligible payments');
      }
    } catch (error) {
      setError('Failed to fetch eligible payments');
    } finally {
      setLoading(false);
    }
  };

  const fetchRefundHistory = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: filters.page.toString(),
        limit: filters.limit.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.sortBy && { sortBy: filters.sortBy }),
        ...(filters.sortOrder && { sortOrder: filters.sortOrder }),
      });

      const response = await fetch(`/api/payment/refund-history?${queryParams}`);
      const data = await response.json();

      if (response.ok) {
        setPayments(data.data.refundedPayments || []);
        setPagination(data.data.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          pages: 0
        });
        setStats(data.data.statistics);
      } else {
        setError('Failed to fetch refund history');
      }
    } catch (error) {
      setError('Failed to fetch refund history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (filters.status === 'refunded') {
      fetchRefundHistory();
    } else {
      fetchEligiblePayments();
    }
  }, [filters]);

  const handleSearchChange = (searchValue: string) => {
    setSearch(searchValue);
    setFilters(prev => ({ ...prev, search: searchValue, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({
      ...prev,
      page
    }));
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      page: 1,
      limit: 10,
      status: 'all',
      sortBy: 'completedAt',
      sortOrder: 'desc'
    });
    setSearch('');
    setShowFilterDrawer(false);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status !== 'all') count++;
    if (filters.sortBy !== 'completedAt') count++;
    if (filters.sortOrder !== 'desc') count++;
    return count;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'initiated':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700"><Clock className="w-3 h-3 mr-1" />Initiated</Badge>;
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
    <AdminRoleShell>
      <main className="relative z-10 p-2 sm:p-4">
        {/* Welcome Section */}
        <WelcomeSection 
          title="Refund Management"
          description="Process payment refunds and track refund status for student payments"
        />

        {/* Refund Statistics */}
        {stats && (
          <PageSection 
            title="Refund Statistics"
            className="mb-2 sm:mb-4"
          >
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="border-2 shadow-md hover:shadow-lg transition-all duration-200" style={{
                borderColor: 'rgba(123, 44, 191, 0.2)',
              }}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Refunds</CardTitle>
                  <DollarSign className="h-4 w-4" style={{ color: '#7B2CBF' }} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" style={{ color: '#7B2CBF' }}>{stats.totalRefunds}</div>
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
          </PageSection>
        )}

        {/* Filter Actions */}
        <PageSection 
          title="Refund Management"
          className="mb-2 sm:mb-4"
          actions={
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <Button 
                onClick={() => setShowFilterDrawer(true)}
                variant="outline"
                className="flex items-center gap-2 border-2 transition-all duration-200 font-semibold"
                style={{
                  borderColor: '#7B2CBF',
                  backgroundColor: 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#A855F7';
                  e.currentTarget.style.backgroundColor = 'rgba(123, 44, 191, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#7B2CBF';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <Settings className="w-4 h-4" style={{ color: '#7B2CBF' }} />
                <span>Advanced Filters</span>
                {getActiveFiltersCount() > 0 && (
                  <span className="text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center font-bold animate-pulse" style={{
                    background: "linear-gradient(135deg, #EC4899 0%, #A855F7 100%)",
                  }}>
                    {getActiveFiltersCount()}
                  </span>
                )}
              </Button>
              {getActiveFiltersCount() > 0 && (
                <Button 
                  onClick={clearFilters}
                  variant="outline"
                  className="flex items-center gap-2 border-2 border-red-300 hover:border-red-400 hover:bg-red-50 transition-all duration-200 font-semibold"
                >
                  <X className="w-4 h-4 text-red-600" />
                  <span>Clear Filters</span>
                </Button>
              )}
              <Button 
                onClick={fetchEligiblePayments}
                variant="outline"
                className="flex items-center gap-2 border-2 border-green-300 hover:border-green-400 hover:bg-green-50 transition-all duration-200 font-semibold"
              >
                <RefreshCw className="w-4 h-4 text-green-600" />
                <span>Eligible Refunds</span>
              </Button>
              <Button 
                onClick={fetchRefundHistory}
                variant="outline"
                className="flex items-center gap-2 border-2 border-purple-300 hover:border-purple-400 hover:bg-purple-50 transition-all duration-200 font-semibold"
              >
                <RefreshCw className="w-4 h-4 text-purple-600" />
                <span>Refund History</span>
              </Button>
            </div>
          }
        >
          <div className="text-sm text-gray-600">
            Manage payment refunds, process new refunds, and track refund status.
          </div>
        </PageSection>

        {/* Refund Management Component */}
        <PageSection 
          title="Refund Management"
          description="Process payment refunds and track refund status"
          className="mb-2 sm:mb-4"
        >
          <div className="w-full overflow-hidden">
            <RefundManagementSimple />
          </div>
        </PageSection>

        {/* Advanced Filters Drawer */}
        <Sheet open={showFilterDrawer} onOpenChange={setShowFilterDrawer}>
          <SheetContent side="right" className="w-full sm:max-w-md border-l-2" style={{
            backgroundColor: '#FAFAFA',
            borderColor: 'rgba(123, 44, 191, 0.2)',
          }}>
            <SheetHeader className="bg-white rounded-lg p-4 sm:p-6 shadow-sm" style={{
              border: '1px solid rgba(123, 44, 191, 0.1)',
            }}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1 flex items-center gap-2">
                    <Settings className="w-5 h-5" style={{ color: '#7B2CBF' }} />
                    Advanced Filters
                  </h3>
                  <p className="text-sm text-gray-600">
                    Filter and sort refunds to find exactly what you're looking for
                  </p>
                </div>
              </div>
            </SheetHeader>
            
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {/* Search Input */}
              <div>
                <AttractiveInput
                  type="text"
                  label="Search Payments"
                  placeholder="Search by student name, email, course, or transaction ID..."
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  icon="search"
                  variant="default"
                  colorScheme="primary"
                  size="md"
                  helperText="Find payments by typing keywords"
                />
              </div>
              
              {/* Status Filter */}
              <div className="bg-white rounded-lg p-3 shadow-md hover:shadow-lg transition-all duration-200" style={{
                border: '1px solid rgba(123, 44, 191, 0.2)',
              }}>
                <label className="flex text-sm font-semibold text-foreground mb-2 items-center gap-2">
                  <Tag className="w-4 h-4" style={{ color: '#7B2CBF' }} />
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full h-10 px-3 py-2 border-2 rounded-lg bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all duration-200 font-medium text-sm"
                  style={{
                    borderColor: '#7B2CBF',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#A855F7'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = '#7B2CBF'}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#A855F7';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(123, 44, 191, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#7B2CBF';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <option value="all">All Status</option>
                  <option value="eligible">Eligible for Refund</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>

              {/* Sort Options */}
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-orange-200 shadow-md hover:shadow-lg transition-all duration-200">
                <label className="flex text-sm font-semibold text-foreground mb-2 items-center gap-2">
                  <ArrowUpDown className="w-4 h-4 text-orange-600" />
                  Sort By
                </label>
                <div className="space-y-3">
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="w-full h-10 px-3 py-2 border-2 border-orange-300 hover:border-orange-400 focus:border-orange-500 focus:ring-orange-500/20 focus:shadow-lg focus:shadow-orange-500/10 rounded-lg bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all duration-200 font-medium text-sm"
                  >
                    <option value="completedAt">Date Completed</option>
                    <option value="amount">Amount</option>
                    <option value="student">Student Name</option>
                  </select>
                  <select
                    value={filters.sortOrder}
                    onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                    className="w-full h-10 px-3 py-2 border-2 border-orange-300 hover:border-orange-400 focus:border-orange-500 focus:ring-orange-500/20 focus:shadow-lg focus:shadow-orange-500/10 rounded-lg bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all duration-200 font-medium text-sm"
                  >
                    <option value="desc">Descending</option>
                    <option value="asc">Ascending</option>
                  </select>
                </div>
              </div>
            </div>

            <SheetFooter className="flex flex-col gap-2 bg-white rounded-lg p-4 sm:p-6 shadow-sm" style={{
              border: '1px solid rgba(123, 44, 191, 0.1)',
            }}>
              <div className="flex gap-2 w-full">
                <Button 
                  onClick={clearFilters}
                  variant="outline"
                  className="flex-1 border-2 transition-all duration-200 font-semibold"
                  style={{
                    borderColor: '#EF4444',
                    backgroundColor: 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#DC2626';
                    e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#EF4444';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <X className="w-4 h-4 mr-2" style={{ color: '#EF4444' }} />
                  Clear All
                </Button>
                <Button 
                  onClick={() => setShowFilterDrawer(false)}
                  className="flex-1 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                  style={{
                    background: "linear-gradient(135deg, #EC4899 0%, #A855F7 100%)",
                    boxShadow: "0 4px 15px rgba(236, 72, 153, 0.3)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "linear-gradient(135deg, #DB2777 0%, #9333EA 100%)";
                    e.currentTarget.style.boxShadow = "0 6px 20px rgba(236, 72, 153, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "linear-gradient(135deg, #EC4899 0%, #A855F7 100%)";
                    e.currentTarget.style.boxShadow = "0 4px 15px rgba(236, 72, 153, 0.3)";
                  }}
                >
                  Apply Filters
                </Button>
              </div>
              <p className="text-xs text-center font-medium" style={{ color: '#7B2CBF' }}>
                {getActiveFiltersCount() > 0 
                  ? `${getActiveFiltersCount()} filter${getActiveFiltersCount() > 1 ? 's' : ''} active`
                  : 'No filters applied'
                }
              </p>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </main>
    </AdminRoleShell>
  );
}

export default function RefundsPage() {
  return (
    <AdminPageWrapper>
      <RefundsPageContent />
    </AdminPageWrapper>
  );
}
