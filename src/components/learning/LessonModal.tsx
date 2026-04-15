'use client';

import React, { useState, useEffect } from 'react';
import { LuX as X, LuPlay as Play, LuTriangleAlert as AlertCircle, LuUpload as Upload } from 'react-icons/lu';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import FormModal from '@/components/ui/form-modal';
import { AttractiveInput } from '@/components/ui/attractive-input';
import CustomEditor from '@/components/custom-editor';
import { Lesson, CreateLessonRequest, UpdateLessonRequest, LessonAttachment } from '@/types/lesson';

interface LessonModalProps {
  open: boolean;
  onClose: () => void;
  lesson?: Lesson | null;
  chapterId: string;
  courseId: string;
  existingLessons?: Lesson[];
  onCreateLesson: (data: CreateLessonRequest) => Promise<Lesson | null>;
  onUpdateLesson: (id: string, data: UpdateLessonRequest) => Promise<Lesson | null>;
}

export default function LessonModal({
  open,
  onClose,
  lesson,
  chapterId,
  courseId,
  existingLessons = [],
  onCreateLesson,
  onUpdateLesson,
}: LessonModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    order: 1,
    duration: 0,
    youtubeVideoId: '',
    videoUrl: '',
    videoDuration: 0,
    isPublished: false,
    isFree: false,
  });
  const [attachments, setAttachments] = useState<LessonAttachment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderWarning, setOrderWarning] = useState<string | null>(null);

  const isEdit = !!lesson;

  // Check if order number already exists
  const checkOrderExists = (order: number) => {
    if (isEdit && lesson) {
      // For edit mode, exclude current lesson from check
      return existingLessons.some(l => l._id !== lesson._id && l.order === order);
    } else {
      // For create mode, check all existing lessons
      return existingLessons.some(l => l.order === order);
    }
  };

  // Get next available order number
  const getNextOrder = () => {
    if (existingLessons.length === 0) return 1;
    const maxOrder = Math.max(...existingLessons.map(l => l.order));
    return maxOrder + 1;
  };

  useEffect(() => {
    if (open) {
      if (lesson) {
        setFormData({
          title: lesson.title,
          description: lesson.description || '',
          content: lesson.content || '',
          order: lesson.order,
          duration: lesson.duration || 0,
          youtubeVideoId: lesson.youtubeVideoId || '',
          videoUrl: lesson.videoUrl || '',
          videoDuration: lesson.videoDuration || 0,
          isPublished: lesson.isPublished,
          isFree: lesson.isFree,
        });
        setAttachments(lesson.attachments || []);
      } else {
        setFormData({
          title: '',
          description: '',
          content: '',
          order: getNextOrder(),
          duration: 0,
          youtubeVideoId: '',
          videoUrl: '',
          videoDuration: 0,
          isPublished: false,
          isFree: false,
        });
        setAttachments([]);
      }
      setError(null);
    }
  }, [open, lesson]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate required fields
    if (!formData.title.trim()) {
      setError('Lesson title is required');
      setLoading(false);
      return;
    }

    if (!chapterId) {
      setError('Chapter ID is required');
      setLoading(false);
      return;
    }

    // Validate order number
    if (checkOrderExists(formData.order)) {
      setError(`Order ${formData.order} already exists. Please choose a different order number.`);
      setLoading(false);
      return;
    }

    try {
      const lessonData = {
        ...formData,
        attachments,
      };

      let result: Lesson | null = null;
      if (isEdit && lesson) {
        result = await onUpdateLesson(lesson._id, lessonData);
      } else {
        result = await onCreateLesson({
          ...lessonData,
          chapter: chapterId,
          course: courseId,
        });
      }

      if (!result) {
        throw new Error('Failed to save lesson');
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

    // Check for order conflicts in real-time
    if (field === 'order') {
      const orderValue = parseInt(value) || 1;
      if (checkOrderExists(orderValue)) {
        setOrderWarning(`Order ${orderValue} already exists. Please choose a different order number.`);
      } else {
        setOrderWarning(null);
      }
    }
  };

  const addAttachment = () => {
    setAttachments(prev => [
      ...prev,
      { name: '', url: '', type: '', size: 0 }
    ]);
  };

  const updateAttachment = (index: number, field: keyof LessonAttachment, value: any) => {
    setAttachments(prev => 
      prev.map((attachment, i) => 
        i === index ? { ...attachment, [field]: value } : attachment
      )
    );
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <FormModal
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      title={isEdit ? 'Edit Lesson' : 'Create New Lesson'}
      description={isEdit ? 'Update lesson information' : 'Add a new lesson to your chapter'}
      submitText={isEdit ? 'Update Lesson' : 'Create Lesson'}
      loading={loading}
      size="xl"
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

      <div className="space-y-4">

        <AttractiveInput
          label="Lesson Title"
          value={formData.title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('title', e.target.value)}
          placeholder="Enter lesson title"
          required
          variant="default"
          colorScheme="primary"
          size="md"
        />

        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">
            Description
          </label>
          <CustomEditor
            value={formData.description}
            onChange={(data) => handleInputChange('description', data)}
            placeholder="Enter lesson description"
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
              placeholder="Lesson order"
              required
              variant="default"
              colorScheme="primary"
              size="md"
            />
            {!isEdit && existingLessons.length > 0 && (
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

          <AttractiveInput
            label="Duration (minutes)"
            type="number"
            min="0"
            value={formData.duration}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('duration', parseInt(e.target.value) || 0)}
            placeholder="Duration in minutes"
            variant="default"
            colorScheme="primary"
            size="md"
          />
        </div>

        {/* Video Section */}
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Play className="w-4 h-4" />
            Video Content
          </h4>
          
          <AttractiveInput
            label="YouTube Video ID"
            value={formData.youtubeVideoId}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('youtubeVideoId', e.target.value)}
            placeholder="Enter YouTube video ID (e.g., dGcsHMXb3A8)"
            variant="default"
            colorScheme="primary"
            size="md"
            helperText="Extract the video ID from YouTube URLs like: https://www.youtube.com/watch?v=dGcsHMXb3A8"
          />

          {/* <AttractiveInput
            label="Video URL (Alternative)"
            value={formData.videoUrl}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('videoUrl', e.target.value)}
            placeholder="Enter video URL"
            variant="default"
            colorScheme="primary"
            size="md"
          /> */}

          <AttractiveInput
            label="Video Duration (seconds)"
            type="number"
            min="0"
            value={formData.videoDuration}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('videoDuration', parseInt(e.target.value) || 0)}
            placeholder="Video duration in seconds"
            variant="default"
            colorScheme="primary"
            size="md"
          />
        </div>

        {/* Attachments Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Attachments
            </h4>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addAttachment}
              className="flex items-center gap-1"
            >
              <Upload className="w-3 h-3" />
              Add
            </Button>
          </div>

          {attachments.map((attachment, index) => (
            <div key={index} className="grid grid-cols-4 gap-2 p-3 border border-gray-200 rounded-lg">
              <AttractiveInput
                placeholder="Name"
                value={attachment.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateAttachment(index, 'name', e.target.value)}
                variant="default"
                colorScheme="primary"
                size="sm"
              />
              <AttractiveInput
                placeholder="URL"
                value={attachment.url}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateAttachment(index, 'url', e.target.value)}
                variant="default"
                colorScheme="primary"
                size="sm"
              />
              <AttractiveInput
                placeholder="Type"
                value={attachment.type}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateAttachment(index, 'type', e.target.value)}
                variant="default"
                colorScheme="primary"
                size="sm"
              />
              <div className="flex gap-1">
                <AttractiveInput
                  type="number"
                  placeholder="Size"
                  value={attachment.size || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateAttachment(index, 'size', parseInt(e.target.value) || 0)}
                  variant="default"
                  colorScheme="primary"
                  size="sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeAttachment(index)}
                  className="px-2"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Status Section */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">
              Status
            </label>
            <div className="space-y-2">
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
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isFree"
                  checked={formData.isFree}
                  onCheckedChange={(checked) => handleInputChange('isFree', checked)}
                  className="w-5 h-5 text-primary border-input rounded focus:ring-ring"
                />
                <label htmlFor="isFree" className="text-sm text-foreground">
                  Free Lesson
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </FormModal>
  );
}
