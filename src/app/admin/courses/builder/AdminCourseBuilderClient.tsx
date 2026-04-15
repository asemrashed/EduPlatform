'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LuArrowLeft as ArrowLeft, LuPlus as Plus, LuBookOpen as BookOpen, LuPlay as Play, LuPencil as Edit, LuTrash2 as Trash2, LuEye as Eye, LuEyeOff as EyeOff, LuDollarSign as DollarSign, LuClock as Clock, LuUsers as Users, LuSearch as Search, LuX as X, LuLayers as Layers, LuLoader as Loader2, LuUser as User, LuChevronDown as ChevronDown, LuSparkles as Sparkles, LuStar as Star, LuMessageSquare as MessageSquare, LuCheck as Check } from 'react-icons/lu';;
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { AttractiveInput } from '@/components/ui/attractive-input';
import { AttractiveSelect } from '@/components/ui/attractive-select';
import CustomEditor from '@/components/custom-editor';
import { InstructorSelector } from '@/components/ui/instructor-selector';
import ConfirmModal from '@/components/ui/confirm-modal';
import { AdminRoleShell } from '@/components/role-area/AdminRoleShell';
import PageSection from '@/components/PageSection';
import WelcomeSection from '@/components/WelcomeSection';
import ChapterModal from '@/components/ChapterModal';
import LessonModal from '@/components/LessonModal';
import AdminPageWrapper from '@/components/AdminPageWrapper';
import { useCourses } from '@/hooks/useCourses';
import { useChapters } from '@/hooks/useChapters';
import { useLessons } from '@/hooks/useLessons';
import { useCourseCategories } from '@/hooks/useCourseCategories';
import { useTeachers } from '@/hooks/useTeachers';
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

function CourseBuilderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get('id');

  const { courses, updateCourse, loading: coursesLoading } = useCourses();
  const { chapters, createChapter, updateChapter, deleteChapter, reorderChapters, getChaptersByCourse, refreshChapters, fetchChapters, loading: chaptersLoading, reordering, deleting, updating } = useChapters();
  const { lessons, createLesson, updateLesson, deleteLesson, reorderLessons, getLessonsByChapter, refreshLessons, fetchLessons, loading: lessonsLoading, creating: lessonsCreating, deleting: lessonsDeleting, reordering: lessonsReordering } = useLessons();
  const { categories, loading: categoriesLoading } = useCourseCategories();
  const { teachers, loading: loadingTeachers } = useTeachers();

  const [course, setCourse] = useState<Course | null>(null);
  const [courseChapters, setCourseChapters] = useState<ChapterType[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<ChapterType | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<LessonType | null>(null);
  const [chapterLessons, setChapterLessons] = useState<LessonType[]>([]);
  const [hasLoadedLessons, setHasLoadedLessons] = useState(false);
  const [search, setSearch] = useState('');
  const [chapterSearch, setChapterSearch] = useState('');
  const [lessonSearch, setLessonSearch] = useState('');
  
  // Modals
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [quizLessonId, setQuizLessonId] = useState<string | null>(null);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px of movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteItem, setDeleteItem] = useState<{ type: 'chapter' | 'lesson'; id: string; title: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [publishLoading, setPublishLoading] = useState(false);
  const [courseFetchTimeout, setCourseFetchTimeout] = useState(false);
  const [showInstructorDropdown, setShowInstructorDropdown] = useState(false);
  const [instructorSearch, setInstructorSearch] = useState('');
  const [seeding, setSeeding] = useState(false);
  const [updatingCourse, setUpdatingCourse] = useState(false);
  const updateTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  
  // Reviews management
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewSearch, setReviewSearch] = useState('');

  // Filter teachers based on search
  const filteredTeachers = (teachers ?? []).filter((teacher) =>
    teacher.firstName.toLowerCase().includes(instructorSearch.toLowerCase()) ||
    teacher.lastName.toLowerCase().includes(instructorSearch.toLowerCase()) ||
    teacher.email.toLowerCase().includes(instructorSearch.toLowerCase())
  );

  // Course form
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    category: '',
    price: 0,
    thumbnailUrl: '',
    isPaid: false,
    instructor: undefined as string | undefined,
  });

  useEffect(() => {
    if (courseId && courses.length > 0) {
      const foundCourse = courses.find(c => c._id === courseId);
      console.log('Found course:', foundCourse);
      console.log('Course status:', foundCourse?.status);
      console.log('Course status type:', typeof foundCourse?.status);
      console.log('Course status value:', foundCourse?.status);
      if (foundCourse) {
        setCourse(foundCourse);
        setCourseForm({
          title: foundCourse.title,
          description: foundCourse.description || '',
          category: foundCourse.category || '',
          price: foundCourse.price || 0,
          thumbnailUrl: foundCourse.thumbnailUrl || '',
          isPaid: foundCourse.isPaid,
          instructor: typeof foundCourse.instructor === 'string' ? foundCourse.instructor : foundCourse.instructor?._id,
        });
        console.log('Course state set with status:', foundCourse.status);
      }
    }
  }, [courseId, courses]);

  // Fallback: fetch specific course if not found in courses list
  useEffect(() => {
    const fetchSpecificCourse = async () => {
      if (courseId && !coursesLoading && !course && !courseFetchTimeout) {
        try {
          console.log('Course not found in list, fetching directly...');
          const response = await fetch(`/api/courses/${courseId}`);
          const data = await response.json();
          
          if (response.ok && data.data) {
            console.log('Fetched course directly:', data.data);
            setCourse(data.data);
            setCourseForm({
              title: data.data.title,
              description: data.data.description || '',
              category: data.data.category || '',
              price: data.data.price || 0,
              thumbnailUrl: data.data.thumbnailUrl || '',
              isPaid: data.data.isPaid,
              instructor: typeof data.data.instructor === 'string' ? data.data.instructor : data.data.instructor?._id,
            });
          } else {
            console.error('Failed to fetch course:', data.error);
            setCourseFetchTimeout(true);
          }
        } catch (error) {
          console.error('Error fetching specific course:', error);
          setCourseFetchTimeout(true);
        }
      }
    };

    fetchSpecificCourse();
  }, [courseId, coursesLoading, course, courseFetchTimeout]);

  // Set timeout to prevent infinite loading
  useEffect(() => {
    if (courseId && !course && !coursesLoading) {
      const timeout = setTimeout(() => {
        console.log('Course fetch timeout reached');
        setCourseFetchTimeout(true);
      }, 10000); // 10 second timeout

      return () => clearTimeout(timeout);
    }
  }, [courseId, course, coursesLoading]);

  // Sync course state when courses list is updated
  useEffect(() => {
    if (courseId && course && courses.length > 0) {
      const updatedCourse = courses.find(c => c._id === courseId);
      if (updatedCourse && updatedCourse.status !== course.status) {
        console.log('Syncing course state - status changed from', course.status, 'to', updatedCourse.status);
        setCourse(updatedCourse);
        // Refresh chapters when course is synced
        fetchChapters({ course: courseId });
      }
    }
  }, [courses, courseId, course, fetchChapters]);

  // Fetch chapters when courseId is available
  useEffect(() => {
    if (courseId) {
      fetchChapters({ course: courseId });
    }
  }, [courseId, fetchChapters]);

  // Update courseChapters when chapters change
  useEffect(() => {
    if (courseId && !chaptersLoading) {
      const courseChapters = getChaptersByCourse(courseId);
      setCourseChapters(courseChapters);
    }
  }, [courseId, chapters, getChaptersByCourse, chaptersLoading]);

  // Fetch lessons when a chapter is selected
  useEffect(() => {
    if (selectedChapter?._id) {
      // Reset hasLoadedLessons when switching to a new chapter
      setHasLoadedLessons(false);
      fetchLessons({ chapter: selectedChapter._id });
    } else {
      // Reset when no chapter is selected
      setChapterLessons([]);
      setHasLoadedLessons(false);
    }
  }, [selectedChapter?._id, fetchLessons]);

  // Update chapterLessons when lessons change
  useEffect(() => {
    if (selectedChapter && !lessonsLoading) {
      const chapterLessons = getLessonsByChapter(selectedChapter._id);
      setChapterLessons(chapterLessons);
      if (chapterLessons.length > 0 || lessons.length > 0) {
        setHasLoadedLessons(true);
      }
    }
  }, [selectedChapter, lessons, getLessonsByChapter, lessonsLoading]);

  // Fetch reviews for the course
  const fetchReviews = async () => {
    if (!courseId) return;
    setReviewsLoading(true);
    try {
      const response = await fetch(`/api/admin/course-reviews?course=${courseId}&limit=100`, {
        cache: 'no-store',
      });
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

  // Fetch reviews when courseId is available
  useEffect(() => {
    if (courseId) {
      fetchReviews();
    }
  }, [courseId]);

  // Toggle review display status
  const toggleReviewDisplay = async (reviewId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/course-reviews/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          isDisplayed: !currentStatus,
          action: !currentStatus ? 'display' : 'hide'
        }),
      });

      if (response.ok) {
        // Update local state
        setReviews(prev => prev.map(review => 
          review._id === reviewId 
            ? { ...review, isDisplayed: !currentStatus }
            : review
        ));
      }
    } catch (error) {
      console.error('Error toggling review display:', error);
    }
  };

  // Filter reviews based on search
  const filteredReviews = reviews.filter(review => {
    if (!reviewSearch) return true;
    const searchLower = reviewSearch.toLowerCase();
    const studentName = `${review.student?.firstName || ''} ${review.student?.lastName || ''}`.toLowerCase();
    const reviewText = (review.comment || review.title || '').toLowerCase();
    return studentName.includes(searchLower) || reviewText.includes(searchLower);
  });

  const handleCourseUpdate = async (updates?: Partial<typeof courseForm>) => {
    if (!course) return;

    try {
      const updateData = updates ? { ...courseForm, ...updates } : courseForm;
      console.log('Toggle clicked - Current status:', course.status);
      console.log('Toggle clicked - New status:', course.status === 'published' ? 'draft' : 'published');
      console.log('Update data:', updateData);
      
      const result = await updateCourse(course._id, updateData);
      console.log('Update result:', result);
      
      // Update local state if updates were provided
      if (updates) {
        setCourseForm(prev => ({ ...prev, ...updates }));
        setCourse(prev => prev ? { ...prev, ...updates } : null);
        console.log('Local state updated');
      }
    } catch (error) {
      console.error('Error updating course:', error);
    }
  };

  const handleTogglePublish = async () => {
    if (!course || publishLoading) return;
    
    const newStatus = course.status === 'published' ? 'draft' : 'published';
    console.log('Toggle clicked - Current course:', course);
    console.log('Toggle clicked - Current status:', course.status);
    console.log('Toggle clicked - Current status type:', typeof course.status);
    console.log('Toggle clicked - New status:', newStatus);
    
    try {
      setPublishLoading(true);
      // Update the course directly with just the status field
      const result = await updateCourse(course._id, { status: newStatus });
      console.log('Update result:', result);
      console.log('Update result status:', result?.status);
      console.log('Update result status type:', typeof result?.status);
      
      if (result) {
        // Update local state immediately
        setCourse(prev => prev ? { ...prev, status: newStatus } : null);
        console.log('Local state updated with new status:', newStatus);
        console.log('Course state after update:', course);
      }
    } catch (error) {
      console.error('Error toggling course status:', error);
    } finally {
      setPublishLoading(false);
    }
  };

  const handleCourseUpdateOnBlur = async () => {
    if (!course || updatingCourse) return;

    // Clear any pending timeout
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
      updateTimeoutRef.current = null;
    }

    // Only update if there are actual changes
    const hasChanges = 
      courseForm.title !== course.title ||
      courseForm.description !== (course.description || '') ||
      courseForm.category !== (course.category || '') ||
      courseForm.price !== (course.price || 0) ||
      courseForm.thumbnailUrl !== (course.thumbnailUrl || '') ||
      courseForm.isPaid !== course.isPaid;

    if (!hasChanges) {
      return; // No changes, skip API call
    }

    // Debounce the update to avoid too many API calls
    updateTimeoutRef.current = setTimeout(async () => {
      setUpdatingCourse(true);
      try {
        const updatedCourse = await updateCourse(course._id, courseForm);
        if (updatedCourse) {
          setCourse(updatedCourse);
          // Don't refresh chapters/lessons - only update course data
          // Chapters and lessons are already loaded and don't need to be reloaded
        }
    } catch (error) {
      console.error('Error updating course:', error);
      } finally {
        setUpdatingCourse(false);
      }
    }, 300); // 300ms debounce
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
    }
  };
  }, []);

  const handleSearchChange = (value: string) => {
    setSearch(value);
  };

  const handleChapterSearchChange = (value: string) => {
    setChapterSearch(value);
  };

  const handleLessonSearchChange = (value: string) => {
    setLessonSearch(value);
  };

  // Filter chapters based on search
  const filteredChapters = courseChapters.filter(chapter =>
    chapter.title.toLowerCase().includes(chapterSearch.toLowerCase()) ||
    chapter.description?.toLowerCase().includes(chapterSearch.toLowerCase())
  );

  // Filter lessons based on search
  const filteredLessons = chapterLessons.filter(lesson =>
    lesson.title.toLowerCase().includes(lessonSearch.toLowerCase()) ||
    lesson.description?.toLowerCase().includes(lessonSearch.toLowerCase())
  );

  const handleChapterCreate = async (data: any) => {
    console.log('Course builder handleChapterCreate called with data:', data);
    try {
      const result = await createChapter(data);
      console.log('Chapter created successfully:', result);
      setShowChapterModal(false);
      return result;
    } catch (error) {
      console.error('Error creating chapter:', error);
      return null;
    }
  };

  const handleChapterUpdate = async (id: string, data: any) => {
    try {
      const result = await updateChapter(id, data);
      setShowChapterModal(false);
      return result;
    } catch (error) {
      console.error('Error updating chapter:', error);
      return null;
    }
  };

  const handleLessonCreate = async (data: any) => {
    try {
      const result = await createLesson(data);
      if (result && selectedChapter?._id) {
        // Refresh lessons for the current chapter after creation
        await fetchLessons({ chapter: selectedChapter._id });
      }
      if (result) {
        setShowLessonModal(false);
      }
      return result;
    } catch (error) {
      console.error('Error creating lesson:', error);
      throw error;
    }
  };

  const handleLessonUpdate = async (id: string, data: any) => {
    try {
      const result = await updateLesson(id, data);
      if (result && selectedChapter?._id) {
        // Refresh lessons for the current chapter after update
        await fetchLessons({ chapter: selectedChapter._id });
      }
      if (result) {
        setShowLessonModal(false);
      }
      return result;
    } catch (error) {
      console.error('Error updating lesson:', error);
      throw error;
    }
  };

  // Handle drag end for chapter reordering
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = courseChapters.findIndex((chapter) => chapter._id === active.id);
    const newIndex = courseChapters.findIndex((chapter) => chapter._id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    // Store original order for potential revert
    const originalChapters = [...courseChapters];

    // Update local state immediately for better UX
    const newChapters = arrayMove(courseChapters, oldIndex, newIndex);
    setCourseChapters(newChapters);

    // Update order numbers
    const chapterOrders = newChapters.map((chapter, index) => ({
      chapterId: chapter._id,
      order: index + 1,
    }));

    console.log('Chapter reorder:', {
      courseId,
      chapterOrders,
      newChapters: newChapters.map(c => ({ id: c._id, title: c.title, order: c.order }))
    });

    // Save to database
    if (courseId) {
      const success = await reorderChapters(courseId, chapterOrders);
      if (!success) {
        // Revert on failure using original order
        setCourseChapters(originalChapters);
      }
    }
  };

  // Handle drag start to prevent form submissions
  const handleDragStart = (event: any) => {
    // Prevent any default drag behavior that might cause page reload
    if (event.nativeEvent) {
      event.nativeEvent.preventDefault();
      event.nativeEvent.stopPropagation();
    }
  };

  // Handle lesson drag end for reordering
  const handleLessonDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = chapterLessons.findIndex((lesson) => lesson._id === active.id);
    const newIndex = chapterLessons.findIndex((lesson) => lesson._id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    // Store original order for potential revert
    const originalLessons = [...chapterLessons];

    // Update local state immediately for better UX
    const newLessons = arrayMove(chapterLessons, oldIndex, newIndex);
    setChapterLessons(newLessons);

    // Update order numbers
    const lessonOrders = newLessons.map((lesson, index) => ({
      lessonId: lesson._id,
      order: index + 1,
    }));

    console.log('Lesson reorder:', {
      chapterId: selectedChapter?._id,
      lessonOrders,
      newLessons: newLessons.map(l => ({ id: l._id, title: l.title, order: l.order }))
    });

    // Save to database
    if (selectedChapter?._id) {
      const success = await reorderLessons(selectedChapter._id, lessonOrders);
      if (!success) {
        // Revert on failure using original order
        setChapterLessons(originalLessons);
      }
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;

    setDeleteLoading(true);
    try {
      if (deleteItem.type === 'chapter') {
        await deleteChapter(deleteItem.id);
      } else {
        await deleteLesson(deleteItem.id);
      }
      setShowDeleteConfirm(false);
      setDeleteItem(null);
    } catch (error) {
      console.error('Error deleting item:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const openDeleteConfirm = (type: 'chapter' | 'lesson', id: string, title: string) => {
    setDeleteItem({ type, id, title });
    setShowDeleteConfirm(true);
    setDeleteLoading(false);
  };

  // Seed course with sample chapters and lessons
  const handleSeedCourse = async () => {
    if (!course || !courseId || seeding) return;

    const confirmSeed = window.confirm(
      'This will create a complete course with title, description, pricing, 8 chapters, and 40+ lessons, then publish it. This may take a moment. Do you want to continue?'
    );

    if (!confirmSeed) return;

    setSeeding(true);
    try {
      // Sample course data - only update if fields are empty
      const sampleCourseData: any = {
        status: 'published', // Always publish the course
      };

      // Update course title if empty
      if (!courseForm.title || courseForm.title.trim() === '') {
        sampleCourseData.title = 'Complete Professional Development Course';
      }

      // Update course description if empty
      if (!courseForm.description || courseForm.description.trim() === '') {
        sampleCourseData.description = 'A comprehensive course designed to take you from beginner to advanced level. Learn industry-standard practices, build real-world projects, and master the skills needed for professional development. This course includes hands-on exercises, practical examples, and complete project walkthroughs.';
      }

      // Update category if empty
      if (!courseForm.category || courseForm.category.trim() === '') {
        sampleCourseData.category = 'Development';
      }

      // Set price if not set and course is paid
      if (courseForm.isPaid && (!courseForm.price || courseForm.price === 0)) {
        sampleCourseData.price = 99;
        sampleCourseData.salePrice = 79; // Add a discount
      }

      // Set thumbnail if empty
      if (!courseForm.thumbnailUrl || courseForm.thumbnailUrl.trim() === '') {
        sampleCourseData.thumbnailUrl = 'https://live.themewild.com/edubo/assets/img/course/05.jpg';
      }

      // Update course with sample data (always update to publish)
      const updatedCourse = await updateCourse(courseId, sampleCourseData);
      
      // Update local state
      if (updatedCourse) {
        setCourse(updatedCourse);
        setCourseForm(prev => ({
          ...prev,
          title: updatedCourse.title || prev.title,
          description: updatedCourse.description || prev.description,
          category: updatedCourse.category || prev.category,
          price: updatedCourse.price || prev.price,
          thumbnailUrl: updatedCourse.thumbnailUrl || prev.thumbnailUrl,
          isPaid: updatedCourse.isPaid !== undefined ? updatedCourse.isPaid : prev.isPaid,
          instructor: prev.instructor,
        }));
      }

      // Comprehensive sample chapters data
      const sampleChapters = [
        {
          title: 'Introduction & Getting Started',
          description: 'Welcome to the course! Learn about the course structure, objectives, and get your development environment set up.',
          order: 1,
        },
        {
          title: 'Fundamentals & Core Concepts',
          description: 'Master the fundamental concepts and principles that form the foundation of this subject.',
          order: 2,
        },
        {
          title: 'Intermediate Concepts',
          description: 'Build upon the fundamentals and explore intermediate-level topics and techniques.',
          order: 3,
        },
        {
          title: 'Advanced Topics',
          description: 'Dive deep into advanced concepts, patterns, and sophisticated techniques used by professionals.',
          order: 4,
        },
        {
          title: 'Best Practices & Optimization',
          description: 'Learn industry best practices, optimization techniques, and how to write maintainable code.',
          order: 5,
        },
        {
          title: 'Real-World Projects',
          description: 'Apply everything you\'ve learned by building complete, real-world projects from scratch.',
          order: 6,
        },
        {
          title: 'Testing & Quality Assurance',
          description: 'Learn how to write tests, ensure code quality, and implement proper quality assurance practices.',
          order: 7,
        },
        {
          title: 'Deployment & Production',
          description: 'Deploy your applications to production, configure servers, and manage live applications.',
          order: 8,
        },
      ];

      // Comprehensive sample lessons data for each chapter
      const sampleLessons = [
        // Chapter 1: Introduction
        [
          { title: 'Welcome to the Course', description: 'Course introduction, instructor background, and what to expect', duration: 12, order: 1 },
          { title: 'Course Overview & Learning Path', description: 'Understanding the course structure and learning objectives', duration: 18, order: 2 },
          { title: 'Prerequisites & Required Knowledge', description: 'What you need to know before starting this course', duration: 15, order: 3 },
          { title: 'Development Environment Setup', description: 'Installing and configuring your development tools', duration: 25, order: 4 },
          { title: 'Your First Project', description: 'Create your first project and verify everything is working', duration: 20, order: 5 },
        ],
        // Chapter 2: Fundamentals
        [
          { title: 'Core Concepts Explained', description: 'Understanding the fundamental principles and concepts', duration: 35, order: 1 },
          { title: 'Basic Syntax & Structure', description: 'Learning the basic syntax and code structure', duration: 30, order: 2 },
          { title: 'Variables & Data Types', description: 'Working with variables and different data types', duration: 28, order: 3 },
          { title: 'Control Flow & Logic', description: 'Conditional statements, loops, and logical operations', duration: 40, order: 4 },
          { title: 'Functions & Methods', description: 'Creating and using functions effectively', duration: 35, order: 5 },
          { title: 'Hands-On Practice', description: 'Practice exercises to reinforce fundamental concepts', duration: 45, order: 6 },
        ],
        // Chapter 3: Intermediate
        [
          { title: 'Object-Oriented Programming', description: 'Introduction to OOP principles and patterns', duration: 50, order: 1 },
          { title: 'Data Structures', description: 'Working with arrays, objects, and complex data structures', duration: 45, order: 2 },
          { title: 'Error Handling', description: 'Proper error handling and exception management', duration: 30, order: 3 },
          { title: 'Working with APIs', description: 'Making API calls and handling responses', duration: 40, order: 4 },
          { title: 'Async Programming', description: 'Understanding asynchronous operations and promises', duration: 50, order: 5 },
          { title: 'Intermediate Project', description: 'Build a project using intermediate concepts', duration: 60, order: 6 },
        ],
        // Chapter 4: Advanced
        [
          { title: 'Advanced Patterns & Techniques', description: 'Master advanced programming patterns and techniques', duration: 55, order: 1 },
          { title: 'Performance Optimization', description: 'Optimizing code for better performance', duration: 45, order: 2 },
          { title: 'Memory Management', description: 'Understanding memory usage and optimization', duration: 40, order: 3 },
          { title: 'Security Best Practices', description: 'Implementing security measures in your applications', duration: 50, order: 4 },
          { title: 'Advanced Algorithms', description: 'Complex algorithms and problem-solving techniques', duration: 60, order: 5 },
          { title: 'Architecture Patterns', description: 'Design patterns and architectural decisions', duration: 55, order: 6 },
        ],
        // Chapter 5: Best Practices
        [
          { title: 'Code Organization', description: 'How to structure and organize your codebase', duration: 40, order: 1 },
          { title: 'Naming Conventions', description: 'Best practices for naming variables, functions, and files', duration: 25, order: 2 },
          { title: 'Documentation', description: 'Writing clear and comprehensive documentation', duration: 35, order: 3 },
          { title: 'Code Review Process', description: 'How to conduct and participate in code reviews', duration: 30, order: 4 },
          { title: 'Version Control Best Practices', description: 'Using Git effectively and following best practices', duration: 40, order: 5 },
          { title: 'Refactoring Techniques', description: 'Improving code quality through refactoring', duration: 45, order: 6 },
        ],
        // Chapter 6: Real-World Projects
        [
          { title: 'Project Planning & Setup', description: 'Planning your project and setting up the structure', duration: 35, order: 1 },
          { title: 'Building the Core Features', description: 'Implementing the main features of the application', duration: 90, order: 2 },
          { title: 'User Interface Development', description: 'Creating an intuitive and responsive user interface', duration: 75, order: 3 },
          { title: 'Integration & APIs', description: 'Integrating third-party services and APIs', duration: 60, order: 4 },
          { title: 'Database Integration', description: 'Setting up and working with databases', duration: 70, order: 5 },
          { title: 'Project Completion & Polish', description: 'Finalizing the project and adding finishing touches', duration: 50, order: 6 },
        ],
        // Chapter 7: Testing
        [
          { title: 'Introduction to Testing', description: 'Why testing is important and testing fundamentals', duration: 30, order: 1 },
          { title: 'Unit Testing', description: 'Writing and running unit tests', duration: 45, order: 2 },
          { title: 'Integration Testing', description: 'Testing how different parts work together', duration: 50, order: 3 },
          { title: 'Test-Driven Development', description: 'TDD methodology and practices', duration: 40, order: 4 },
          { title: 'Testing Tools & Frameworks', description: 'Using testing tools and frameworks effectively', duration: 35, order: 5 },
          { title: 'Continuous Integration', description: 'Setting up CI/CD pipelines for automated testing', duration: 45, order: 6 },
        ],
        // Chapter 8: Deployment
        [
          { title: 'Deployment Strategies', description: 'Different deployment strategies and when to use them', duration: 40, order: 1 },
          { title: 'Server Configuration', description: 'Configuring servers for production deployment', duration: 50, order: 2 },
          { title: 'Environment Setup', description: 'Setting up production environments', duration: 45, order: 3 },
          { title: 'Monitoring & Logging', description: 'Monitoring applications and setting up logging', duration: 40, order: 4 },
          { title: 'Scaling Applications', description: 'Scaling your application to handle more traffic', duration: 55, order: 5 },
          { title: 'Maintenance & Updates', description: 'Maintaining and updating production applications', duration: 35, order: 6 },
        ],
      ];

      let totalChapters = 0;
      let totalLessons = 0;

      // Create chapters and lessons
      for (let i = 0; i < sampleChapters.length; i++) {
        const chapterData = {
          ...sampleChapters[i],
          course: courseId,
          isPublished: true,
        };

        // Create chapter
        const createdChapter = await createChapter(chapterData);
        if (!createdChapter) {
          console.error(`Failed to create chapter: ${sampleChapters[i].title}`);
          continue;
        }

        totalChapters++;

        // Create lessons for this chapter
        const chapterLessons = sampleLessons[i] || [];
        for (let j = 0; j < chapterLessons.length; j++) {
          const lessonData = {
            ...chapterLessons[j],
            chapter: createdChapter._id,
            course: courseId,
            isPublished: true,
            isFree: i === 0 && j === 0, // First lesson of first chapter is free
          };

          const createdLesson = await createLesson(lessonData);
          if (createdLesson) {
            totalLessons++;
          }
        }
      }

      // Refresh chapters and lessons
      await refreshChapters();
      await refreshLessons();
      
      // Show success message
      alert(`Course seeded and published successfully!\n\nCreated:\n- Course details updated\n- ${totalChapters} chapters\n- ${totalLessons} lessons\n- Course status: Published\n\nYour course is now live and ready for students!`);
    } catch (error) {
      console.error('Error seeding course:', error);
      alert('Failed to seed course. Please try again.');
    } finally {
      setSeeding(false);
    }
  };

  console.log('=== Course Builder Debug LuInfo ===');
  console.log('course:', course);
  console.log('courseId:', courseId);
  console.log('courses.length:', courses.length);
  console.log('coursesLoading:', coursesLoading);
  console.log('courseFetchTimeout:', courseFetchTimeout);
  console.log('chaptersLoading:', chaptersLoading);
  console.log('lessonsLoading:', lessonsLoading);
  console.log('================================');

  // Show loading while courses are being fetched initially (not during updates)
  if (coursesLoading && !course && courses.length === 0) {
    return (
      <AdminRoleShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: '#A855F7', borderTopColor: 'transparent' }} />
            <p className="text-gray-600">Loading courses...</p>
          </div>
        </div>
      </AdminRoleShell>
    );
  }

  // Show error if course not found after loading is complete or timeout
  if (!course && courseId && (courses.length > 0 || courseFetchTimeout)) {
    return (
      <AdminRoleShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 text-red-500 mx-auto mb-4">
              <X className="w-8 h-8" />
            </div>
            <p className="text-red-600 mb-2">Course not found</p>
            <p className="text-gray-600 mb-4">
              {courseFetchTimeout 
                ? "The course took too long to load. Please try again."
                : "The course you're looking for doesn't exist or you don't have permission to access it."
              }
            </p>
            <div className="flex gap-2 justify-center">
              <Button 
                onClick={() => router.push('/admin/courses')}
                className="transition-all duration-200"
                style={{
                  background: "linear-gradient(135deg, #EC4899 0%, #A855F7 100%)",
                  boxShadow: "0 4px 15px rgba(236, 72, 153, 0.3)",
                  color: 'white',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "linear-gradient(135deg, #DB2777 0%, #9333EA 100%)";
                  e.currentTarget.style.boxShadow = "0 6px 20px rgba(236, 72, 153, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "linear-gradient(135deg, #EC4899 0%, #A855F7 100%)";
                  e.currentTarget.style.boxShadow = "0 4px 15px rgba(236, 72, 153, 0.3)";
                }}
              >
                Back to Courses
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
                className="transition-all duration-200"
                style={{
                  borderColor: '#7B2CBF',
                  color: '#7B2CBF',
                  backgroundColor: 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#A855F7';
                  e.currentTarget.style.color = '#A855F7';
                  e.currentTarget.style.backgroundColor = 'rgba(123, 44, 191, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#7B2CBF';
                  e.currentTarget.style.color = '#7B2CBF';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                Retry
              </Button>
            </div>
          </div>
        </div>
      </AdminRoleShell>
    );
  }

  // Show loading if course is not yet loaded
  if (!course) {
    return (
      <AdminRoleShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: '#A855F7', borderTopColor: 'transparent' }} />
            <p className="text-gray-600">Loading course...</p>
          </div>
        </div>
      </AdminRoleShell>
    );
  }

  // Show loading only during initial fetch, not during create/update operations or chapter selection
  // Don't show full-page loading when switching chapters - lessons section handles its own loading
  if (chaptersLoading && courseChapters.length === 0) {
    return (
      <AdminRoleShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: '#A855F7', borderTopColor: 'transparent' }} />
            <p className="text-gray-600">Loading course content...</p>
          </div>
        </div>
      </AdminRoleShell>
    );
  }

  return (
    <AdminRoleShell>
      <main className="relative z-10 p-2 sm:p-4">
        {/* Welcome Section */}
        <WelcomeSection 
          title="Course Builder"
          description="Build and manage your course content"
        />

        {/* Back Button and Seed Course Button */}
        <div className="mb-4 flex items-center justify-between gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          {course && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSeedCourse}
              disabled={seeding || !courseId}
              className="flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                borderColor: '#10B981',
                color: '#10B981',
                backgroundColor: 'transparent',
              }}
              onMouseEnter={(e) => {
                if (!seeding && courseId) {
                  e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {seeding ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Seeding...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Seed Course
                </>
              )}
            </Button>
          )}
        </div>

        {/* Publish/Draft Toggle */}
        {course && (
          <div className="mb-6 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{
                    backgroundColor: course.status === 'published' ? '#10B981' : 
                                    course.status === 'archived' ? '#EF4444' : '#FF6B35'
                  }}></div>
                  <span className="text-sm font-medium text-gray-700">
                    Status: {course.status === 'published' ? 'Published' : 
                            course.status === 'archived' ? 'Archived' : 'Draft'}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  {course.title}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {course.status === 'published' ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleTogglePublish}
                    disabled={publishLoading}
                    className="flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      color: '#FF6B35',
                      borderColor: '#FF6B35',
                      backgroundColor: 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      if (!publishLoading) {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 107, 53, 0.1)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    {publishLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                    {publishLoading ? 'Updating...' : 'Move to Draft'}
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleTogglePublish}
                    disabled={publishLoading}
                    className="flex items-center gap-2 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: "linear-gradient(135deg, #10B981 0%, #14B8A6 100%)",
                      boxShadow: "0 4px 15px rgba(16, 185, 129, 0.3)",
                    }}
                    onMouseEnter={(e) => {
                      if (!publishLoading) {
                        e.currentTarget.style.background = "linear-gradient(135deg, #059669 0%, #0D9488 100%)";
                        e.currentTarget.style.boxShadow = "0 6px 20px rgba(16, 185, 129, 0.4)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "linear-gradient(135deg, #10B981 0%, #14B8A6 100%)";
                      e.currentTarget.style.boxShadow = "0 4px 15px rgba(16, 185, 129, 0.3)";
                    }}
                  >
                    {publishLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                    {publishLoading ? 'Publishing...' : 'Publish Course'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Course Info */}
        <PageSection title="Course Information">
          <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <AttractiveInput
                  label="Course Title"
                  value={courseForm.title}
                  onChange={(e) => setCourseForm(prev => ({ ...prev, title: e.target.value }))}
                  onBlur={handleCourseUpdateOnBlur}
                  placeholder="Enter course title"
                  variant="default"
                  colorScheme="primary"
                  size="md"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <AttractiveSelect
                  label="Category"
                  value={courseForm.category}
                  onChange={(e) => setCourseForm(prev => ({ ...prev, category: e.target.value }))}
                  onBlur={handleCourseUpdateOnBlur}
                  placeholder="Select Category"
                  variant="default"
                  colorScheme="primary"
                  size="md"
                  options={categories.map((c) => ({ value: c.name, label: c.name }))}
                  loading={categoriesLoading}
                  icon="tag"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <AttractiveInput
                    label="Price ($)"
                    type="number"
                    min="0"
                    step="0.01"
                    value={courseForm.price}
                    onChange={(e) => setCourseForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    onBlur={handleCourseUpdateOnBlur}
                    placeholder="0.00"
                    variant="default"
                    colorScheme="primary"
                    size="md"
                  />
                </div>
                <div className="flex items-center space-x-6 pt-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isPaid"
                      checked={courseForm.isPaid}
                      onCheckedChange={(checked) => setCourseForm(prev => ({ ...prev, isPaid: !!checked }))}
                      className="w-5 h-5 border-gray-300 rounded data-[state=checked]:bg-[#7B2CBF] data-[state=checked]:border-[#7B2CBF]"
                      style={{
                        borderColor: '#7B2CBF',
                      }}
                    />
                    <label htmlFor="isPaid" className="text-sm font-medium text-gray-700 cursor-pointer">
                      Paid Course
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
            
            {/* Description Editor - Full Width */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <CustomEditor
                value={courseForm.description}
                onChange={(data) => setCourseForm(prev => ({ ...prev, description: data }))}
                onBlur={handleCourseUpdateOnBlur}
                placeholder="Enter full course description"
              />
            </div>
          
          {/* Instructor Selection */}
          <div className="mt-6">
            <InstructorSelector
              value={courseForm.instructor}
              onChange={(instructorId) => setCourseForm(prev => ({ ...prev, instructor: instructorId }))}
              onSave={async (instructorId) => {
                if (course) {
                  try {
                    await updateCourse(course._id, { ...courseForm, instructor: instructorId });
                  } catch (error) {
                    console.error('Error updating course with instructor:', error);
                  }
                }
              }}
              label="Instructor"
              placeholder="Select an instructor"
            />
            </div>
          </div>
        </PageSection>

        {/* Chapters */}
        <PageSection 
          title="Chapters"
          description={reordering ? "Reordering chapters..." : deleting ? "Deleting chapter..." : updating ? "Updating chapter..." : "Manage course chapters and their content"}
          className="mb-2 sm:mb-4"
          actions={
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search chapters..."
                  value={chapterSearch}
                  onChange={(e) => handleChapterSearchChange(e.target.value)}
                  className="pl-10 pr-10 w-full sm:w-64"
                />
                {chapterSearch && (
                  <button
                    onClick={() => handleChapterSearchChange('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <Button
                onClick={() => {
                  setSelectedChapter(null);
                  setShowChapterModal(true);
                }}
                className="flex items-center gap-2 text-white w-full sm:w-auto transition-all duration-200"
                style={{
                  background: "linear-gradient(135deg, #EC4899 0%, #A855F7 100%)",
                  boxShadow: "0 4px 15px rgba(236, 72, 153, 0.3)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "linear-gradient(135deg, #DB2777 0%, #9333EA 100%)";
                  e.currentTarget.style.boxShadow = "0 6px 20px rgba(236, 72, 153, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "linear-gradient(135deg, #EC4899 0%, #A855F7 100%)";
                  e.currentTarget.style.boxShadow = "0 4px 15px rgba(236, 72, 153, 0.3)";
                }}
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
              <div 
                onDragStart={(e) => e.preventDefault()}
                onDragEnd={(e) => e.preventDefault()}
                onDrop={(e) => e.preventDefault()}
                className="relative"
              >
                {reordering && (
                  <div className="absolute top-0 left-0 right-0 rounded-lg p-2 mb-4 z-10" style={{
                    backgroundColor: 'rgba(123, 44, 191, 0.1)',
                    border: '1px solid rgba(123, 44, 191, 0.2)',
                  }}>
                    <div className="flex items-center gap-2 text-sm" style={{ color: '#7B2CBF' }}>
                      <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{
                        borderColor: '#7B2CBF',
                        borderTopColor: 'transparent',
                      }}></div>
                      <span>Reordering chapters...</span>
                    </div>
                  </div>
                )}
                {deleting && (
                  <div className="absolute top-0 left-0 right-0 rounded-lg p-2 mb-4 z-10" style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                  }}>
                    <div className="flex items-center gap-2 text-sm" style={{ color: '#EF4444' }}>
                      <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{
                        borderColor: '#EF4444',
                        borderTopColor: 'transparent',
                      }}></div>
                      <span>Deleting chapter...</span>
                    </div>
                  </div>
                )}
                {updating && (
                  <div className="absolute top-0 left-0 right-0 rounded-lg p-2 mb-4 z-10" style={{
                    backgroundColor: 'rgba(255, 107, 53, 0.1)',
                    border: '1px solid rgba(255, 107, 53, 0.2)',
                  }}>
                    <div className="flex items-center gap-2 text-sm" style={{ color: '#FF6B35' }}>
                      <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{
                        borderColor: '#FF6B35',
                        borderTopColor: 'transparent',
                      }}></div>
                      <span>Updating chapter...</span>
                    </div>
                  </div>
                )}
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={filteredChapters.map(chapter => chapter._id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-4">
                      {filteredChapters.map((chapter) => {
                        const lessonCount = getLessonsByChapter(chapter._id).length;
                        return (
                          <DraggableChapterItem
                            key={chapter._id}
                            chapter={chapter}
                            isSelected={selectedChapter?._id === chapter._id}
                            onSelect={setSelectedChapter}
                            onEdit={(chapter) => {
                              setSelectedChapter(chapter);
                              setShowChapterModal(true);
                            }}
                            onDelete={(chapter) => {
                              openDeleteConfirm('chapter', chapter._id, chapter.title);
                            }}
                            lessonCount={lessonCount}
                          />
                        );
                      })}
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
            title={`Lessons - ${selectedChapter.title}`}
            description={lessonsCreating ? "Creating lesson..." : lessonsReordering ? "Reordering lessons..." : "Manage lessons within this chapter"}
            className="mb-2 sm:mb-4"
            actions={
              <div className="flex flex-col sm:flex-row gap-2 w-full">
                <div className="relative flex-1 min-w-0">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search lessons..."
                    value={lessonSearch}
                    onChange={(e) => handleLessonSearchChange(e.target.value)}
                    className="pl-10 pr-10 w-full sm:w-64"
                  />
                  {lessonSearch && (
                    <button
                      onClick={() => handleLessonSearchChange('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <Button
                  onClick={() => {
                    setSelectedLesson(null);
                    setShowLessonModal(true);
                  }}
                  className="flex items-center gap-2 text-white w-full sm:w-auto transition-all duration-200"
                  style={{
                    background: "linear-gradient(135deg, #10B981 0%, #14B8A6 100%)",
                    boxShadow: "0 4px 15px rgba(16, 185, 129, 0.3)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "linear-gradient(135deg, #059669 0%, #0D9488 100%)";
                    e.currentTarget.style.boxShadow = "0 6px 20px rgba(16, 185, 129, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "linear-gradient(135deg, #10B981 0%, #14B8A6 100%)";
                    e.currentTarget.style.boxShadow = "0 4px 15px rgba(16, 185, 129, 0.3)";
                  }}
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Add Lesson</span>
                  <span className="sm:hidden">Add</span>
                </Button>
              </div>
            }
          >
            <div className="w-full overflow-hidden">
              {lessonsCreating && (
                <div className="rounded-lg p-2 mb-4" style={{
                  backgroundColor: 'rgba(123, 44, 191, 0.1)',
                  border: '1px solid rgba(123, 44, 191, 0.2)',
                }}>
                  <div className="flex items-center gap-2 text-sm" style={{ color: '#7B2CBF' }}>
                    <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{
                      borderColor: '#7B2CBF',
                      borderTopColor: 'transparent',
                    }}></div>
                    <span>Creating lesson...</span>
                  </div>
                </div>
              )}
              {lessonsReordering && (
                <div className="rounded-lg p-2 mb-4" style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                }}>
                  <div className="flex items-center gap-2 text-sm" style={{ color: '#10B981' }}>
                    <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{
                      borderColor: '#10B981',
                      borderTopColor: 'transparent',
                    }}></div>
                    <span>Reordering lessons...</span>
                  </div>
                </div>
              )}
              <div 
                onDragStart={(e) => e.preventDefault()}
                onDragEnd={(e) => e.preventDefault()}
                onDrop={(e) => e.preventDefault()}
                className="relative"
              >
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragStart={handleDragStart}
                  onDragEnd={handleLessonDragEnd}
                >
                  <SortableContext
                    items={filteredLessons.map(lesson => lesson._id)}
                    strategy={verticalListSortingStrategy}
                  >
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
                      onEdit={(lesson) => {
                        setSelectedLesson(lesson);
                        setShowLessonModal(true);
                      }}
                      onDelete={(lesson) => {
                        openDeleteConfirm('lesson', lesson._id, lesson.title);
                      }}
                      onManageQuiz={(lesson) => {
                        setQuizLessonId(lesson._id);
                      }}
                    />
                  ))
                )}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            </div>
          </PageSection>
        )}

        {/* Floating Action Buttons for Mobile */}
        <div className="fixed bottom-6 right-6 z-40 sm:hidden flex flex-col gap-3">
          <Button
            onClick={() => {
              setSelectedLesson(null);
              setShowLessonModal(true);
            }}
            size="lg"
            className="rounded-full w-14 h-14 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            title="Add Lesson"
            style={{
              background: "linear-gradient(135deg, #10B981 0%, #14B8A6 100%)",
              boxShadow: "0 4px 15px rgba(16, 185, 129, 0.3)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "linear-gradient(135deg, #059669 0%, #0D9488 100%)";
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(16, 185, 129, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "linear-gradient(135deg, #10B981 0%, #14B8A6 100%)";
              e.currentTarget.style.boxShadow = "0 4px 15px rgba(16, 185, 129, 0.3)";
            }}
          >
            <Play className="w-6 h-6" />
          </Button>
          <Button
            onClick={() => {
              setSelectedChapter(null);
              setShowChapterModal(true);
            }}
            size="lg"
            className="rounded-full w-14 h-14 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            title="Add Chapter"
            style={{
              background: "linear-gradient(135deg, #EC4899 0%, #A855F7 100%)",
              boxShadow: "0 4px 15px rgba(236, 72, 153, 0.3)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "linear-gradient(135deg, #DB2777 0%, #9333EA 100%)";
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(236, 72, 153, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "linear-gradient(135deg, #EC4899 0%, #A855F7 100%)";
              e.currentTarget.style.boxShadow = "0 4px 15px rgba(236, 72, 153, 0.3)";
            }}
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
          onClose={() => {
            setShowLessonModal(false);
            setSelectedLesson(null);
          }}
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
          onClose={() => {
            setShowDeleteConfirm(false);
            setDeleteLoading(false);
          }}
          onConfirm={handleDelete}
          title={`Delete ${deleteItem?.type}`}
          description={`Are you sure you want to delete "${deleteItem?.title}"? This action cannot be undone.`}
          confirmText="Delete"
          variant="danger"
          loading={deleteLoading}
        />
      </main>
    </AdminRoleShell>
  );
}

export default function CourseBuilderPage() {
  return (
    <AdminPageWrapper>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: '#A855F7', borderTopColor: 'transparent' }} />
            <p className="text-gray-600">Loading course builder...</p>
          </div>
        </div>
      }>
        <CourseBuilderContent />
      </Suspense>
    </AdminPageWrapper>
  );
}
