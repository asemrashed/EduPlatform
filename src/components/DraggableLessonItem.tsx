'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LuPencil as Edit, LuGripVertical as GripVertical, LuPlay as Play, LuTrash2 as Trash2, LuClock as Clock, LuYoutube as Youtube, LuListChecks as ListChecks } from 'react-icons/lu';;
import { Lesson } from '@/types/lesson';
import { htmlToPlainText } from '@/lib/utils';

interface DraggableLessonItemProps {
  lesson: Lesson;
  onEdit: (lesson: Lesson) => void;
  onDelete?: (lesson: Lesson) => void;
  onManageQuiz?: (lesson: Lesson) => void;
}

export default function DraggableLessonItem({
  lesson,
  onEdit,
  onDelete,
  onManageQuiz,
}: DraggableLessonItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lesson._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const formatDuration = (duration?: number) => {
    if (!duration) return 'No duration';
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group border rounded-lg p-4 cursor-pointer transition-all duration-200
        ${isDragging ? 'opacity-50 shadow-lg' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'}
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded transition-colors"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <GripVertical className="w-4 h-4 text-gray-400" />
          </div>

          {/* Lesson LuInfo */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-medium text-green-600">
                  {lesson.order}
                </span>
              </div>
              <h3 className="font-medium text-gray-900 truncate">{lesson.title}</h3>
            </div>
            
            {lesson.description && (
              <p className="text-sm text-gray-600 truncate mb-2">
                {htmlToPlainText(lesson.description)}
              </p>
            )}

            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>Order: {lesson.order}</span>
              {lesson.duration && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatDuration(lesson.duration)}</span>
                </div>
              )}
              {lesson.youtubeVideoId && (
                <div className="flex items-center gap-1">
                  <Youtube className="w-3 h-3" />
                  <span>YouTube</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge variant={lesson.isPublished ? 'default' : 'secondary'} className="text-xs">
            {lesson.isPublished ? 'Published' : 'Draft'}
          </Badge>
          <Badge variant={lesson.isFree ? 'default' : 'outline'} className="text-xs">
            {lesson.isFree ? 'Free' : 'Paid'}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              console.log('Edit button clicked for lesson:', lesson.title);
              onEdit(lesson);
            }}
            className="hover:bg-gray-100 transition-colors flex-shrink-0"
            title="Edit lesson"
          >
            <Edit className="w-4 h-4" />
          </Button>
          {onDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                console.log('Delete button clicked for lesson:', lesson.title);
                onDelete(lesson);
              }}
              className="hover:bg-red-50 text-red-600 hover:text-red-700 transition-colors flex-shrink-0"
              title="Delete lesson"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
          {onManageQuiz && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onManageQuiz(lesson);
              }}
              className="hover:bg-gray-100 transition-colors flex-shrink-0"
              title="Manage Quiz"
            >
              <ListChecks className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
