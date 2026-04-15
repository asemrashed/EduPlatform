'use client';

import User, { IUser } from '@/models/User';
import { Badge } from '@/components/ui/badge';
import DataTable, { Column, Action } from '@/components/ui/data-table';
import { LuPencil as Edit, LuTrash2 as Trash2, LuEye as Eye, LuUserCheck as UserCheck, LuUserX as UserX } from 'react-icons/lu';
import { format } from 'date-fns';

interface UserDataTableProps {
  users: IUser[];
  loading: boolean;
  onEdit: (user: IUser) => void;
  onDelete: (userId: string) => void;
  onView?: (user: IUser) => void;
  onToggleStatus?: (userId: string, isActive: boolean) => void;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  onPageChange: (page: number) => void;
  variant?: 'table' | 'cards' | 'list';
}

export default function UserDataTable({
  users,
  loading,
  onEdit,
  onDelete,
  onView,
  onToggleStatus,
  pagination,
  onPageChange,
  variant = 'cards'
}: UserDataTableProps) {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getRoleBadge = (role: string) => {
    const roleColors = {
      admin: 'bg-red-100 text-red-800',
      teacher: 'bg-blue-100 text-blue-800',
      student: 'bg-green-100 text-green-800',
      user: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <Badge className={roleColors[role as keyof typeof roleColors] || roleColors.user}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge variant={isActive ? 'default' : 'secondary'}>
        {isActive ? 'Active' : 'Inactive'}
      </Badge>
    );
  };

  const formatDate = (date: Date | string) => {
    return format(new Date(date), 'MMM dd, yyyy');
  };

  const columns: Column<IUser>[] = [
    {
      key: 'user',
      label: 'User',
      width: 'lg:col-span-4',
      render: (user) => (
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-lg">
              {getInitials(user.firstName || 'U', user.lastName || 'U')}
            </div>
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
              user.isActive ? 'bg-green-500' : 'bg-gray-400'
            }`}></div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {user.firstName} {user.lastName}
              </h3>
              <div className="hidden lg:block">
                {getStatusBadge(user.isActive)}
              </div>
            </div>
            <p className="text-sm text-gray-500 truncate mt-1">
              {user.email}
            </p>
            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
              <span>ID: {user._id ? String(user._id).slice(-8) : 'N/A'}</span>
              <span>•</span>
              <span>Created {formatDate(user.createdAt)}</span>
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      label: 'Role',
      width: 'lg:col-span-2',
      render: (user) => (
        <div className="text-sm text-gray-600 min-w-0 flex-1">
          <div className="font-medium text-gray-900">Role</div>
          <div className="mt-1">
            {getRoleBadge(user.role)}
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      width: 'lg:col-span-2',
      render: (user) => (
        <div className="hidden lg:block">
          {getStatusBadge(user.isActive)}
        </div>
      )
    },
    {
      key: 'lastLogin',
      label: 'Last Login',
      width: 'lg:col-span-2',
      render: (user) => (
        <div className="text-sm text-gray-600 min-w-0 flex-1">
          <div className="font-medium text-gray-900">Last Login</div>
          <div className="text-gray-500">
            {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
          </div>
        </div>
      )
    }
  ];

  const actions: Action<IUser>[] = [
    ...(onView ? [{
      key: 'view',
      label: 'View Details',
      icon: <Eye className="w-4 h-4" />,
      onClick: onView,
      variant: 'default' as const
    }] : []),
    {
      key: 'edit',
      label: 'Edit User',
      icon: <Edit className="w-4 h-4" />,
      onClick: onEdit,
      variant: 'default' as const
    },
    ...(onToggleStatus ? [{
      key: 'toggle-status',
      label: 'Toggle Status',
      icon: <UserCheck className="w-4 h-4" />,
      onClick: (user: IUser) => onToggleStatus(String(user._id), !user.isActive),
      variant: 'secondary' as const
    }] : []),
    {
      key: 'delete',
      label: 'Delete User',
      icon: <Trash2 className="w-4 h-4" />,
      onClick: (user: IUser) => onDelete(String(user._id)),
      variant: 'destructive' as const
    }
  ];

  const emptyState = {
    title: 'No users found',
    description: 'Get started by adding a new user to the system.',
    icon: (
      <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
      </svg>
    )
  };

  return (
    <DataTable
      data={users}
      columns={columns}
      actions={actions}
      loading={loading}
      emptyState={emptyState}
      pagination={{
        ...pagination,
        onPageChange
      }}
      variant={variant}
      getItemId={(user) => String(user._id ?? '')}
    />
  );
}
