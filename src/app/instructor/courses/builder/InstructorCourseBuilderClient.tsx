'use client';

import React, { useState, useEffect, useRef, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  LuArrowLeft as ArrowLeft,
  LuPlus as Plus,
  LuPlay as Play,
  LuEye as Eye,
  LuEyeOff as EyeOff,
  LuSearch as Search,
  LuX as X,
  LuLayers as Layers,
  LuLoader as Loader2,
  LuImage as ImageIcon,
  LuUpload as Upload,
  LuTag as Tag,
} from 'react-icons/lu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { AttractiveInput } from '@/components/ui/attractive-input';
import { AttractiveTextarea } from '@/components/ui/attractive-textarea';
import ConfirmModal from '@/components/ui/confirm-modal';
import { AdminRoleShell } from '@/components/role-area/AdminRoleShell';
import PageSection from '@/components/PageSection';
import WelcomeSection from '@/components/WelcomeSection';
import ChapterModal from '@/components/ChapterModal';
import LessonModal from '@/components/LessonModal';
import InstructorPageWrapper from '@/components/InstructorPageWrapper';
import { useCourses } from '@/hooks/useCourses';
import { useChapters } from '@/hooks/useChapters';
import { useLessons } from '@/hooks/useLessons';
import { useCourseCategories } from '@/hooks/useCourseCategories';
import { useAppSelector } from '@/lib/hooks';
import DraggableChapterItem from '@/components/DraggableChapterItem';
import DraggableLessonItem from '@/components/DraggableLessonItem';
import LessonQuizModal from '@/components/LessonQuizModal';
import { Course } from '@/types/course';
import { Chapter as ChapterType } from '@/types/chapter';
import { Lesson as LessonType } from '@/types/lesson';
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
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { InstructorRoleShell } from '@/components/role-area/InstructorRoleShell';

interface CourseForm {
  title: string;
  description: string;
  category: string;
  price: number;
  discountedPrice: number;
  thumbnailUrl: string;
  isPaid: boolean;
  instructor?: string;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function ThumbnailUpload({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => onChange(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">Course Thumbnail</label>
      <div
        className={`relative border-2 border-dashed rounded-xl transition-colors cursor-pointer ${
          dragging ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-blue-300 bg-gray-50'
        }`}
        style={{ minHeight: 36 }}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files[0];
          if (file) handleFile(file);
        }}
      >
        {value ? (
          <div className="relative w-full h-64 rounded-xl overflow-hidden">
            <img src={value} alt="Thumbnail" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onChange(''); }}
              className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-red-50 transition-colors"
            >
              <X className="w-4 h-4 text-red-500" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 gap-2 text-gray-400">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-blue-400" />
            </div>
            <p className="text-sm font-medium text-gray-500">Drop image or click to upload</p>
            <p className="text-xs text-gray-400">PNG, JPG, WEBP up to 5MB</p>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
      </div>
      {/* Also allow URL input */}
      <div className="flex gap-2 items-center">
        <div className="flex-1">
          <AttractiveInput
            label=""
            value={value.startsWith('data:') ? '' : value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Or paste image URL..."
            variant="default"
            colorScheme="primary"
            size="sm"
          />
        </div>
      </div>
    </div>
  );
}

function PriceSection({
  isPaid,
  price,
  discountedPrice,
  onIsPaidChange,
  onPriceChange,
  onDiscountedPriceChange,
}: {
  isPaid: boolean;
  price: number;
  discountedPrice: number;
  onIsPaidChange: (v: boolean) => void;
  onPriceChange: (v: number) => void;
  onDiscountedPriceChange: (v: number) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Checkbox
          id="isPaid"
          checked={isPaid}
          onCheckedChange={(checked) => onIsPaidChange(!!checked)}
          className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="isPaid" className="text-sm font-medium text-gray-700 cursor-pointer select-none">
          Paid Course
        </label>
      </div>

      {isPaid && (
        <div className="grid grid-cols-2 gap-4 pt-1">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Original Price ($)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={price === 0 ? '' : price}
                onChange={(e) => onPriceChange(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-green-500" />
              Discounted Price ($)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={discountedPrice === 0 ? '' : discountedPrice}
                onChange={(e) => onDiscountedPriceChange(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="w-full pl-7 pr-3 py-2 border border-green-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-green-400 transition-all bg-green-50/30"
              />
            </div>
            {price > 0 && discountedPrice > 0 && discountedPrice < price && (
              <p className="text-xs text-green-600 mt-1 font-medium">
                {Math.round(((price - discountedPrice) / price) * 100)}% off
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function CourseBuilderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get('id');
  const { user } = useAppSelector((state) => state.auth);

  const { courses, updateCourse, loading: coursesLoading } = useCourses();
  const {
    chapters,
    createChapter,
    updateChapter,
    deleteChapter,
    reorderChapters,
    getChaptersByCourse,
    loading: chaptersLoading,
    reordering,
    deleting,
    updating,
  } = useChapters();
  const {
    lessons,
    createLesson,
    updateLesson,
    deleteLesson,
    reorderLessons,
    getLessonsByChapter,
    loading: lessonsLoading,
    creating: lessonsCreating,
    deleting: lessonsDeleting,
    reordering: lessonsReordering,
  } = useLessons();
  const { categories } = useCourseCategories();

  const [course, setCourse] = useState<Course | null>(null);
  const [courseChapters, setCourseChapters] = useState<ChapterType[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<ChapterType | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<LessonType | null>(null);
  const [chapterLessons, setChapterLessons] = useState<LessonType[]>([]);
  const [chapterSearch, setChapterSearch] = useState('');
  const [lessonSearch, setLessonSearch] = useState('');

  // Modals
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [quizLessonId, setQuizLessonId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteItem, setDeleteItem] = useState<{ type: 'chapter' | 'lesson'; id: string; title: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [publishLoading, setPublishLoading] = useState(false);
  const [courseFetchTimeout, setCourseFetchTimeout] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const [courseForm, setCourseForm] = useState<CourseForm>({
    title: '',
    description: '',
    category: '',
    price: 0,
    discountedPrice: 0,
    thumbnailUrl: '',
    isPaid: false,
    instructor: user?.id as string | undefined,
  });

  const formInitialised = useRef(false);
  const lastSaved = useRef<string>('');

  const debouncedForm = useDebounce(courseForm, 800);

  useEffect(() => {
    if (!course || !formInitialised.current) return;
    const snapshot = JSON.stringify(debouncedForm);
    if (snapshot === lastSaved.current) return;

    const save = async () => {
      setSaveStatus('saving');
      try {
        await updateCourse(course._id, debouncedForm);
        lastSaved.current = snapshot;
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch {
        setSaveStatus('idle');
      }
    };
    save();
  }, [debouncedForm]);

  useEffect(() => {
    if (courseId && courses.length > 0 && !formInitialised.current) {
      const found = courses.find((c) => c._id === courseId);
      if (found) {
        setCourse(found);
        const init: CourseForm = {
          title: found.title,
          description: found.description || '',
          category: found.category || '',
          price: found.price || 0,
          discountedPrice: (found as any).discountedPrice || 0,
          thumbnailUrl: found.thumbnailUrl || '',
          isPaid: found.isPaid,
          instructor: user?.id,
        };
        setCourseForm(init);
        lastSaved.current = JSON.stringify(init);
        formInitialised.current = true;
      }
    }
  }, [courseId, courses, user]);

  useEffect(() => {
    const fetchDirect = async () => {
      if (courseId && !coursesLoading && !course && !courseFetchTimeout) {
        try {
          const res = await fetch(`/api/courses/${courseId}`);
          const data = await res.json();
          if (res.ok && data.data) {
            setCourse(data.data);
            const init: CourseForm = {
              title: data.data.title,
              description: data.data.description || '',
              category: data.data.category || '',
              price: data.data.price || 0,
              discountedPrice: data.data.discountedPrice || 0,
              thumbnailUrl: data.data.thumbnailUrl || '',
              isPaid: data.data.isPaid,
              instructor:
                typeof data.data.instructor === 'string'
                  ? data.data.instructor
                  : data.data.instructor?._id,
            };
            setCourseForm(init);
            lastSaved.current = JSON.stringify(init);
            formInitialised.current = true;
          } else {
            setCourseFetchTimeout(true);
          }
        } catch {
          setCourseFetchTimeout(true);
        }
      }
    };
    fetchDirect();
  }, [courseId, coursesLoading, course, courseFetchTimeout]);

  useEffect(() => {
    if (courseId && !course && !coursesLoading) {
      const t = setTimeout(() => setCourseFetchTimeout(true), 10000);
      return () => clearTimeout(t);
    }
  }, [courseId, course, coursesLoading]);

  useEffect(() => {
    if (courseId && course && courses.length > 0) {
      const updated = courses.find((c) => c._id === courseId);
      if (updated && updated.status !== course.status) {
        setCourse(updated);
      }
    }
  }, [courses, courseId, course]);

  useEffect(() => {
    if (courseId && !chaptersLoading) {
      setCourseChapters(getChaptersByCourse(courseId));
    }
  }, [courseId, chapters, getChaptersByCourse, chaptersLoading]);

  const fetchLessonsForChapter = useCallback(
    async (chapterId: string) => {
      try {
        const res = await fetch(`/api/lessons?chapter=${chapterId}&limit=1000`);
        const data = await res.json();
        const lessonsForChapter = Array.isArray(data?.data?.lessons)
          ? data.data.lessons
          : Array.isArray(data?.data)
          ? data.data
          : [];
        if (res.ok) {
          setChapterLessons(lessonsForChapter);
        } else {
          // Fallback to hook data
          setChapterLessons(getLessonsByChapter(chapterId));
        }
      } catch {
        setChapterLessons(getLessonsByChapter(chapterId));
      }
    },
    [getLessonsByChapter]
  );

  const handleSelectChapter = useCallback(
    (chapter: ChapterType) => {
      setSelectedChapter(chapter);
      setLessonSearch('');
      fetchLessonsForChapter(chapter._id);
    },
    [fetchLessonsForChapter]
  );

  // Re-sync lessons when the lessons list in the hook updates (after create/delete)
  useEffect(() => {
    if (selectedChapter) {
      fetchLessonsForChapter(selectedChapter._id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessons, selectedChapter?._id]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIdx = courseChapters.findIndex((c) => c._id === active.id);
    const newIdx = courseChapters.findIndex((c) => c._id === over.id);
    if (oldIdx === -1 || newIdx === -1) return;

    const original = [...courseChapters];
    const reordered = arrayMove(courseChapters, oldIdx, newIdx);
    setCourseChapters(reordered);

    if (courseId) {
      const ok = await reorderChapters(
        courseId,
        reordered.map((c, i) => ({ chapterId: c._id, order: i + 1 }))
      );
      if (!ok) setCourseChapters(original);
    }
  };

  const handleLessonDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIdx = chapterLessons.findIndex((l) => l._id === active.id);
    const newIdx = chapterLessons.findIndex((l) => l._id === over.id);
    if (oldIdx === -1 || newIdx === -1) return;

    const original = [...chapterLessons];
    const reordered = arrayMove(chapterLessons, oldIdx, newIdx);
    setChapterLessons(reordered);

    if (selectedChapter?._id) {
      const ok = await reorderLessons(
        selectedChapter._id,
        reordered.map((l, i) => ({ lessonId: l._id, order: i + 1 }))
      );
      if (!ok) setChapterLessons(original);
    }
  };

  const handleChapterCreate = async (data: any) => {
    const result = await createChapter(data);
    setShowChapterModal(false);
    return result;
  };

  const handleChapterUpdate = async (id: string, data: any) => {
    const result = await updateChapter(id, data);
    setShowChapterModal(false);
    return result;
  };

  const handleLessonCreate = async (data: any) => {
    const result = await createLesson(data);
    if (result) {
      setShowLessonModal(false);
      // Immediately refresh lessons list
      if (selectedChapter) await fetchLessonsForChapter(selectedChapter._id);
    }
    return result;
  };

  const handleLessonUpdate = async (id: string, data: any) => {
    const result = await updateLesson(id, data);
    if (result) {
      setShowLessonModal(false);
      if (selectedChapter) await fetchLessonsForChapter(selectedChapter._id);
    }
    return result;
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    setDeleteLoading(true);
    try {
      if (deleteItem.type === 'chapter') {
        await deleteChapter(deleteItem.id);
        if (selectedChapter?._id === deleteItem.id) {
          setSelectedChapter(null);
          setChapterLessons([]);
        }
      } else {
        await deleteLesson(deleteItem.id);
        if (selectedChapter) await fetchLessonsForChapter(selectedChapter._id);
      }
      setShowDeleteConfirm(false);
      setDeleteItem(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  const openDeleteConfirm = (type: 'chapter' | 'lesson', id: string, title: string) => {
    setDeleteItem({ type, id, title });
    setShowDeleteConfirm(true);
    setDeleteLoading(false);
  };

  const handleTogglePublish = async () => {
    if (!course || publishLoading) return;
    const newStatus = course.status === 'published' ? 'draft' : 'published';
    setPublishLoading(true);
    try {
      const result = await updateCourse(course._id, { status: newStatus });
      if (result) setCourse((prev) => (prev ? { ...prev, status: newStatus } : null));
    } finally {
      setPublishLoading(false);
    }
  };

  const filteredChapters = courseChapters.filter(
    (c) =>
      c.title.toLowerCase().includes(chapterSearch.toLowerCase()) ||
      c.description?.toLowerCase().includes(chapterSearch.toLowerCase())
  );
  const filteredLessons = chapterLessons.filter(
    (l) =>
      l.title.toLowerCase().includes(lessonSearch.toLowerCase()) ||
      l.description?.toLowerCase().includes(lessonSearch.toLowerCase())
  );

  if (coursesLoading && !course) {
    return (
      <InstructorRoleShell>
        <LoadingState message="Loading courses..." />
      </InstructorRoleShell>
    );
  }

  if (!course && courseId && (courses.length > 0 || courseFetchTimeout)) {
    return (
      <InstructorRoleShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <X className="w-8 h-8 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-2">Course not found</p>
            <p className="text-gray-600 mb-4">
              {courseFetchTimeout
                ? 'The course took too long to load. Please try again.'
                : "The course doesn't exist or you don't have permission to access it."}
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => router.push('/instructor/courses')}>Back to Courses</Button>
              <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
            </div>
          </div>
        </div>
      </InstructorRoleShell>
    );
  }

  if (!course) {
    return (
      <AdminRoleShell>
        <LoadingState message="Loading course..." />
      </AdminRoleShell>
    );
  }

  if (chaptersLoading || lessonsLoading) {
    return (
      <InstructorRoleShell>
        <LoadingState message="Loading course content..." />
      </InstructorRoleShell>
    );
  }

  return (
    <InstructorRoleShell>
      <main className="relative z-10 p-2 sm:p-4">
        <WelcomeSection
          title="Course Builder"
          description="Build and manage your course content"
        />

        {/* Back + auto-save indicator */}
        <div className="mb-4 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          {saveStatus !== 'idle' && (
            <span
              className={`text-xs font-medium px-3 py-1 rounded-full transition-all ${
                saveStatus === 'saving'
                  ? 'bg-blue-50 text-blue-500'
                  : 'bg-green-50 text-green-600'
              }`}
            >
              {saveStatus === 'saving' ? '⏳ Saving...' : '✓ Saved'}
            </span>
          )}
        </div>

        {/* Status bar */}
        <div className="mb-6 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${
                  course.status === 'published'
                    ? 'bg-green-500'
                    : course.status === 'archived'
                    ? 'bg-red-500'
                    : 'bg-yellow-500'
                }`}
              />
              <span className="text-sm font-medium text-gray-700">
                Status:{' '}
                {course.status === 'published'
                  ? 'Published'
                  : course.status === 'archived'
                  ? 'Archived'
                  : 'Draft'}
              </span>
              <span className="text-sm text-gray-500">{course.title}</span>
            </div>
            <div>
              {course.status === 'published' ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTogglePublish}
                  disabled={publishLoading}
                  className="flex items-center gap-2 text-yellow-600 border-yellow-300 hover:bg-yellow-50 disabled:opacity-50"
                >
                  {publishLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <EyeOff className="w-4 h-4" />}
                  {publishLoading ? 'Updating...' : 'Move to Draft'}
                </Button>
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleTogglePublish}
                  disabled={publishLoading}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                >
                  {publishLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                  {publishLoading ? 'Publishing...' : 'Publish Course'}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Course Information */}
        <PageSection title="Course Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column */}
            <div className="space-y-4">
              <AttractiveInput
                label="Course Title"
                value={courseForm.title}
                onChange={(e) => setCourseForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="Enter course title"
                variant="default"
                colorScheme="primary"
                size="md"
              />
              <AttractiveTextarea
                label="Description"
                value={courseForm.description}
                onChange={(e) => setCourseForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Enter course description"
                variant="default"
                colorScheme="primary"
                size="md"
                rows={3}
              />
              <div>
                <AttractiveInput
                  label="Category"
                  value={courseForm.category}
                  onChange={(e) => setCourseForm((p) => ({ ...p, category: e.target.value }))}
                  placeholder="Select or type a category"
                  variant="default"
                  colorScheme="primary"
                  size="md"
                  list="categories"
                />
                <datalist id="categories">
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat.name} />
                  ))}
                </datalist>
              </div>

              {/* Pricing */}
              <PriceSection
                isPaid={courseForm.isPaid}
                price={courseForm.price}
                discountedPrice={courseForm.discountedPrice}
                onIsPaidChange={(v) => setCourseForm((p) => ({ ...p, isPaid: v }))}
                onPriceChange={(v) => setCourseForm((p) => ({ ...p, price: v }))}
                onDiscountedPriceChange={(v) => setCourseForm((p) => ({ ...p, discountedPrice: v }))}
              />
            </div>

            {/* Right column — thumbnail */}
            <div>
              <ThumbnailUpload
                value={courseForm.thumbnailUrl}
                onChange={(url) => setCourseForm((p) => ({ ...p, thumbnailUrl: url }))}
              />
            </div>
          </div>
        </PageSection>

        {/* Chapters */}
        <PageSection
          title="Chapters"
          description={
            reordering
              ? 'Reordering chapters...'
              : deleting
              ? 'Deleting chapter...'
              : updating
              ? 'Updating chapter...'
              : 'Manage course chapters and their content'
          }
          className="mb-2 sm:mb-4"
          actions={
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search chapters..."
                  value={chapterSearch}
                  onChange={(e) => setChapterSearch(e.target.value)}
                  className="pl-10 pr-10 w-full sm:w-64"
                />
                {chapterSearch && (
                  <button
                    type="button"
                    onClick={() => setChapterSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <Button
                onClick={() => { setSelectedChapter(null); setShowChapterModal(true); }}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Chapter</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </div>
          }
        >
          <div className="w-full overflow-hidden">
            {filteredChapters.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Layers className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>
                  {chapterSearch
                    ? 'No chapters found matching your search.'
                    : 'No chapters yet. Create your first chapter to get started.'}
                </p>
              </div>
            ) : (
              <div className="relative">
                {(reordering || deleting || updating) && (
                  <StatusBanner
                    text={reordering ? 'Reordering chapters...' : deleting ? 'Deleting chapter...' : 'Updating chapter...'}
                    color={reordering ? 'blue' : deleting ? 'red' : 'yellow'}
                  />
                )}
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={filteredChapters.map((c) => c._id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-4">
                      {filteredChapters.map((chapter) => (
                        <DraggableChapterItem
                          key={chapter._id}
                          chapter={chapter}
                          isSelected={selectedChapter?._id === chapter._id}
                          onSelect={handleSelectChapter}
                          onEdit={(ch) => { setSelectedChapter(ch); setShowChapterModal(true); }}
                          onDelete={(ch) => openDeleteConfirm('chapter', ch._id, ch.title)}
                          lessonCount={getLessonsByChapter(chapter._id).length}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            )}
          </div>
        </PageSection>

        {/* Lessons */}
        {selectedChapter && (
          <PageSection
            title={`Lessons — ${selectedChapter.title}`}
            description={
              lessonsCreating
                ? 'Creating lesson...'
                : lessonsReordering
                ? 'Reordering lessons...'
                : 'Manage lessons within this chapter'
            }
            className="mb-2 sm:mb-4"
            actions={
              <div className="flex flex-col sm:flex-row gap-2 w-full">
                <div className="relative flex-1 min-w-0">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search lessons..."
                    value={lessonSearch}
                    onChange={(e) => setLessonSearch(e.target.value)}
                    className="pl-10 pr-10 w-full sm:w-64"
                  />
                  {lessonSearch && (
                    <button
                      type="button"
                      onClick={() => setLessonSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <Button
                  onClick={() => { setSelectedLesson(null); setShowLessonModal(true); }}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Add Lesson</span>
                  <span className="sm:hidden">Add</span>
                </Button>
              </div>
            }
          >
            <div className="w-full overflow-hidden">
              {lessonsCreating && <StatusBanner text="Creating lesson..." color="blue" />}
              {lessonsReordering && <StatusBanner text="Reordering lessons..." color="green" />}
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleLessonDragEnd}
              >
                <SortableContext
                  items={filteredLessons.map((l) => l._id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {filteredLessons.length === 0 ? (
                      <div className="text-center py-6 text-gray-500">
                        <Play className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p>
                          {lessonSearch
                            ? 'No lessons found matching your search.'
                            : 'No lessons in this chapter yet.'}
                        </p>
                      </div>
                    ) : (
                      filteredLessons.map((lesson) => (
                        <DraggableLessonItem
                          key={lesson._id}
                          lesson={lesson}
                          onEdit={(l) => { setSelectedLesson(l); setShowLessonModal(true); }}
                          onDelete={(l) => openDeleteConfirm('lesson', l._id, l.title)}
                          onManageQuiz={(l) => setQuizLessonId(l._id)}
                        />
                      ))
                    )}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          </PageSection>
        )}

        {/* Mobile FABs */}
        <div className="fixed bottom-6 right-6 z-40 sm:hidden flex flex-col gap-3">
          <Button
            onClick={() => { setSelectedLesson(null); setShowLessonModal(true); }}
            size="lg"
            className="rounded-full w-14 h-14 bg-green-600 hover:bg-green-700 text-white shadow-lg"
            title="Add Lesson"
          >
            <Play className="w-6 h-6" />
          </Button>
          <Button
            onClick={() => { setSelectedChapter(null); setShowChapterModal(true); }}
            size="lg"
            className="rounded-full w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
            title="Add Chapter"
          >
            <Plus className="w-6 h-6" />
          </Button>
        </div>

        {/* Modals */}
        <ChapterModal
          open={showChapterModal}
          onClose={() => setShowChapterModal(false)}
          chapter={selectedChapter}
          courseId={courseId || ''}
          existingChapters={courseChapters}
          onCreateChapter={handleChapterCreate}
          onUpdateChapter={handleChapterUpdate}
        />
        <LessonModal
          open={showLessonModal}
          onClose={() => { setShowLessonModal(false); setSelectedLesson(null); }}
          lesson={selectedLesson}
          chapterId={selectedChapter?._id || ''}
          courseId={courseId || ''}
          existingLessons={chapterLessons}
          onCreateLesson={handleLessonCreate}
          onUpdateLesson={handleLessonUpdate}
        />
        <LessonQuizModal
          open={!!quizLessonId}
          onClose={() => setQuizLessonId(null)}
          lessonId={quizLessonId || ''}
        />
        <ConfirmModal
          open={showDeleteConfirm}
          onClose={() => { setShowDeleteConfirm(false); setDeleteLoading(false); }}
          onConfirm={handleDelete}
          title={`Delete ${deleteItem?.type}`}
          description={`Are you sure you want to delete "${deleteItem?.title}"? This action cannot be undone.`}
          confirmText="Delete"
          variant="danger"
          loading={deleteLoading}
        />
      </main>
    </InstructorRoleShell>
  );
}

function LoadingState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
}

function StatusBanner({ text, color }: { text: string; color: 'blue' | 'red' | 'yellow' | 'green' }) {
  const colors = {
    blue: 'bg-blue-50 border-blue-200 text-blue-600 border-blue-500',
    red: 'bg-red-50 border-red-200 text-red-600 border-red-500',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-600 border-yellow-500',
    green: 'bg-green-50 border-green-200 text-green-600 border-green-500',
  }[color];

  const spinColor = {
    blue: 'border-blue-500',
    red: 'border-red-500',
    yellow: 'border-yellow-500',
    green: 'border-green-500',
  }[color];

  return (
    <div className={`border rounded-lg p-2 mb-4 ${colors.split(' ').slice(0, 2).join(' ')}`}>
      <div className={`flex items-center gap-2 text-sm ${colors.split(' ')[2]}`}>
        <div className={`w-4 h-4 border-2 ${spinColor} border-t-transparent rounded-full animate-spin`} />
        <span>{text}</span>
      </div>
    </div>
  );
}

export default function CourseBuilderPage() {
  return (
    <InstructorPageWrapper>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading course builder...</p>
            </div>
          </div>
        }
      >
        <CourseBuilderContent />
      </Suspense>
    </InstructorPageWrapper>
  );
}
