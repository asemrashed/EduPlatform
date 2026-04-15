import React from 'react';
import DataTable, { Column, Action } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Enrollment } from '@/types/enrollment';
import { LuPencil as Edit, LuTrash2 as Trash2, LuEye as Eye, LuUser as User, LuBookOpen as BookOpen, LuCalendar as Calendar, LuDollarSign as DollarSign, LuTrendingUp as TrendingUp } from 'react-icons/lu';;
import { format, formatDistanceToNow } from 'date-fns';

interface EnrollmentDataTableProps {
  enrollments: Enrollment[];
  loading: boolean;
  onEdit: (enrollment: Enrollment) => void;
  onDelete: (enrollment: Enrollment) => void;
  onView?: (enrollment: Enrollment) => void;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  onPageChange: (page: number) => void;
  variant?: 'table' | 'cards' | 'list';
}

const EnrollmentDataTable: React.FC<EnrollmentDataTableProps> = ({
  enrollments,
  loading,
  onEdit,
  onDelete,
  onView,
  pagination,
  onPageChange,
  variant = 'table'
}) => {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatDateTime = (date: Date | string) => {
    return format(new Date(date), 'MMM dd, yyyy hh:mm a');
  };

  const formatTimeAgo = (date: Date | string) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', label: 'Active' },
      completed: { color: 'bg-blue-100 text-blue-800', label: 'Completed' },
      dropped: { color: 'bg-red-100 text-red-800', label: 'Dropped' },
      suspended: { color: 'bg-yellow-100 text-yellow-800', label: 'Suspended' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    return (
      <Badge className={`${config.color} border-0`}>
        {config.label}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (paymentStatus: string) => {
    const paymentConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      paid: { color: 'bg-green-100 text-green-800', label: 'Paid' },
      refunded: { color: 'bg-gray-100 text-gray-800', label: 'Refunded' },
      failed: { color: 'bg-red-100 text-red-800', label: 'Failed' }
    };
    
    const config = paymentConfig[paymentStatus as keyof typeof paymentConfig] || paymentConfig.pending;
    return (
      <Badge className={`${config.color} border-0`}>
        {config.label}
      </Badge>
    );
  };

  const columns: Column<Enrollment>[] = [
    {
      key: 'student',
      label: 'Student',
      width: 'w-1/4',
      render: (enrollment) => (
        <div className="flex items-center space-x-3">
          <div className="relative flex-shrink-0">
            {enrollment.studentInfo?.avatar ? (
              <div className="w-10 h-10 rounded-full overflow-hidden shadow-lg">
                <img
                  src={enrollment.studentInfo.avatar}
                  alt={`${enrollment.studentInfo.firstName} ${enrollment.studentInfo.lastName}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-lg">
                {enrollment.studentInfo ? getInitials(enrollment.studentInfo.firstName, enrollment.studentInfo.lastName) : '??'}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 truncate">
              {enrollment.studentInfo ? `${enrollment.studentInfo.firstName} ${enrollment.studentInfo.lastName}` : 'Unknown Student'}
            </p>
            <p className="text-sm text-gray-500 truncate">
              {enrollment.studentInfo?.email || 'No email'}
            </p>
          </div>
        </div>
      )
    },
    {
      key: 'course',
      label: 'Course',
      width: 'w-1/4',
      render: (enrollment) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <BookOpen className="h-5 w-5 text-blue-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 truncate">
              {enrollment.courseInfo?.title || 'Unknown Course'}
            </p>
            <p className="text-sm text-gray-500 truncate">
              {enrollment.courseInfo?.category || 'No category'}
            </p>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      width: 'w-20',
      render: (enrollment) => getStatusBadge(enrollment.status)
    },
    {
      key: 'certificate',
      label: 'Certificate',
      width: 'w-24',
      render: (enrollment) => {
        const hasCertificate = Boolean(enrollment.certificateIssued) || Boolean(enrollment.certificateUrl);
        return (
          <Badge className={`${hasCertificate ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-700'} border-0`}>
            {hasCertificate ? 'Issued' : 'Not issued'}
          </Badge>
        );
      }
    },
    {
      key: 'progress',
      label: 'Progress',
      width: 'w-24',
      render: (enrollment) => (
        <div className="flex items-center space-x-2">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${enrollment.progress}%` }}
            />
          </div>
          <span className="text-sm text-gray-600 min-w-0">
            {enrollment.progress}%
          </span>
        </div>
      )
    },
    {
      key: 'payment',
      label: 'Payment',
      width: 'w-24',
      render: (enrollment) => (
        <div className="space-y-1">
          <div className="text-sm font-medium text-gray-900">
            {enrollment.paymentAmount ? formatCurrency(enrollment.paymentAmount) : 'Free'}
          </div>
          {getPaymentStatusBadge(enrollment.paymentStatus)}
        </div>
      )
    },
    {
      key: 'enrolledAt',
      label: 'Enrolled At',
      width: 'w-24',
      render: (enrollment) => (
        <div className="space-y-1">
          <p className="text-sm text-gray-600">
            {formatDateTime(enrollment.enrolledAt)}
          </p>
          <p className="text-xs text-gray-500">
            {formatTimeAgo(enrollment.enrolledAt)}
          </p>
        </div>
      )
    }
  ];

  const actions: Action<Enrollment>[] = [
    {
      key: 'view',
      label: 'View',
      icon: <Eye className="w-4 h-4" />,
      onClick: onView || (() => {}),
      variant: 'secondary'
    },
    {
      key: 'edit',
      label: 'Edit',
      icon: <Edit className="w-4 h-4" />,
      onClick: onEdit,
      variant: 'secondary'
    },
    {
      key: 'delete',
      label: 'Delete',
      icon: <Trash2 className="w-4 h-4" />,
      onClick: onDelete,
      variant: 'destructive'
    }
  ];

  const emptyState = {
    title: "No enrollments found",
    description: "There are no enrollments to display at the moment.",
    icon: <User className="w-12 h-12 text-gray-400" />
  };

  return (
    <DataTable
      data={enrollments}
      columns={columns}
      actions={actions}
      loading={loading}
      emptyState={emptyState}
      pagination={{
        ...pagination,
        onPageChange
      }}
      variant={variant}
      getItemId={(enrollment) => enrollment._id}
    />
  );
};

export default EnrollmentDataTable;
