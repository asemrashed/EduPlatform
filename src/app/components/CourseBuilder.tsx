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
  LuTag as Tag,
  LuSparkles as Sparkles,
  LuMessageSquare as MessageSquare,
  LuStar as Star,
  LuUser as User,
} from 'react-icons/lu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { AttractiveInput } from '@/components/ui/attractive-input';
import { AttractiveTextarea } from '@/components/ui/attractive-textarea';
import { AttractiveSelect } from '@/components/ui/attractive-select';
import CustomEditor from '@/components/custom-editor';
import { InstructorSelector } from '@/components/ui/instructor-selector';
import ConfirmModal from '@/components/ui/confirm-modal';
import { AdminRoleShell } from '@/components/role-area/AdminRoleShell';
import { InstructorRoleShell } from '@/components/role-area/InstructorRoleShell';
import PageSection from '@/components/PageSection';
import WelcomeSection from '@/components/WelcomeSection';
import ChapterModal from '@/components/ChapterModal';
import LessonModal from '@/components/LessonModal';
import LessonQuizModal from '@/components/LessonQuizModal';
import DraggableChapterItem from '@/components/DraggableChapterItem';
import DraggableLessonItem from '@/components/DraggableLessonItem';
import { useCourses } from '@/hooks/useCourses';
import { useChapters } from '@/hooks/useChapters';
import { useLessons } from '@/hooks/useLessons';
import { useCourseCategories } from '@/hooks/useCourseCategories';
import { useTeachers } from '@/hooks/useTeachers';
import { useAppSelector } from '@/lib/hooks';
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

// Role type
type BuilderRole = 'instructor' | 'admin';

// Props for the unified component
interface UnifiedCourseBuilderProps {
  role: BuilderRole;
}

function buildCourseUpdatePayload(
  form: {
    title: string;
    description: string;
    category: string;
    price: number;
    discountedPrice: number;
    thumbnailUrl: string;
    isPaid: boolean;
    instructor?: string;
    certificateEnabled: boolean;
    certificateOutcomes: string[];
  },
  options?: { includeInstructor?: boolean }
) {
  const payload: Record<string, unknown> = {
    title: form.title,
    description: form.description,
    category: form.category,
    thumbnailUrl: form.thumbnailUrl,
    isPaid: form.isPaid,
    price: form.isPaid ? Number(form.price || 0) : 0,
    salePrice: form.isPaid ? Number(form.discountedPrice || 0) : 0,
    certificateEnabled: form.certificateEnabled,
    certificateOutcomes: form.certificateEnabled
      ? form.certificateOutcomes.map((line) => line.trim()).filter(Boolean)
      : [],
  };

  if (options?.includeInstructor) {
    payload.instructor = form.instructor || null;
  }

  return payload;
}

// Reusable Thumbnail Upload Component
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

// Reusable Price Section
function PriceSection({
  isPaid,
  price,
  discountedPrice,
  onIsPaidChange,
  onPriceChange,
  onDiscountedPriceChange,
  showDiscountedPrice = true,
}: {
  isPaid: boolean;
  price: number;
  discountedPrice: number;
  onIsPaidChange: (v: boolean) => void;
  onPriceChange: (v: number) => void;
  onDiscountedPriceChange: (v: number) => void;
  showDiscountedPrice?: boolean;
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
        <div className={`grid ${showDiscountedPrice ? 'grid-cols-2' : 'grid-cols-1'} gap-4 pt-1`}>
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
          {/* {showDiscountedPrice && ( */}
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
          {/* )} */}
        </div>
      )}
    </div>
  );
}

// Status Banner Component
function StatusBanner({ text, color }: { text: string; color: 'blue' | 'red' | 'yellow' | 'green' }) {
  const colors = {
    blue: 'bg-blue-50 border-blue-200 text-blue-600',
    red: 'bg-red-50 border-red-200 text-red-600',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-600',
    green: 'bg-green-50 border-green-200 text-green-600',
  }[color];

  const spinColor = {
    blue: 'border-blue-500',
    red: 'border-red-500',
    yellow: 'border-yellow-500',
    green: 'border-green-500',
  }[color];

  return (
    <div className={`border rounded-lg p-2 mb-4 ${colors}`}>
      <div className={`flex items-center gap-2 text-sm`}>
        <div className={`w-4 h-4 border-2 ${spinColor} border-t-transparent rounded-full animate-spin`} />
        <span>{text}</span>
      </div>
    </div>
  );
}

// Loading State Component
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

// Main Course Builder Component
function UnifiedCourseBuilderContent({ role }: UnifiedCourseBuilderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get('id');
  const { user } = useAppSelector((state) => state.auth);
  const isAdmin = role === 'admin';

  // Hooks
  const { courses, updateCourse, loading: coursesLoading } = useCourses();
  const {
    chapters,
    createChapter,
    updateChapter,
    deleteChapter,
    reorderChapters,
    fetchChapters,
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
    reordering: lessonsReordering,
  } = useLessons();
  const { categories, loading: categoriesLoading } = useCourseCategories();
  
  // Admin-specific hooks
  const { teachers } = useTeachers();

  // State
  const [course, setCourse] = useState<Course | null>(null);
  const [courseChapters, setCourseChapters] = useState<ChapterType[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<ChapterType | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<LessonType | null>(null);
  const [chapterLessons, setChapterLessons] = useState<LessonType[]>([]);
  const [chapterSearch, setChapterSearch] = useState('');
  const [lessonSearch, setLessonSearch] = useState('');
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [quizLessonId, setQuizLessonId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteItem, setDeleteItem] = useState<{ type: 'chapter' | 'lesson'; id: string; title: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [publishLoading, setPublishLoading] = useState(false);
  const [courseFetchTimeout, setCourseFetchTimeout] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  
  // Admin-specific state
  const [seeding, setSeeding] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewSearch, setReviewSearch] = useState('');
  const [updatingCourse, setUpdatingCourse] = useState(false);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Course Form State
  const [courseForm, setCourseForm] = useState<{
    title: string;
    description: string;
    category: string;
    price: number;
    discountedPrice: number;
    thumbnailUrl: string;
    isPaid: boolean;
    instructor?: string;
    certificateEnabled: boolean;
    certificateOutcomes: string[];
  }>({
    title: '',
    description: '',
    category: '',
    price: 0,
    discountedPrice: 0,
    thumbnailUrl: '',
    isPaid: false,
    instructor: isAdmin ? undefined : user?.id,
    certificateEnabled: false,
    certificateOutcomes: [],
  });

  const formInitialised = useRef(false);
  const lastSaved = useRef<string>('');

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Auto-save for instructor (debounced)
  const debouncedForm = useDebounce(courseForm, 800);

  useEffect(() => {
    if (!isAdmin && course && formInitialised.current) {
      const snapshot = JSON.stringify(debouncedForm);
      if (snapshot === lastSaved.current) return;

      const save = async () => {
        setSaveStatus('saving');
        try {
          await updateCourse(course._id, buildCourseUpdatePayload(debouncedForm));
          lastSaved.current = snapshot;
          setSaveStatus('saved');
          setTimeout(() => setSaveStatus('idle'), 2000);
        } catch {
          setSaveStatus('idle');
        }
      };
      save();
    }
  }, [debouncedForm, isAdmin, course]);

  // Fetch course data
  useEffect(() => {
    if (courseId && courses.length > 0 && !formInitialised.current) {
      const found = courses.find((c) => c._id === courseId);
      if (found) {
        setCourse(found);
        const certEnabled = Boolean((found as { certificateEnabled?: boolean }).certificateEnabled);
        const certOutcomes = (found as { certificateOutcomes?: string[] }).certificateOutcomes;
        const init = {
          title: found.title,
          description: found.description || '',
          category: found.category || '',
          price: found.price || 0,
          discountedPrice: (found as any).salePrice || 0,
          thumbnailUrl: found.thumbnailUrl || '',
          isPaid: found.isPaid,
          instructor: isAdmin 
            ? (typeof found.instructor === 'string' ? found.instructor : found.instructor?._id)
            : user?.id,
          certificateEnabled: certEnabled,
          certificateOutcomes:
            certEnabled && Array.isArray(certOutcomes) && certOutcomes.length > 0
              ? [...certOutcomes]
              : certEnabled
                ? ['']
                : [],
        };
        setCourseForm(init);
        lastSaved.current = JSON.stringify(init);
        formInitialised.current = true;
      }
    }
  }, [courseId, courses, user, isAdmin]);

  // Fallback direct fetch
  useEffect(() => {
    const fetchDirect = async () => {
      if (courseId && !coursesLoading && !course && !courseFetchTimeout) {
        try {
          const res = await fetch(`/api/courses/${courseId}`);
          const data = await res.json();
          if (res.ok && data.data) {
            setCourse(data.data);
            const certEnabled = Boolean(data.data.certificateEnabled);
            const init = {
              title: data.data.title,
              description: data.data.description || '',
              category: data.data.category || '',
              price: data.data.price || 0,
              discountedPrice: data.data.salePrice || 0,
              thumbnailUrl: data.data.thumbnailUrl || '',
              isPaid: data.data.isPaid,
              instructor: isAdmin
                ? (typeof data.data.instructor === 'string' ? data.data.instructor : data.data.instructor?._id)
                : user?.id,
              certificateEnabled: certEnabled,
              certificateOutcomes:
                certEnabled &&
                Array.isArray(data.data.certificateOutcomes) &&
                data.data.certificateOutcomes.length > 0
                  ? [...data.data.certificateOutcomes]
                  : certEnabled
                    ? ['']
                    : [],
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
  }, [courseId, coursesLoading, course, courseFetchTimeout, user, isAdmin]);

  // Fetch chapters
  useEffect(() => {
    if (courseId) {
      fetchChapters({ course: courseId, limit: 1000 });
    }
  }, [courseId, fetchChapters]);

  useEffect(() => {
    if (courseId && !chaptersLoading) {
      setCourseChapters(getChaptersByCourse(courseId));
    }
  }, [courseId, chapters, getChaptersByCourse, chaptersLoading]);

  // Fetch lessons for selected chapter
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

  useEffect(() => {
    if (selectedChapter) {
      fetchLessonsForChapter(selectedChapter._id);
    }
  }, [lessons, selectedChapter?._id, fetchLessonsForChapter]);

  // Admin: Fetch reviews
  useEffect(() => {
    if (isAdmin && courseId) {
      const fetchReviews = async () => {
        setReviewsLoading(true);
        try {
          const response = await fetch(`/api/admin/course-reviews?course=${courseId}&limit=100`);
          if (response.ok) {
            const data = await response.json();
            setReviews(data.data?.reviews || data.reviews || []);
          }
        } catch (error) {
          console.error('Error fetching reviews:', error);
        } finally {
          setReviewsLoading(false);
        }
      };
      fetchReviews();
    }
  }, [isAdmin, courseId]);

  // Admin: Toggle review display
  const toggleReviewDisplay = async (reviewId: string, currentStatus: boolean) => {
    if (!isAdmin) return;
    try {
      const response = await fetch(`/api/admin/course-reviews/${reviewId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDisplayed: !currentStatus }),
      });
      if (response.ok) {
        setReviews(prev => prev.map(review => 
          review._id === reviewId ? { ...review, isDisplayed: !currentStatus } : review
        ));
      }
    } catch (error) {
      console.error('Error toggling review display:', error);
    }
  };

  // Admin: Handle course update with debounce
  const handleCourseUpdateOnBlur = async () => {
    if (!isAdmin || !course || updatingCourse) return;
    if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current);

    const hasChanges = 
      courseForm.title !== course.title ||
      courseForm.description !== (course.description || '') ||
      courseForm.category !== (course.category || '') ||
      courseForm.price !== (course.price || 0) ||
      courseForm.discountedPrice !== ((course as any).discountedPrice || (course as any).salePrice || 0) ||
      courseForm.thumbnailUrl !== (course.thumbnailUrl || '') ||
      courseForm.isPaid !== course.isPaid ||
      courseForm.certificateEnabled !==
        Boolean((course as { certificateEnabled?: boolean }).certificateEnabled) ||
      JSON.stringify(courseForm.certificateOutcomes) !==
        JSON.stringify((course as { certificateOutcomes?: string[] }).certificateOutcomes || []);

    if (!hasChanges) return;

    updateTimeoutRef.current = setTimeout(async () => {
      setUpdatingCourse(true);
      try {
        const updatedCourse = await updateCourse(
          course._id,
          buildCourseUpdatePayload(courseForm, { includeInstructor: true })
        );
        if (updatedCourse) setCourse(updatedCourse);
      } catch (error) {
        console.error('Error updating course:', error);
      } finally {
        setUpdatingCourse(false);
      }
    }, 300);
  };

  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current);
    };
  }, []);

  // Chapter handlers
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

  // Lesson handlers
  const handleLessonCreate = async (data: any) => {
    const result = await createLesson(data);
    if (result) {
      setShowLessonModal(false);
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

  // Delete handler
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
  };

  // Publish toggle
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

  // Drag and drop handlers
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

  // Admin: Seed course
  const handleSeedCourse = async () => {
    if (!isAdmin || !course || !courseId || seeding) return;
    
    const confirmSeed = window.confirm(
      'This will create sample chapters and lessons. Do you want to continue?'
    );
    if (!confirmSeed) return;

    setSeeding(true);
    try {
      const sampleCourseData: any = { status: 'published' };
      if (!courseForm.title) sampleCourseData.title = 'Complete Professional Development Course';
      if (!courseForm.description) sampleCourseData.description = 'A comprehensive course...';
      if (!courseForm.category) sampleCourseData.category = 'Development';
      if (courseForm.isPaid && !courseForm.price) sampleCourseData.price = 99;
      if (!courseForm.thumbnailUrl) sampleCourseData.thumbnailUrl = 'https://live.themewild.com/edubo/assets/img/course/05.jpg';

      await updateCourse(courseId, sampleCourseData);

      // Sample chapters data (simplified for brevity)
      const sampleChapters = [
        { title: 'Introduction & Getting Started', description: 'Course introduction and setup.', order: 1 },
        { title: 'Fundamentals & Core Concepts', description: 'Master the fundamental concepts.', order: 2 },
        // Add more chapters as needed
      ];

      for (const chapterData of sampleChapters) {
        const createdChapter = await createChapter({ ...chapterData, course: courseId, isPublished: true });
        if (createdChapter) {
          await createLesson({
            title: 'Welcome to this chapter',
            description: 'Introduction to the chapter content',
            duration: 10,
            order: 1,
            chapter: createdChapter._id,
            course: courseId,
            isPublished: true,
          });
        }
      }

      alert('Course seeded successfully!');
    } catch (error) {
      console.error('Error seeding course:', error);
      alert('Failed to seed course.');
    } finally {
      setSeeding(false);
    }
  };

  // Filtered data
  const filteredChapters = courseChapters.filter(
    (c) => c.title.toLowerCase().includes(chapterSearch.toLowerCase()) ||
      c.description?.toLowerCase().includes(chapterSearch.toLowerCase())
  );
  const filteredLessons = chapterLessons.filter(
    (l) => l.title.toLowerCase().includes(lessonSearch.toLowerCase()) ||
      l.description?.toLowerCase().includes(lessonSearch.toLowerCase())
  );
  const filteredReviews = isAdmin ? reviews.filter(review => {
    if (!reviewSearch) return true;
    const searchLower = reviewSearch.toLowerCase();
    const studentName = `${review.student?.firstName || ''} ${review.student?.lastName || ''}`.toLowerCase();
    const reviewText = (review.comment || review.title || '').toLowerCase();
    return studentName.includes(searchLower) || reviewText.includes(searchLower);
  }) : [];

  // Loading states
  if (coursesLoading && !course) {
    return <LoadingState message="Loading courses..." />;
  }

  if (!course && courseId && (courses.length > 0 || courseFetchTimeout)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <X className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-2">Course not found</p>
          <div className="flex gap-2 justify-center">
            <Button onClick={() => router.push(isAdmin ? '/admin/courses' : '/instructor/courses')}>
              Back to Courses
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return <LoadingState message="Loading course..." />;
  }

  if (chaptersLoading && courseChapters.length === 0) {
    return <LoadingState message="Loading course content..." />;
  }

  // RoleShell wrapper
  const RoleShell = isAdmin ? AdminRoleShell : InstructorRoleShell;

  return (
    <RoleShell>
      <main className="relative z-10 p-2 sm:p-4">
        <WelcomeSection
          title="Course Builder"
          description="Build and manage your course content"
        />

        {/* Header: Back + Auto-save/Seed */}
        <div className="mb-4 flex items-center justify-between gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            {!isAdmin && saveStatus !== 'idle' && (
              <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                saveStatus === 'saving' ? 'bg-blue-50 text-blue-500' : 'bg-green-50 text-green-600'
              }`}>
                {saveStatus === 'saving' ? '⏳ Saving...' : '✓ Saved'}
              </span>
            )}
            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSeedCourse}
                disabled={seeding}
                className="flex items-center gap-2 border-green-500 text-green-600 hover:bg-green-50"
              >
                {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {seeding ? 'Seeding...' : 'Seed Course'}
              </Button>
            )}
          </div>
        </div>

        {/* Status Bar */}
        <div className="mb-6 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${
                course.status === 'published' ? 'bg-green-500' :
                course.status === 'archived' ? 'bg-red-500' : 'bg-yellow-500'
              }`} />
              <span className="text-sm font-medium text-gray-700">
                Status: {course.status === 'published' ? 'Published' : course.status === 'archived' ? 'Archived' : 'Draft'}
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
                  className="flex items-center gap-2 text-yellow-600 border-yellow-300 hover:bg-yellow-50"
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
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
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
            {/* Left Column */}
            <div className="space-y-4">
              <AttractiveInput
                label="Course Title"
                value={courseForm.title}
                onChange={(e) => setCourseForm((p) => ({ ...p, title: e.target.value }))}
                onBlur={isAdmin ? handleCourseUpdateOnBlur : undefined}
                placeholder="Enter course title"
                variant="default"
                colorScheme="primary"
                size="md"
              />
              
              {isAdmin ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <CustomEditor
                    value={courseForm.description}
                    onChange={(data) => setCourseForm((p) => ({ ...p, description: data }))}
                    onBlur={handleCourseUpdateOnBlur}
                    placeholder="Enter full course description"
                  />
                </div>
              ) : (
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
              )}

              {isAdmin ? (
                <AttractiveSelect
                  label="Category"
                  value={courseForm.category}
                  onChange={(e) => setCourseForm((p) => ({ ...p, category: e.target.value }))}
                  onBlur={handleCourseUpdateOnBlur}
                  placeholder="Select Category"
                  variant="default"
                  colorScheme="primary"
                  size="md"
                  options={categories.map((c) => ({ value: c.name, label: c.name }))}
                  loading={categoriesLoading}
                  icon="tag"
                />
              ) : (
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
              )}

              {/* Pricing */}
              <PriceSection
                isPaid={courseForm.isPaid}
                price={courseForm.price}
                discountedPrice={courseForm.discountedPrice}
                onIsPaidChange={(v) => setCourseForm((p) => ({ ...p, isPaid: v }))}
                onPriceChange={(v) => setCourseForm((p) => ({ ...p, price: v }))}
                onDiscountedPriceChange={(v) => setCourseForm((p) => ({ ...p, discountedPrice: v }))}
                showDiscountedPrice
              />

              <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4 space-y-4 md:col-span-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-800">Enable completion certificate</p>
                    <p className="text-xs text-gray-500 mt-0.5 max-w-xl">
                      When enabled, students who finish all lessons receive a downloadable PDF automatically.
                    </p>
                  </div>
                  <Switch
                    checked={courseForm.certificateEnabled}
                    onCheckedChange={(checked) => {
                      setCourseForm((prev) => ({
                        ...prev,
                        certificateEnabled: checked,
                        certificateOutcomes: checked
                          ? prev.certificateOutcomes.length
                            ? prev.certificateOutcomes
                            : ['']
                          : [],
                      }));
                      if (isAdmin) handleCourseUpdateOnBlur();
                    }}
                  />
                </div>
                {courseForm.certificateEnabled && (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Learner outcomes (shown on the certificate)
                    </label>
                    <div className="space-y-2">
                      {courseForm.certificateOutcomes.map((line, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <Input
                            value={line}
                            onChange={(e) => {
                              const copy = [...courseForm.certificateOutcomes];
                              copy[idx] = e.target.value;
                              setCourseForm((prev) => ({ ...prev, certificateOutcomes: copy }));
                            }}
                            onBlur={isAdmin ? handleCourseUpdateOnBlur : undefined}
                            placeholder="e.g. Completed all assessments with distinction"
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="shrink-0"
                            onClick={() => {
                              const filtered = courseForm.certificateOutcomes.filter((_, i) => i !== idx);
                              setCourseForm((prev) => ({
                                ...prev,
                                certificateOutcomes: filtered.length ? filtered : [''],
                              }));
                              if (isAdmin) handleCourseUpdateOnBlur();
                            }}
                            aria-label="Remove outcome line"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => {
                        setCourseForm((prev) => ({
                          ...prev,
                          certificateOutcomes: [...prev.certificateOutcomes, ''],
                        }));
                      }}
                    >
                      <Plus className="w-4 h-4" />
                      Add outcome line
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Thumbnail */}
            <div>
              <ThumbnailUpload
                value={courseForm.thumbnailUrl}
                onChange={(url) => {
                  setCourseForm((p) => ({ ...p, thumbnailUrl: url }));
                  if (isAdmin) handleCourseUpdateOnBlur();
                }}
              />
            </div>
          </div>

          {/* Admin: Instructor Selection */}
          {isAdmin && (
            <div className="mt-6">
              <InstructorSelector
                value={courseForm.instructor}
                onChange={(instructorId) => setCourseForm((p) => ({ ...p, instructor: instructorId }))}
                onSave={async (instructorId) => {
                  if (course) {
                    try {
                      await updateCourse(
                        course._id,
                        buildCourseUpdatePayload(
                          { ...courseForm, instructor: instructorId },
                          { includeInstructor: true }
                        )
                      );
                    } catch (error) {
                      console.error('Error updating course with instructor:', error);
                    }
                  }
                }}
                label="Instructor"
                placeholder="Select an instructor"
              />
            </div>
          )}
        </PageSection>

        {/* Chapters Section */}
        <PageSection
          title="Chapters"
          description={reordering ? 'Reordering chapters...' : deleting ? 'Deleting chapter...' : updating ? 'Updating chapter...' : 'Manage course chapters and their content'}
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
                <p>{chapterSearch ? 'No chapters found matching your search.' : 'No chapters yet. Create your first chapter to get started.'}</p>
              </div>
            ) : (
              <div className="relative">
                {(reordering || deleting || updating) && (
                  <StatusBanner
                    text={reordering ? 'Reordering chapters...' : deleting ? 'Deleting chapter...' : 'Updating chapter...'}
                    color={reordering ? 'blue' : deleting ? 'red' : 'yellow'}
                  />
                )}
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={filteredChapters.map((c) => c._id)} strategy={verticalListSortingStrategy}>
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

        {/* Lessons Section */}
        {selectedChapter && (
          <PageSection
            title={`Lessons — ${selectedChapter.title}`}
            description={lessonsCreating ? 'Creating lesson...' : lessonsReordering ? 'Reordering lessons...' : 'Manage lessons within this chapter'}
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
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleLessonDragEnd}>
                <SortableContext items={filteredLessons.map((l) => l._id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-3">
                    {filteredLessons.length === 0 ? (
                      <div className="text-center py-6 text-gray-500">
                        <Play className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p>{lessonSearch ? 'No lessons found matching your search.' : 'No lessons in this chapter yet.'}</p>
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

        {/* Admin: Reviews Section */}
        {isAdmin && selectedChapter === null && (
          <PageSection
            title="Course Reviews"
            description="Manage student reviews for this course"
            actions={
              <div className="relative flex-1 min-w-0 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search reviews..."
                  value={reviewSearch}
                  onChange={(e) => setReviewSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            }
          >
            {reviewsLoading ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto" />
              </div>
            ) : filteredReviews.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>{reviewSearch ? 'No reviews found.' : 'No reviews yet for this course.'}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredReviews.map((review) => (
                  <div key={review._id} className="border rounded-lg p-4 bg-white">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-500" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {review.student?.firstName} {review.student?.lastName}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleReviewDisplay(review._id, review.isDisplayed)}
                        className={`flex items-center gap-2 ${review.isDisplayed ? 'text-green-600 border-green-300' : 'text-gray-400'}`}
                      >
                        {review.isDisplayed ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        {review.isDisplayed ? 'Displayed' : 'Hidden'}
                      </Button>
                    </div>
                    <p className="text-gray-600 mt-3">{review.comment}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
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
    </RoleShell>
  );
}

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// Export wrapper with Suspense
export default function UnifiedCourseBuilder({ role }: UnifiedCourseBuilderProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <LoadingState message="Loading course builder..." />
      </div>
    }>
      <UnifiedCourseBuilderContent role={role} />
    </Suspense>
  );
}

// Also export as named exports for backward compatibility
export const InstructorCourseBuilder = () => <UnifiedCourseBuilder role="instructor" />;
export const AdminCourseBuilder = () => <UnifiedCourseBuilder role="admin" />;
