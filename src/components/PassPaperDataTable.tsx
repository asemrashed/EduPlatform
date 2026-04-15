'use client';

import { PassPaper } from '@/types/pass-paper';
import { Badge } from '@/components/ui/badge';
import DataTable, { Column, Action } from '@/components/ui/data-table';
import { LuPencil as Edit, LuTrash2 as Trash2, LuEye as Eye, LuFileText as LuFileText, LuDownload as Download, LuAward as Award, LuBookOpen as BookOpen } from 'react-icons/lu';;
import { format } from 'date-fns';

interface PassPaperDataTableProps {
  passPapers: PassPaper[];
  loading: boolean;
  onEdit: (paper: PassPaper) => void;
  onDelete: (paper: PassPaper) => void;
  onView?: (paper: PassPaper) => void;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  onPageChange: (page: number) => void;
  variant?: 'table' | 'cards' | 'list';
}

export default function PassPaperDataTable({
  passPapers,
  loading,
  onEdit,
  onDelete,
  onView,
  pagination,
  onPageChange,
  variant = 'table'
}: PassPaperDataTableProps) {
  const getStatusBadge = (isActive: boolean | undefined) => {
    return (
      <Badge variant={isActive ? 'default' : 'secondary'}>
        {isActive ? 'Active' : 'Inactive'}
      </Badge>
    );
  };

  const formatDate = (date: Date | string) => {
    return format(new Date(date), 'MMM dd, yyyy');
  };

  const getPaperTypeBadges = (paper: PassPaper) => {
    const badges = [];
    if (paper.questionPaperUrl) badges.push({ type: 'Question Paper', color: 'bg-purple-100 text-purple-800' });
    if (paper.marksPdfUrl) badges.push({ type: 'Marks PDF', color: 'bg-green-100 text-green-800' });
    if (paper.workSolutionUrl) badges.push({ type: 'Work Solution', color: 'bg-purple-100 text-purple-800' });
    return badges;
  };

  const columns: Column<PassPaper>[] = [
    {
      key: 'paper',
      label: 'Pass Paper',
      width: 'w-1/3',
      render: (paper) => (
        <div className="flex items-center space-x-3">
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold text-sm shadow-lg" style={{
              background: "linear-gradient(135deg, #EC4899 0%, #A855F7 100%)",
            }}>
              <LuFileText className="w-5 h-5" />
            </div>
            <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
              paper.isActive ? 'bg-green-500' : 'bg-gray-400'
            }`}></div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-semibold text-gray-900 truncate">
                {paper.sessionName} - {paper.subject}
              </h3>
            </div>
            <p className="text-xs text-gray-500 truncate">
              {paper.examType} • {paper.year}
            </p>
          </div>
        </div>
      )
    },
    {
      key: 'papers',
      label: 'Available Papers',
      width: 'w-1/4',
      render: (paper) => (
        <div className="flex flex-wrap gap-1">
          {getPaperTypeBadges(paper).map((badge, index) => (
            <Badge key={index} className={`text-xs ${badge.color}`}>
              {badge.type}
            </Badge>
          ))}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      width: 'w-1/6',
      render: (paper) => (
        <div>
          {getStatusBadge(paper.isActive)}
        </div>
      )
    },
    {
      key: 'created',
      label: 'Created',
      width: 'w-1/4',
      render: (paper) => (
        <div className="text-sm text-gray-600">
          {formatDate(paper.createdAt)}
        </div>
      )
    }
  ];

  const actions: Action<PassPaper>[] = [
    ...(onView ? [{
      key: 'view',
      label: 'View Details',
      icon: <Eye className="w-4 h-4" />,
      onClick: onView,
      variant: 'default' as const
    }] : []),
    {
      key: 'edit',
      label: 'Edit Pass Paper',
      icon: <Edit className="w-4 h-4" />,
      onClick: onEdit,
      variant: 'default' as const
    },
    {
      key: 'delete',
      label: 'Delete Pass Paper',
      icon: <Trash2 className="w-4 h-4" />,
      onClick: onDelete,
      variant: 'destructive' as const
    }
  ];

  const emptyState = {
    title: 'No pass papers found',
    description: 'Get started by adding a new pass paper to the system.',
    icon: (
      <svg className="w-10 h-10" style={{ color: '#A855F7' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )
  };

  return (
    <DataTable
      data={passPapers}
      columns={columns}
      actions={actions}
      loading={loading}
      pagination={{
        ...pagination,
        onPageChange
      }}
      emptyState={emptyState}
      variant={variant}
    />
  );
}