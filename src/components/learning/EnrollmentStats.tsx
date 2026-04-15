import React from 'react';
import { Enrollment, EnrollmentStats as EnrollmentStatsType } from '@/types/enrollment';
import { LuUsers as Users, LuBookOpen as BookOpen, LuTrendingUp as TrendingUp, LuDollarSign as DollarSign, LuCheck as CheckCircle, LuX as XCircle, LuClock as Clock, LuTriangleAlert as AlertCircle } from 'react-icons/lu';;

interface EnrollmentStatsProps {
  enrollments: Enrollment[];
  loading?: boolean;
  stats?: EnrollmentStatsType | null;
}

const EnrollmentStats: React.FC<EnrollmentStatsProps> = ({ enrollments, loading = false, stats: propStats }) => {
  const stats = React.useMemo(() => {
    // Use prop stats if available, otherwise calculate from enrollments
    if (propStats) {
      return propStats;
    }
    
    // Fallback to calculating from enrollments array
    const total = enrollments.length;
    const active = enrollments.filter(e => e.status === 'active').length;
    const completed = enrollments.filter(e => e.status === 'completed').length;
    const dropped = enrollments.filter(e => e.status === 'dropped').length;
    const suspended = enrollments.filter(e => e.status === 'suspended').length;
    
    const paid = enrollments.filter(e => e.paymentStatus === 'paid').length;
    const pending = enrollments.filter(e => e.paymentStatus === 'pending').length;
    const refunded = enrollments.filter(e => e.paymentStatus === 'refunded').length;
    const failed = enrollments.filter(e => e.paymentStatus === 'failed').length;
    
    const totalRevenue = enrollments
      .filter(e => e.paymentStatus === 'paid' && e.paymentAmount)
      .reduce((sum, e) => sum + (e.paymentAmount || 0), 0);
    
    const averageProgress = total > 0 
      ? enrollments.reduce((sum, e) => sum + e.progress, 0) / total 
      : 0;
    
    const completionRate = total > 0 ? (completed / total) * 100 : 0;
    const dropRate = total > 0 ? (dropped / total) * 100 : 0;

    return {
      total,
      active,
      completed,
      dropped,
      suspended,
      paid,
      pending,
      refunded,
      failed,
      totalRevenue,
      averageProgress,
      completionRate,
      dropRate
    };
  }, [enrollments]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Enrollments',
      value: stats.total,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Active Enrollments',
      value: stats.active,
      icon: Clock,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      title: 'Completed',
      value: stats.completed,
      icon: CheckCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200'
    },
    {
      title: 'Dropped',
      value: stats.dropped,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    },
    {
      title: 'Suspended',
      value: stats.suspended,
      icon: AlertCircle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    },
    {
      title: 'Paid Enrollments',
      value: stats.paid,
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      title: 'Pending Payments',
      value: stats.pending,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      icon: TrendingUp,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => (
          <div
            key={index}
            className={`bg-white rounded-lg border ${card.borderColor} p-4 hover:shadow-md transition-shadow`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {card.title}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {card.value}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${card.bgColor}`}>
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Progress and Rate Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Average Progress</h3>
            <TrendingUp className="h-5 w-5 text-gray-400" />
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${stats.averageProgress}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-gray-900">
              {stats.averageProgress.toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Completion Rate</h3>
            <CheckCircle className="h-5 w-5 text-gray-400" />
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${stats.completionRate}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-gray-900">
              {stats.completionRate.toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Drop Rate</h3>
            <XCircle className="h-5 w-5 text-gray-400" />
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-red-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${stats.dropRate}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-gray-900">
              {stats.dropRate.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Payment Status Breakdown */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Status Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">{stats.paid}</div>
            <div className="text-sm text-gray-600">Paid</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">{stats.pending}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600 mb-1">{stats.refunded}</div>
            <div className="text-sm text-gray-600">Refunded</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 mb-1">{stats.failed}</div>
            <div className="text-sm text-gray-600">Failed</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentStats;
