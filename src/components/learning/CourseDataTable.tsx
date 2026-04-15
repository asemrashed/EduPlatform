'use client';

import { useEffect, useMemo, useState } from 'react';
import { Course } from '@/types/course';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import DataTable, { Column, Action } from '@/components/ui/data-table';
import {
  LuPencil as Edit,
  LuTrash2 as Trash2,
  LuEye as Eye,
  LuEyeOff as EyeOff,
  LuDollarSign as DollarSign,
  LuTag as Tag,
  LuBookOpen as BookOpen,
  LuUser as User,
  LuGripVertical as GripVertical,
} from 'react-icons/lu';
import { format } from 'date-fns';
import { getPlainTextPreview } from '@/lib/utils';

interface CourseDataTableProps {
  courses: Course[];
  loading: boolean;
  onEdit: (course: Course) => void;
  onDelete: (course: Course) => void;
  onView?: (course: Course) => void;
  onBuild?: (course: Course) => void;
  onToggleVisibility?: (course: Course) => void;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  onPageChange: (page: number) => void;
  variant?: 'table' | 'cards' | 'list';
  reorderEnabled?: boolean;
  onReorder?: (courses: Course[]) => void;
}

export default function CourseDataTable({
  courses,
  loading,
  onEdit,
  onDelete,
  onView,
  onBuild,
  onToggleVisibility,
  pagination,
  onPageChange,
  variant = 'table',
  reorderEnabled = false,
  onReorder
}: CourseDataTableProps) {
  const [orderedCourses, setOrderedCourses] = useState<Course[]>(courses);

  useEffect(() => {
    setOrderedCourses(courses);
  }, [courses]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const tableCourses = reorderEnabled ? orderedCourses : courses;

  const getPriceBadge = (course: Course) => {
    if (!course.isPaid) {
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          Free
        </Badge>
      );
    }

    if (course.salePrice && course.salePrice < course.price!) {
      return (
        <div className="flex items-center gap-1">
          <Badge variant="destructive" className="bg-red-100 text-red-800">
            ${course.salePrice}
          </Badge>
          <span className="text-xs text-gray-500 line-through">
            ${course.price}
          </span>
          <Badge variant="outline" className="text-xs">
            {course.discountPercentage}% off
          </Badge>
        </div>
      );
    }

    return (
      <Badge variant="default" className="text-white" style={{
        background: "linear-gradient(135deg, #EC4899 0%, #A855F7 100%)",
      }}>
        ${course.price}
      </Badge>
    );
  };

  const getCategoryBadge = (course: Course) => {
    if (!course.category) return null;
    
    const categoryInfo = course.categoryInfo;
    const color = categoryInfo?.color || '#3B82F6';
    const icon = categoryInfo?.icon;
    
    return (
      <div className="flex items-center gap-2">
        <div 
          className="w-3 h-3 rounded-full border border-gray-300"
          style={{ backgroundColor: color }}
        ></div>
        <Badge 
          variant="outline" 
          className="text-xs"
          style={{ 
            borderColor: color,
            color: color,
            backgroundColor: `${color}10`
          }}
        >
          {icon && <span className="mr-1">{icon}</span>}
          {typeof course.category === 'string'
            ? course.category
            : (course.category as { name?: string } | null | undefined)?.name ??
              'N/A'}
        </Badge>
      </div>
    );
  };

  const formatDate = (date: Date | string | null | undefined) => {
    if (date == null || date === '') return 'N/A';
    const d = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(d.getTime())) return 'Invalid date';
    try {
      return format(d, 'MMM dd, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  const columns: Column<Course>[] = [
    {
      key: 'course',
      label: 'Course',
      width: 'w-2/5',
      render: (course) => (
        <div className="flex items-center space-x-3">
          <div className="relative flex-shrink-0">
            {course.thumbnailUrl ? (
              <div className="w-12 h-12 rounded-lg overflow-hidden shadow-md">
                <img
                  src={course.thumbnailUrl}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-semibold text-sm shadow-md" style={{
                background: "linear-gradient(135deg, #EC4899 0%, #A855F7 100%)",
              }}>
                <Tag className="w-6 h-6" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 truncate">
              {course.title}
            </p>
            <p className="text-sm text-gray-500 truncate" title={course.description ? getPlainTextPreview(course.description) : 'No description'}>
              {course.description ? getPlainTextPreview(course.description, 30) : 'No description'}
            </p>
            <div className="flex items-center gap-2 mt-1">
              {getCategoryBadge(course)}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'pricing',
      label: 'Pricing',
      width: 'w-1/4',
      render: (course) => (
        <div className="space-y-1">
          {getPriceBadge(course)}
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <DollarSign className="w-3 h-3" />
            <span>
              {course.isPaid ? 'Paid Course' : 'Free Course'}
            </span>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      width: 'w-1/6',
      render: (course) => (
        <div className="space-y-1">
          <Badge 
            variant={
              course.status === 'published' ? 'default' : 
              course.status === 'draft' ? 'secondary' : 
              'outline'
            }
            className={
              course.status === 'published' ? 'bg-green-100 text-green-800' :
              course.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }
          >
            {course.status === 'published' ? 'Published' :
             course.status === 'draft' ? 'Draft' :
             course.status === 'archived' ? 'Archived' : 'Unknown'}
          </Badge>
          {course.isHidden && (
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
              Hidden
            </Badge>
          )}
        </div>
      )
    },
    {
      key: 'creator',
      label: 'Creator',
      width: 'w-1/4',
      render: (course) => (
        <div className="space-y-1">
          {course.createdBy ? (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold" style={{
                background: "linear-gradient(135deg, #EC4899 0%, #A855F7 100%)",
              }}>
                <User className="w-3 h-3" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {course.createdBy?.name ?? 'N/A'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {course.createdBy?.email ?? 'N/A'}
                </p>
                <Badge 
                  variant="outline" 
                  className="text-xs mt-1"
                  style={{
                    borderColor: course.createdBy?.role === 'admin' ? '#10B981' : 
                                 course.createdBy?.role === 'instructor' ? '#7B2CBF' : '#6B7280',
                    color: course.createdBy?.role === 'admin' ? '#10B981' : 
                           course.createdBy?.role === 'instructor' ? '#7B2CBF' : '#6B7280',
                    backgroundColor: course.createdBy?.role === 'admin' ? '#10B98110' : 
                                    course.createdBy?.role === 'instructor' ? '#7B2CBF10' : '#6B728010'
                  }}
                >
                  {course.createdBy?.role ?? 'N/A'}
                </Badge>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500 italic">
              Unknown creator
            </div>
          )}
        </div>
      )
    },
    {
      key: 'instructor',
      label: 'Instructor',
      width: 'w-1/4',
      render: (course) => (
        <div className="space-y-1">
          {course.instructor ? (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold" style={{
                background: "linear-gradient(135deg, #7B2CBF 0%, #A855F7 100%)",
              }}>
                <User className="w-3 h-3" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {typeof course.instructor === 'string' 
                    ? 'Instructor' 
                    : `${(course.instructor as any).firstName} ${(course.instructor as any).lastName}`
                  }
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {typeof course.instructor === 'string' 
                    ? 'Instructor' 
                    : (course.instructor as { email?: string })?.email ?? 'N/A'
                  }
                </p>
                <Badge 
                  variant="outline" 
                  className="text-xs mt-1"
                  style={{
                    borderColor: '#8B5CF6',
                    color: '#8B5CF6',
                    backgroundColor: '#8B5CF610'
                  }}
                >
                  instructor
                </Badge>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500 italic">
              No instructor assigned
            </div>
          )}
        </div>
      )
    },
    {
      key: 'created',
      label: 'Created',
      width: 'w-1/6',
      render: (course) => (
        <div className="text-sm text-gray-900">
          {formatDate(course.createdAt)}
        </div>
      )
    }
  ];

  const actions: Action<Course>[] = [
    ...(onView ? [{
      key: 'view',
      label: 'View Details',
      icon: <Eye className="w-4 h-4" />,
      onClick: onView,
      variant: 'secondary' as const
    }] : []),
    ...(onBuild ? [{
      key: 'build',
      label: 'Build',
      icon: <BookOpen className="w-4 h-4" />,
      onClick: onBuild,
      variant: 'default' as const
    }] : []),
    ...(onToggleVisibility ? [{
      key: 'toggle-visibility',
      label: (course: Course) => (course.isHidden ? 'Unhide' : 'Hide'),
      icon: (course: Course) =>
        course.isHidden
          ? <EyeOff className="w-4 h-4" />
          : <Eye className="w-4 h-4" />,
      className: (course: Course) =>
        course.isHidden
          ? 'bg-red-50 text-red-600 border-red-300 hover:bg-red-100'
          : 'text-gray-700',
      onClick: onToggleVisibility,
      variant: 'secondary' as const
    }] : []),
    {
      key: 'edit',
      label: 'Edit',
      icon: <Edit className="w-4 h-4" />,
      onClick: onEdit,
      variant: 'secondary' as const
    },
    {
      key: 'delete',
      label: 'Delete',
      icon: <Trash2 className="w-4 h-4" />,
      onClick: onDelete,
      variant: 'destructive' as const
    }
  ];

  const emptyState = {
    title: 'No courses found',
    description: 'Get started by adding a new course to the system.',
    icon: (
      <svg className="w-10 h-10" style={{ color: '#A855F7' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    )
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = orderedCourses.findIndex((c) => c._id === active.id);
    const newIndex = orderedCourses.findIndex((c) => c._id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const updated = arrayMove(orderedCourses, oldIndex, newIndex);
    setOrderedCourses(updated);
    onReorder?.(updated);
  };

  const renderReorderTable = () => {
    const allColumns = [
      { key: '__drag', label: '', width: 'w-12' },
      ...columns,
      { key: '__actions', label: 'Actions', width: 'w-[360px]' },
    ];

    return (
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="w-full overflow-x-auto overflow-y-visible rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full min-w-[900px]">
            <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
              <tr>
                {allColumns.map((column) => (
                  <th
                    key={column.key}
                    className={`px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide whitespace-nowrap ${column.key === '__actions' ? 'text-center' : 'text-left'} ${column.width || 'w-auto'}`}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <SortableContext items={orderedCourses.map((c) => c._id)} strategy={verticalListSortingStrategy}>
              <tbody className="divide-y divide-gray-200">
                {orderedCourses.map((course, index) => (
                  <SortableCourseRow
                    key={course._id}
                    course={course}
                    index={index}
                    columns={columns}
                    actions={actions}
                    onAction={(action, item) => action.onClick(item)}
                  />
                ))}
              </tbody>
            </SortableContext>
          </table>
        </div>
      </DndContext>
    );
  };

  return (
    reorderEnabled && variant === 'table'
      ? renderReorderTable()
      : (
        <DataTable
          data={tableCourses}
          columns={columns}
          actions={actions}
          actionDisplay="buttons"
          loading={loading}
          emptyState={emptyState}
          pagination={{
            ...pagination,
            onPageChange
          }}
          variant={variant}
          getItemId={(course) => course._id}
        />
      )
  );
}

function SortableCourseRow({
  course,
  index,
  columns,
  actions,
  onAction,
}: {
  course: Course;
  index: number;
  columns: Column<Course>[];
  actions: Action<Course>[];
  onAction: (action: Action<Course>, item: Course) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: course._id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getActionLabel = (action: Action<Course>) =>
    typeof action.label === 'function' ? action.label(course) : action.label;

  const getActionIcon = (action: Action<Course>) =>
    typeof action.icon === 'function' ? action.icon(course) : action.icon;

  const getActionClassName = (action: Action<Course>) =>
    typeof action.className === 'function' ? action.className(course) : (action.className || '');

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`group transition-colors duration-200 hover:bg-gray-50 ${isDragging ? 'bg-purple-50' : ''}`}
    >
      <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900 whitespace-nowrap">
        <button
          type="button"
          className="cursor-grab text-gray-400 hover:text-gray-600 active:cursor-grabbing"
          {...attributes}
          {...listeners}
          aria-label={`Reorder ${course.title}`}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </td>
      {columns.map((column) => (
        <td
          key={column.key}
          className={`px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900 whitespace-nowrap ${column.width || 'w-auto'} ${column.className || ''}`}
        >
          {column.render ? column.render(course, index) : (course as any)[column.key]}
        </td>
      ))}
      <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm text-gray-900">
        <div className="flex items-center gap-1">
          {actions.map((action) => (
            <Button
              key={action.key}
              variant={action.variant === 'destructive' ? 'destructive' : 'outline'}
              size="icon"
              className={`h-8 w-8 ${
                action.variant === 'destructive'
                  ? 'bg-red-600 hover:bg-red-700 text-white border-red-600'
                  : ''
              } ${getActionClassName(action)}`}
              onClick={() => onAction(action, course)}
              title={getActionLabel(action)}
            >
              {getActionIcon(action)}
            </Button>
          ))}
        </div>
      </td>
    </tr>
  );
}
