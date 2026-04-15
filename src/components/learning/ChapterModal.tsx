'use client';

import React, { useState, useEffect } from 'react';
import { LuX as X, LuBookOpen as BookOpen, LuSave as Save, LuTriangleAlert as AlertCircle } from 'react-icons/lu';;
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import FormModal from '@/components/ui/form-modal';
import { AttractiveInput } from '@/components/ui/attractive-input';
import CustomEditor from '@/components/custom-editor';
import { Chapter, CreateChapterRequest, UpdateChapterRequest } from '@/types/chapter';

interface ChapterModalProps {
  open: boolean;
  onClose: () => void;
  chapter?: Chapter | null;
  courseId: string;
  existingChapters?: Chapter[];
  onCreateChapter: (data: CreateChapterRequest) => Promise<Chapter | null>;
  onUpdateChapter: (id: string, data: UpdateChapterRequest) => Promise<Chapter | null>;
}

export default function ChapterModal({
  open,
  onClose,
  chapter,
  courseId,
  existingChapters = [],
  onCreateChapter,
  onUpdateChapter,
}: ChapterModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    order: 1,
    isPublished: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderWarning, setOrderWarning] = useState<string | null>(null);

  const isEdit = !!chapter;

  // Check if order number already exists
  const checkOrderExists = (order: number) => {
    if (isEdit && chapter) {
      // For edit mode, exclude current chapter from check
      return existingChapters.some(c => c._id !== chapter._id && c.order === order);
    } else {
      // For create mode, check all existing chapters
      return existingChapters.some(c => c.order === order);
    }
  };

  // Get next available order number
  const getNextOrder = () => {
    if (existingChapters.length === 0) return 1;
    const maxOrder = Math.max(...existingChapters.map(c => c.order));
    return maxOrder + 1;
  };

  useEffect(() => {
    if (open) {
      if (chapter) {
        setFormData({
          title: chapter.title,
          description: chapter.description || '',
          order: chapter.order,
          isPublished: chapter.isPublished,
        });
        setOrderWarning(null);
      } else {
        setFormData({
          title: '',
          description: '',
          order: getNextOrder(),
          isPublished: false,
        });
        setOrderWarning(null);
      }
      setError(null);
    }
  }, [open, chapter, existingChapters]);

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('ChapterModal handleSubmit called', e);
    e.preventDefault();
    e.stopPropagation();
    
    // Validate form data
    if (!formData.title.trim()) {
      setError('Chapter title is required');
      return;
    }
    
    if (!courseId) {
      setError('Course ID is required');
      return;
    }

    // Check for order conflicts
    if (checkOrderExists(formData.order)) {
      setError(`Order ${formData.order} already exists. Please choose a different order number.`);
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      if (isEdit && chapter) {
        await onUpdateChapter(chapter._id, formData);
      } else {
        await onCreateChapter({
          ...formData,
          course: courseId,
        });
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Check for order conflicts when order changes
    if (field === 'order') {
      const orderValue = parseInt(value) || 1;
      if (checkOrderExists(orderValue)) {
        setOrderWarning(`Order ${orderValue} already exists. Please choose a different order number.`);
      } else {
        setOrderWarning(null);
      }
    }
  };

  return (
    <FormModal
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      title={isEdit ? 'Edit Chapter' : 'Create New Chapter'}
      description={isEdit ? 'Update chapter information' : 'Add a new chapter to your course'}
      submitText={isEdit ? 'Update Chapter' : 'Create Chapter'}
      loading={loading}
      size="md"
      formId="chapter-form"
    >
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-4">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {orderWarning && (
        <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 mb-4">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{orderWarning}</span>
        </div>
      )}
        <AttractiveInput
          label="Chapter Title"
          value={formData.title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('title', e.target.value)}
          placeholder="Enter chapter title"
          required
          variant="default"
          colorScheme="primary"
          size="md"
        />

        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">Description</label>
          <CustomEditor
            value={formData.description}
            onChange={(data) => handleInputChange('description', data)}
            placeholder="Enter chapter description"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <AttractiveInput
              label="Order"
              type="number"
              min="1"
              value={formData.order}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('order', parseInt(e.target.value) || 1)}
              placeholder="Chapter order"
              required
              variant="default"
              colorScheme="primary"
              size="md"
            />
            {!isEdit && existingChapters.length > 0 && (
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  Next available order: {getNextOrder()}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const nextOrder = getNextOrder();
                    handleInputChange('order', nextOrder);
                  }}
                  className="text-xs h-6 px-2"
                >
                  Use Next
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">
              Status
            </label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isPublished"
                checked={formData.isPublished}
                onCheckedChange={(checked) => handleInputChange('isPublished', checked)}
                className="w-5 h-5 text-primary border-input rounded focus:ring-ring"
              />
              <label htmlFor="isPublished" className="text-sm text-foreground">
                Published
              </label>
            </div>
          </div>
        </div>
    </FormModal>
  );
}
