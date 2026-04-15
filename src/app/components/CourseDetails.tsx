"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import CourseCard from "./CourseCard";
import type { CourseDetailsData, ChapterWithLessons } from '@/lib/course-details';
import { useHasScrolled } from "@/hooks/useHasScrolled";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCart } from "@/hooks/useCart";
import { usePayment } from "@/hooks/usePayment";
import { LuCheck as Check, LuX as X } from 'react-icons/lu';
import StickySidebar from "./StickySidebar";
import type { FAQContent } from '@/constants/faqContent';
import { defaultFAQContent } from '@/constants/faqContent';
import { defaultFooterContent } from '@/constants/footerContent';
import { LuPlay as Play } from 'react-icons/lu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import VideoWatermark from "@/components/VideoWatermark";
import { htmlToPlainText } from "@/lib/utils";
export interface CourseFAQItem {
  _id: string;
  question: string;
  answer: string;
  order: number;
}

interface CourseDetailsProps {
  courseId?: string;
  initialCourse?: CourseDetailsData | null;
  initialChapters?: ChapterWithLessons[];
  initialCourseFaqs?: CourseFAQItem[];
}

interface CourseData {
  _id: string;
  title: string;
  shortDescription?: string;
  description?: string;
  category?: string;
  thumbnailUrl?: string;
  isPaid: boolean;
  price?: number;
  salePrice?: number;
  finalPrice: number;
  discountPercentage: number;
  enrollmentCount: number;
  lessonCount: number;
  totalDuration: number;
  instructor?: {
    _id: string;
    name: string;
    avatar?: string;
    phone?: string;
    address?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

interface Review {
  _id: string;
  student: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  rating: number;
  reviewType?: 'text' | 'video';
  title?: string;
  comment?: string;
  videoUrl?: string;
  videoThumbnail?: string;
  createdAt: string;
  isApproved?: boolean;
  isPublic?: boolean;
  isDisplayed?: boolean;
  displayOrder?: number;
}

interface Chapter {
  _id: string;
  title: string;
  description?: string;
  order: number;
  lessons: Array<{
    _id: string;
    title: string;
    description?: string;
    order: number;
    duration?: number;
    type: 'video' | 'audio' | 'reading' | 'assignment';
    isFree?: boolean;
  }>;
}

export default function CourseDetails({ 
  courseId: propCourseId, 
  initialCourse, 
  initialChapters,
  initialCourseFaqs = [],
}: CourseDetailsProps = {}) {
  const params = useParams();
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const sessionStatusTyped: "authenticated" | "unauthenticated" | "loading" = sessionStatus;
  const courseId = propCourseId || (params?.id as string);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loading, setLoading] = useState(!initialCourse);
  const [activeTab, setActiveTab] = useState("description");
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [activeLesson, setActiveLesson] = useState<string | null>(null);
  const [visibleReviews, setVisibleReviews] = useState(3);
  const [course, setCourse] = useState<CourseData | null>(initialCourse || null);
  const [chapters, setChapters] = useState<Chapter[]>(
    initialChapters?.map(ch => ({
      _id: ch._id,
      title: ch.title,
      description: ch.description,
      order: ch.order,
      lessons: ch.lessons.map(lesson => ({
        _id: lesson._id,
        title: lesson.title,
        description: lesson.description,
        order: lesson.order,
        duration: lesson.duration,
        type: lesson.type,
        isFree: lesson.isFree,
      })),
    })) || []
  );
  const [lessonVideoPlaying, setLessonVideoPlaying] = useState(false);
  const [currentLesson, setCurrentLesson] = useState<{
    _id: string;
    title: string;
    videoUrl?: string;
    youtubeVideoId?: string;
    type: 'video' | 'audio' | 'reading' | 'assignment';
  } | null>(null);
  const [loadingLesson, setLoadingLesson] = useState(false);
  const [reviewVideoPlaying, setReviewVideoPlaying] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsStats, setReviewsStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });
  const [showToast, setShowToast] = useState(false);
  const [faqContent, setFaqContent] = useState<FAQContent>(defaultFAQContent);
  const [expandedFAQ, setExpandedFAQ] = useState<number | string | null>(null);
  const courseFaqs = initialCourseFaqs ?? [];
  const contactPhone = defaultFooterContent.contact.phone.value;

  const { addToCart, isInCart } = useCart();
  const { initiatePayment, loading: paymentLoading, error: paymentError } = usePayment();
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
  const [enrollmentError, setEnrollmentError] = useState<string | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginPhone, setLoginPhone] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginSubmitting, setLoginSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [pendingEnrollment, setPendingEnrollment] = useState(false);
  const isMobile = useIsMobile();
  const isScrolledForStickySidebar = useHasScrolled({
    threshold: 700,
    enabled: !isMobile, // Only enable scroll detection on large screens
  });
  const isCourseHeaderScrolled = useHasScrolled({ threshold: 80 });
  const [isStickySidebarVisible, setIsStickySidebarVisible] = useState(false);

  const performEnrollment = async () => {
    if (!course || !courseId) return;

    setEnrollmentLoading(true);
    setEnrollmentError(null);

    try {
      // Check if course is free
      if (!course.isPaid) {
        // For free courses, enroll directly
        const response = await fetch('/api/enrollments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            course: courseId,
            paymentStatus: 'paid', // Free courses are considered paid
            paymentAmount: 0,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to enroll in course');
        }

        setIsEnrolled(true);
        // Show success message
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } else {
        // For paid courses, initiate payment
        const result = await initiatePayment({
          courseId: courseId,
        });

        if (result.success && result.data?.gatewayUrl) {
          // Redirect to payment gateway
          window.location.href = result.data.gatewayUrl;
        } else {
          throw new Error(result.error || 'Failed to initiate payment');
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to enroll in course';
      setEnrollmentError(errorMessage);
      console.error('Enrollment error:', error);

      // Show error toast
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } finally {
      setEnrollmentLoading(false);
    }
  };

  const handleLoginAndContinue = async () => {
    setLoginSubmitting(true);
    setLoginError(null);
    try {
      const result = await signIn("credentials", {
        phone: loginPhone,
        password: loginPassword,
        redirect: false,
      });

      if (result?.error) {
        setLoginError(result.error);
        return;
      }

      setShowLoginModal(false);
      // When session updates, we'll continue enrollment automatically
      setPendingEnrollment(true);
      router.refresh();
    } catch (e) {
      setLoginError(e instanceof Error ? e.message : "Login failed");
    } finally {
      setLoginSubmitting(false);
    }
  };

  useEffect(() => {
    if (pendingEnrollment && sessionStatusTyped === "authenticated") {
      setPendingEnrollment(false);
      performEnrollment();
    }
  }, [pendingEnrollment, sessionStatusTyped]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch course data (fallback if not provided server-side)
  useEffect(() => {
    if (!courseId || initialCourse) {
      setLoading(false);
      setIsLoaded(true);
      return;
    }

    const fetchCourseData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/public/courses/${courseId}`, {
          cache: 'no-store',
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            const courseData = data.data;
            setCourse({
              _id: courseData._id,
              title: courseData.title,
              shortDescription: courseData.shortDescription,
              description: courseData.description,
              category: courseData.category,
              thumbnailUrl: courseData.thumbnailUrl,
              isPaid: courseData.isPaid,
              price: courseData.price,
              salePrice: courseData.salePrice,
              finalPrice: courseData.finalPrice || (courseData.isPaid ? (courseData.salePrice || courseData.price || 0) : 0),
              discountPercentage: courseData.discountPercentage || 0,
              enrollmentCount: courseData.enrollmentCount || 0,
              lessonCount: courseData.lessonCount || 0,
              totalDuration: courseData.totalDuration || 0,
              instructor: (courseData.instructor?.name && !isPlaceholder(courseData.instructor.name)) ? {
                _id: courseData.instructor._id || '',
                name: courseData.instructor.name,
                avatar: courseData.instructor.avatar,
                phone: courseData.instructor.phone,
                address: courseData.instructor.address,
              } : undefined,
              createdAt: courseData.createdAt,
              updatedAt: courseData.updatedAt,
            });
          }
        }
      } catch (error) {
        console.error('Error fetching course:', error);
      } finally {
        setLoading(false);
        setIsLoaded(true);
      }
    };

    fetchCourseData();
  }, [courseId, initialCourse]);

  // Check if current user is already enrolled in this course
  useEffect(() => {
    if (!session?.user?.id || !courseId) {
      setIsEnrolled(false);
      return;
    }
    const checkEnrollment = async () => {
      try {
        const res = await fetch(`/api/enrollments?student=${session.user.id}&course=${courseId}&limit=1`, { cache: 'no-store' });
        const data = await res.json();
        const list = data.data?.enrollments ?? data.enrollments ?? [];
        setIsEnrolled(Array.isArray(list) && list.length > 0);
      } catch {
        setIsEnrolled(false);
      }
    };
    checkEnrollment();
  }, [session?.user?.id, courseId]);

  // Fetch chapters and lessons (fallback if not provided server-side)
  useEffect(() => {
    // Skip client-side fetch if initialChapters was provided (even if empty array)
    if (!courseId || initialChapters !== undefined) return;

    const fetchChaptersAndLessons = async () => {
      try {
        const [chaptersRes, lessonsRes] = await Promise.all([
          fetch(`/api/public/chapters?course=${courseId}&isPublished=true&limit=100`, {
            cache: 'no-store',
          }),
          fetch(`/api/public/lessons?course=${courseId}&isPublished=true&limit=1000`, {
            cache: 'no-store',
          }),
        ]);

        if (chaptersRes.ok && lessonsRes.ok) {
          const chaptersData = await chaptersRes.json();
          const lessonsData = await lessonsRes.json();
          const chaptersArray = chaptersData.data?.chapters || [];
          const lessonsArray = lessonsData.data?.lessons || [];

          // Group lessons by chapter
          const chaptersWithLessons: Chapter[] = chaptersArray
            .sort((a: any, b: any) => a.order - b.order)
            .map((chapter: any) => {
              const chapterLessons = lessonsArray
                .filter((lesson: any) => lesson.chapter.toString() === chapter._id.toString())
                .sort((a: any, b: any) => a.order - b.order)
                .map((lesson: any) => ({
                  _id: lesson._id.toString(),
                  title: lesson.title,
                  description: lesson.description,
                  order: lesson.order,
                  duration: lesson.duration,
                  type: (lesson.type || 'video') as 'video' | 'audio' | 'reading' | 'assignment',
                  isFree: lesson.isFree,
                }));

              return {
                _id: chapter._id.toString(),
                title: chapter.title,
                description: chapter.description,
                order: chapter.order,
                lessons: chapterLessons,
              };
            });

          setChapters(chaptersWithLessons);
          // Expand first chapter by default
          if (chaptersWithLessons.length > 0) {
            setExpandedSections([chaptersWithLessons[0]._id]);
          }
        }
      } catch (error) {
        console.error('Error fetching chapters and lessons:', error);
      }
    };

    fetchChaptersAndLessons();
  }, [courseId, initialChapters]);

  // Fetch reviews function
  const fetchReviews = async () => {
    if (!courseId) return;
    
    setReviewsLoading(true);
    try {
      const response = await fetch(`/api/course-reviews?course=${courseId}&limit=50&public=true&context=course-details`, {
        cache: 'no-store', // Always fetch fresh reviews
      });
      
      if (response.ok) {
        const data = await response.json();
        const reviewsData = data.data?.reviews || data.reviews || [];
        
        // API filters by approved + public for course-details context.
        // Keep a lightweight safety check for malformed data.
        const displayedReviews = reviewsData.filter((review: Review) => 
          review.isApproved !== false && review.isPublic !== false
        );
        
        // Sort by displayOrder (lower numbers first), then by createdAt (newest first) as fallback
        const sortedReviews = displayedReviews.sort((a: Review, b: Review) => {
          const orderA = a.displayOrder || 999999;
          const orderB = b.displayOrder || 999999;
          if (orderA !== orderB) {
            return orderA - orderB;
          }
          // If displayOrder is the same, sort by date (newest first)
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        
        setReviews(sortedReviews);
        
        // Calculate stats
        if (displayedReviews.length > 0) {
          const totalRating = displayedReviews.reduce((sum: number, review: Review) => sum + review.rating, 0);
          const averageRating = totalRating / displayedReviews.length;
          
          const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
          displayedReviews.forEach((review: Review) => {
            if (review.rating >= 1 && review.rating <= 5) {
              ratingDistribution[review.rating as keyof typeof ratingDistribution]++;
            }
          });
          
          setReviewsStats({
            totalReviews: displayedReviews.length,
            averageRating: Math.round(averageRating * 10) / 10,
            ratingBreakdown: ratingDistribution,
          });
        } else {
          // Reset stats if no reviews
          setReviewsStats({
            totalReviews: 0,
            averageRating: 0,
            ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
          });
        }
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setReviewsLoading(false);
    }
  };

  // Fetch reviews on mount and when courseId changes
  useEffect(() => {
    fetchReviews();
  }, [courseId]);

  // Fetch FAQ content
  const fetchFAQContent = async () => {
    try {
      const response = await fetch('/api/website-content', {
        cache: 'no-store',
      });
      if (response.ok) {
        const data = await response.json();
        if (data.data?.faq) {
          setFaqContent(data.data.faq);
        }
      }
    } catch (error) {
      console.error('Error fetching FAQ content:', error);
    }
  };

  useEffect(() => {
    fetchFAQContent();
  }, []);

  // Format date to Bengali relative time
  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "আজ";
    if (diffDays === 1) return "১ দিন আগে";
    if (diffDays < 7) return `${diffDays} দিন আগে`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} সপ্তাহ আগে`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} মাস আগে`;
    return `${Math.floor(diffDays / 365)} বছর আগে`;
  };

  // Format duration from minutes to hours
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins} মিনিট`;
    if (mins === 0) return `${hours} ঘন্টা`;
    return `${hours} ঘন্টা ${mins} মিনিট`;
  };

  // Format lesson duration
  const formatLessonDuration = (minutes?: number): string => {
    if (!minutes) return "00:00";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}:${String(mins).padStart(2, '0')}`;
  };

  // Handle Add to Cart
  const handleAddToCart = () => {
    if (!course) return;

    addToCart({
      _id: course._id,
      title: course.title,
      thumbnailUrl: course.thumbnailUrl,
      price: course.finalPrice,
      lectures: course.lessonCount,
      instructor: course.instructor?.name ? {
        _id: course.instructor._id,
        name: course.instructor.name,
      } : {
        _id: '',
        name: '',
      },
    });

    // Show toast notification
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Handle Course Enrollment
  const handleEnrollment = async () => {
    if (!course || !courseId) return;

    // Check authentication
    if (!session || sessionStatusTyped === "unauthenticated") {
      setPendingEnrollment(true);
      setShowLoginModal(true);
      return;
    }

    // If still loading, wait
    if (sessionStatusTyped === "loading") {
      return;
    }

    performEnrollment();
  };

  const handleStartCourse = () => {
    if (!courseId) return;
    router.push(`/student/courses/${courseId}`);
  };

  const isCourseInCart = course ? isInCart(course._id) : false;
  const isLoadingEnrollment = enrollmentLoading || paymentLoading;

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  // Fetch and play lesson video
  const handleLessonClick = async (lessonId: string, lessonTitle: string, isFree: boolean) => {
    if (!isFree) {
      return; // Only allow free lessons
    }

    setLoadingLesson(true);
    setActiveLesson(lessonId);
    
    try {
      // Fetch lesson details from API
      const response = await fetch(`/api/public/lessons?course=${courseId}&limit=1000`, {
        cache: 'no-store',
      });
      
      if (response.ok) {
        const data = await response.json();
        const lessons = data.data?.lessons || [];
        const lesson = lessons.find((l: any) => l._id === lessonId);
        
        if (lesson && (lesson.videoUrl || lesson.youtubeVideoId)) {
          setCurrentLesson({
            _id: lesson._id,
            title: lesson.title || lessonTitle,
            videoUrl: lesson.videoUrl,
            youtubeVideoId: lesson.youtubeVideoId,
            type: lesson.type || 'video',
          });
          setLessonVideoPlaying(true);
        }
      }
    } catch (error) {
      console.error('Error fetching lesson:', error);
    } finally {
      setLoadingLesson(false);
    }
  };

  // Generate YouTube embed URL
  const getYouTubeEmbedUrl = (videoId: string) => {
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&iv_load_policy=3&playsinline=1`;
  };

  // Find and play the first free lesson
  const playFirstFreeLesson = async () => {
    if (!chapters || chapters.length === 0) {
      return;
    }

    // Find the first free lesson across all chapters
    let firstFreeLesson: { _id: string; title: string; chapterId: string } | null = null;
    
    for (const chapter of chapters) {
      const freeLesson = chapter.lessons.find(lesson => lesson.isFree);
      if (freeLesson) {
        firstFreeLesson = {
          _id: freeLesson._id,
          title: freeLesson.title,
          chapterId: chapter._id,
        };
        break;
      }
    }

    if (firstFreeLesson) {
      await handleLessonClick(firstFreeLesson._id, firstFreeLesson.title, true);
    }
  };

  const placeholders = ['unknown', 'not provided', 'n/a', 'uncategorized', 'loading...', 'unknown instructor'];
  const isPlaceholder = (s: string | undefined) => !s || placeholders.includes(String(s).toLowerCase().trim());

  // Transform course data to match the component's expected format
  const courseData = course ? {
    id: course._id,
    category: (course.category && !isPlaceholder(course.category)) ? course.category.trim() : "",
    title: course.title,
    shortDescription: (course.shortDescription && !isPlaceholder(course.shortDescription)) ? course.shortDescription.trim() : undefined,
    description: (course.description && !isPlaceholder(course.description)) ? course.description : "",
    rating: reviewsStats.averageRating || 0,
    reviews: reviewsStats.totalReviews > 1000 ? `${(reviewsStats.totalReviews / 1000).toFixed(1)}k` : reviewsStats.totalReviews.toString(),
    totalReviews: reviewsStats.totalReviews,
    ratingBreakdown: reviewsStats.ratingBreakdown,
    individualReviews: reviews.map((review: any) => {
      const videoUrl = review.videoUrl || null;
      // Debug log for video reviews
      if (review.reviewType === 'video') {
        console.log('Video review found:', {
          id: review._id,
          reviewType: review.reviewType,
          videoUrl: videoUrl,
          hasVideoUrl: !!videoUrl
        });
      }
      return {
        id: review._id,
        name:
          review.displayStudentName?.trim() ||
          (review.student?.role === 'admin'
            ? 'শিক্ষার্থী'
            : `${review.student.firstName} ${review.student.lastName}`),
        avatar: review.student.avatar || "https://live.themewild.com/edubo/assets/img/testimonial/01.jpg",
        rating: review.rating,
        timeAgo: formatTimeAgo(review.createdAt),
        text: review.comment || review.title || "",
        reviewType: review.reviewType || 'text',
        videoUrl: videoUrl,
        videoThumbnail: review.videoThumbnail || undefined,
        title: review.title || null,
      };
    }),
    instructor: (course.instructor?.name && !isPlaceholder(course.instructor.name)) ? {
      name: course.instructor.name,
      avatar: course.instructor.avatar || "https://live.themewild.com/edubo/assets/img/course/ins-1.jpg",
      phone: course.instructor.phone,
      address: course.instructor.address,
    } : { name: "", avatar: "", phone: "", address: "" },
    lastUpdated: course.updatedAt ? new Date(course.updatedAt).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' }) : "Recently",
    videoThumbnail: course.thumbnailUrl || "https://live.themewild.com/edubo/assets/img/course/05.jpg",
    price: course.finalPrice,
    originalPrice: course.discountPercentage > 0 && course.price ? course.price : null,
    discount: course.discountPercentage,
    level: "", // Only show when added to course model
    lectures: course.lessonCount,
    duration: formatDuration(course.totalDuration),
    enrolled: course.enrollmentCount,
    language: "", // Only show when added to course model
    includes: [
      "আজীবন সম্পূর্ণ অ্যাক্সেস",
      `${course.lessonCount}+ ডাউনলোডযোগ্য রিসোর্স`,
      "সম্পন্নতার সার্টিফিকেট",
      "৭ দিন বিনামূল্যে ট্রায়াল",
      "১৫ দিনের টাকা ফেরত গ্যারান্টি",
    ],
    curriculum: chapters.map((chapter, chapterIndex) => ({
      id: chapter._id,
      title: chapter.title,
      description: chapter.description,
      lessons: chapter.lessons.map((lesson, lessonIndex) => ({
        id: `${chapter._id}-${lesson._id}-${lessonIndex}`, // Composite ID for UI purposes
        _id: lesson._id, // Actual MongoDB ObjectId for API calls
        title: lesson.title,
        duration: formatLessonDuration(lesson.duration),
        type: lesson.type,
        isCompleted: false, // Will be updated based on user progress
        isLocked: !lesson.isFree && course.isPaid, // Lock paid lessons if course is paid
        isFree: lesson.isFree, // Preserve isFree flag
      })),
    })),
  } : {
    id: "",
    category: "",
    title: loading ? "Loading..." : "Course not found",
    shortDescription: "",
    description: "",
    rating: 0,
    reviews: "0",
    totalReviews: 0,
    ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    individualReviews: [],
    instructor: { name: "", avatar: "", phone: "", address: "" },
    lastUpdated: "",
    videoThumbnail: "",
    price: 0,
    originalPrice: null,
    discount: 0,
    level: "",
    lectures: 0,
    duration: "",
    enrolled: 0,
    language: "",
    includes: [],
    curriculum: [],
  };

  return (
    <>
    <Dialog
      open={showLoginModal}
      onOpenChange={(open) => {
        setShowLoginModal(open);
        setLoginError(null);
        if (!open) {
          setPendingEnrollment(false);
        }
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Login required to enroll</DialogTitle>
          <DialogDescription>
            To enroll in this course, please login first.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700" htmlFor="demo-login-phone">
                Phone
              </label>
              <input
                id="demo-login-phone"
                value={loginPhone}
                onChange={(e) => setLoginPhone(e.target.value)}
                className="h-11 w-full rounded-md border border-gray-200 bg-white px-3 text-sm outline-none focus:border-[#7B2CBF] focus:ring-2 focus:ring-[#7B2CBF]/20"
                placeholder="017xxxxxxxx"
                autoComplete="tel"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700" htmlFor="demo-login-password">
                Password
              </label>
              <input
                id="demo-login-password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="h-11 w-full rounded-md border border-gray-200 bg-white px-3 text-sm outline-none focus:border-[#7B2CBF] focus:ring-2 focus:ring-[#7B2CBF]/20"
                placeholder="Enter password"
                type="password"
                autoComplete="current-password"
              />
            </div>
          </div>

          {loginError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {loginError}
            </div>
          )}

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={handleLoginAndContinue}
              className="h-11 rounded-md px-4 text-sm font-semibold text-white disabled:opacity-50"
              style={{
                background: "linear-gradient(135deg, #EC4899 0%, #A855F7 100%)",
                boxShadow: "0 4px 15px rgba(236, 72, 153, 0.3)",
              }}
              disabled={loginSubmitting || !loginPhone || !loginPassword}
            >
              {loginSubmitting ? "Logging in..." : "Login & Continue"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    <div className="min-h-screen relative bg-gray-50 ">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-20 right-4 z-50 animate-fade-in-up">
          <div className={`${
            enrollmentError || paymentError 
              ? 'bg-red-500' 
              : 'bg-green-500'
          } text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2`}>
            {enrollmentError || paymentError ? (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8V12M12 16H12.01" strokeLinecap="round" />
                </svg>
                <span className="font-medium">{enrollmentError || paymentError}</span>
              </>
            ) : (
              <>
            <Check className="w-5 h-5" />
            <span className="font-medium">Course added to cart!</span>
              </>
            )}
          </div>
        </div>
      )}
     

      {/* Header Section with Background Pattern */}
      <div
        className="site-breadcrumb relative overflow-hidden"
        style={{
          backgroundImage: isCourseHeaderScrolled
            ? "none"
            : "url(https://live.themewild.com/edubo/assets/img/breadcrumb/01.png)",
          backgroundColor: isCourseHeaderScrolled ? "#ffffff" : "transparent",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "cover",
          transition: "background-color 300ms ease, background-image 300ms ease",
          // display: "flex",
          // alignItems: "center",
          // justifyContent: "center",
          // flexDirection: "column",
          // textAlign: "center",
          paddingTop: "80px",
          paddingBottom: "50px",
          // marginTop: "-6rem",
        }}
      >
        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8">
          {/* Full-width: Title and Short Description */}
          <div className="w-full">
            {/* Category Tag - only when category is provided */}
            {courseData.category && (
            <div className="mb-4 flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-full bg-[#FF6B35] px-4 py-1.5">
                <span
                  className="text-xs font-semibold text-white"
                  style={{ fontFamily: "var(--font-bengali), sans-serif" }}
                >
                  {courseData.category}
                </span>
              </div>
              <button className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 hover:border-[#A855F7] hover:bg-[#A855F7] transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M19 21L12 16L5 21V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H17C17.5304 3 18.0391 3.21071 18.4142 3.58579C18.7893 3.96086 19 4.46957 19 5V21Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-gray-600 group-hover:text-white"
                  />
                </svg>
              </button>
            </div>
            )}

            {/* Course Title - full width */}
            <h1
              className="mb-4 w-full text-3xl font-bold text-[#1E3A8A] md:text-4xl lg:text-5xl"
              style={{ fontFamily: "var(--font-bengali), sans-serif" }}
            >
              {courseData.title}
            </h1>

            {/* Short Description - full width, only when provided */}
            {courseData.shortDescription && (
              <p
                className="mb-6 w-full text-base leading-relaxed text-gray-600 md:text-lg"
                style={{ fontFamily: "var(--font-bengali), sans-serif" }}
              >
                {htmlToPlainText(courseData.shortDescription)}
              </p>
            )}
          </div>

          {/* Two columns: Meta info (left) | Sidebar placeholder (right on lg) */}
          <div className="flex w-full flex-col items-start lg:flex-row lg:items-center lg:justify-between">
          <div className="w-full lg:w-1/2">
            {/* Rating and Instructor Info */}
            <div className="flex flex-wrap items-center gap-4">
              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill={i < Math.floor(courseData.rating) ? "#FBBF24" : "none"}
                      stroke="#FBBF24"
                      strokeWidth="2"
                    >
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                    </svg>
                  ))}
                </div>
              <span className="text-sm font-semibold text-gray-700">
                {courseData.rating} ({courseData.reviews} রিভিউ)
              </span>
              </div>

              {/* Instructor - only when name is provided */}
              {courseData.instructor?.name?.trim() && (
                <div className="flex items-center gap-2">
                <div className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-white shadow-sm">
                  <Image
                    src={courseData.instructor.avatar}
                    alt={courseData.instructor.name}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {courseData.instructor.name}
                </span>
              </div>
              )}


            {/* Last Updated */}
            <span className="text-sm text-gray-500">
              সর্বশেষ আপডেট: {courseData.lastUpdated}
            </span>
            </div>
          </div>

          {/* Right Side - StickySidebar placeholder; display none when sidebar is not visible */}
          <div className={isStickySidebarVisible ? 'lg:block lg:w-1/2' : 'hidden'}>
           <StickySidebar 
             courseData={courseData} 
             onAddToCart={handleAddToCart}
             onStartCourse={handleStartCourse}
             onEnrollment={handleEnrollment}
             isInCart={isCourseInCart}
             isEnrolled={isEnrolled}
             isLoadingEnrollment={isLoadingEnrollment}
             onVisibilityChange={setIsStickySidebarVisible}
           />
          </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          {/* Left Column - Main Content */}
          <div className="w-full lg:w-2/3">
            {/* Video Player */}
            <div className="mb-6 overflow-hidden rounded-xl bg-white shadow-lg">
              <div className="relative aspect-video w-full bg-gray-900">
                {loadingLesson ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                      <p className="text-white">Loading lesson...</p>
                    </div>
                  </div>
                ) : currentLesson && lessonVideoPlaying ? (
                  // Show lesson video
                  <>
                    {currentLesson.youtubeVideoId ? (
                      <>
                        <iframe
                          src={getYouTubeEmbedUrl(currentLesson.youtubeVideoId)}
                          className="h-full w-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          title="Course lesson video"
                        />
                        {/* Hide YouTube top title/action bar area */}
                        <div className="pointer-events-none absolute left-0 top-0 z-10 h-14 w-full bg-black" />
                      </>
                    ) : currentLesson.videoUrl ? (
                      <video
                        src={currentLesson.videoUrl}
                        controls
                        autoPlay
                        className="h-full w-full"
                        onEnded={() => {
                          setLessonVideoPlaying(false);
                          setCurrentLesson(null);
                        }}
                      >
                        Your browser does not support the video tag.
                      </video>
                    ) : null}
                    <VideoWatermark />
                    {/* Close button */}
                    <button
                      onClick={() => {
                        setLessonVideoPlaying(false);
                        setCurrentLesson(null);
                        setActiveLesson(null);
                      }}
                      className="absolute right-4 top-4 z-20 rounded-full bg-black/70 p-2 text-white transition-colors hover:bg-black/90"
                      title="Close video"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </>
                ) : (
                  // Show course thumbnail
                  <>
                    <Image
                      src={courseData.videoThumbnail}
                      alt={courseData.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 66vw"
                    />
                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <button 
                        onClick={playFirstFreeLesson}
                        className="flex h-20 w-20 items-center justify-center rounded-full bg-[#FF6B35] shadow-xl transition-all hover:scale-110 hover:bg-[#FF8C5A]"
                        title="Play first free lesson"
                      >
                        <svg
                          width="32"
                          height="32"
                          viewBox="0 0 24 24"
                          fill="white"
                          className="ml-1"
                        >
                          <path d="M8 5V19L19 12L8 5Z" />
                        </svg>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="mb-6 border-b border-gray-200">
              <div className="flex gap-6 overflow-x-auto">
                {[
                  { id: "description", label: "Description" },
                  // { id: "curriculum", label: "Curriculum" },
                  { id: "instructor", label: "Instructor" },
                  { id: "review", label: "Review" },
                ]
                  .filter((tab) => tab.id !== "instructor" || !!courseData.instructor?.name?.trim())
                  .map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`cursor-pointer whitespace-nowrap border-b-2 px-2 pb-4 text-sm font-semibold transition-colors ${
                      activeTab === tab.id
                        ? "border-[#A855F7] text-[#A855F7]"
                        : "border-transparent text-gray-600 hover:text-gray-900"
                    }`}
                    style={{ fontFamily: "var(--font-bengali), sans-serif" }}
                  >
                    {tab.id === "description" && "বিবরণ"}
                    {tab.id === "curriculum" && "কারিকুলাম"}
                    {tab.id === "instructor" && "শিক্ষক"}
                    {tab.id === "review" && "রিভিউ"}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === "curriculum" && (
              <div className="space-y-3">
                {loading && !chapters.length ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A855F7] mx-auto mb-4"></div>
                      <p className="text-gray-600" style={{ fontFamily: "var(--font-bengali), sans-serif" }}>
                        কারিকুলাম লোড হচ্ছে...
                      </p>
                    </div>
                  </div>
                ) : courseData.curriculum.length === 0 ? (
                  <div className="rounded-lg bg-white p-8 shadow-sm">
                    <div className="text-center">
                      <p className="text-gray-600" style={{ fontFamily: "var(--font-bengali), sans-serif" }}>
                        এখনও কোনো অধ্যায় বা পাঠ যোগ করা হয়নি।
                      </p>
                    </div>
                  </div>
                ) : (
                  courseData.curriculum.map((section) => {
                    const isExpanded = expandedSections.includes(section.id);
                    return (
                      <div
                        key={section.id}
                        className="overflow-hidden rounded-lg border-2 border-solid border-[#A855F7]/50 bg-white shadow-sm"
                        style={{ borderColor: "rgba(168, 85, 247, 0.5)" }}
                      >
                        <button
                          onClick={() => toggleSection(section.id)}
                          className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`font-semibold ${
                                isExpanded ? "text-[#A855F7]" : "text-[#1E3A8A]"
                              }`}
                              style={{ fontFamily: "var(--font-bengali), sans-serif" }}
                            >
                              {section.title}
                            </span>
                            {section.lessons.length > 0 && (
                              <span className="text-xs text-gray-500">
                                ({section.lessons.length} {section.lessons.length === 1 ? 'পাঠ' : 'পাঠ'})
                              </span>
                            )}
                          </div>
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            className={`transition-transform ${
                              isExpanded ? "rotate-180" : ""
                            } ${isExpanded ? "text-[#A855F7]" : "text-[#1E3A8A]"}`}
                          >
                            <path
                              d="M6 9L12 15L18 9"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                        {isExpanded && (
                          <div className="border-t border-gray-100 bg-white p-4">
                            {section.lessons.length === 0 ? (
                              <p className="text-sm text-gray-500 text-center py-4" style={{ fontFamily: "var(--font-bengali), sans-serif" }}>
                                এই অধ্যায়ে এখনও কোনো পাঠ নেই।
                              </p>
                            ) : (
                              <div className="space-y-2">
                                {section.lessons.map((lesson, lessonIndex) => {
                                  const isActive = activeLesson === lesson.id;
                                  const iconColor = lesson.isLocked ? "#A855F7" : "#3B82F6";
                                  const borderColor = isActive ? "#3B82F6" : "transparent";
                                  
                                    return (
                                    <div
                                      key={`${section.id}-${lesson.id}-${lessonIndex}`}
                                      onClick={() => {
                                        if (!lesson.isLocked && lesson.isFree) {
                                          handleLessonClick(lesson._id, lesson.title, true);
                                        }
                                      }}
                                      className={`flex items-center justify-between rounded-lg border-2 border-solid bg-white p-3 transition-all ${
                                        isActive ? "border-[#3B82F6]" : "border-gray-300"
                                      } ${!lesson.isLocked ? "cursor-pointer hover:border-gray-400" : "cursor-not-allowed opacity-75"}`}
                                      style={{ borderColor: isActive ? "#3B82F6" : "#D1D5DB" }}
                                    >
                                      <div className="flex items-center gap-3">
                                        {/* Lesson Type Icon */}
                                        <div
                                          className={`flex h-10 w-10 items-center justify-center rounded-full ${
                                            lesson.isCompleted
                                              ? "bg-[#3B82F6]/10"
                                              : lesson.isLocked
                                              ? "bg-[#A855F7]/10"
                                              : "bg-[#3B82F6]/10"
                                          }`}
                                        >
                                          {lesson.isCompleted ? (
                                            <svg
                                              width="20"
                                              height="20"
                                              viewBox="0 0 24 24"
                                              fill="none"
                                              className="text-[#10B981]"
                                            >
                                              <path
                                                d="M20 6L9 17L4 12"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                              />
                                            </svg>
                                          ) : lesson.type === "video" ? (
                                            <svg
                                              width="16"
                                              height="16"
                                              viewBox="0 0 24 24"
                                              fill="none"
                                              className={lesson.isLocked ? "text-[#A855F7]" : "text-[#3B82F6]"}
                                            >
                                              <path
                                                d="M8 5V19L19 12L8 5Z"
                                                fill="currentColor"
                                              />
                                            </svg>
                                          ) : lesson.type === "audio" ? (
                                            <svg
                                              width="16"
                                              height="16"
                                              viewBox="0 0 24 24"
                                              fill="none"
                                              className="text-[#A855F7]"
                                            >
                                              <path
                                                d="M12 3V12C12 13.6569 10.6569 15 9 15C7.34315 15 6 13.6569 6 12C6 10.3431 7.34315 9 9 9C9.35064 9 9.68722 9.06015 10 9.17071V3H12Z"
                                                fill="currentColor"
                                              />
                                              <path
                                                d="M19 10V12C19 15.866 15.866 19 12 19C8.13401 19 5 15.866 5 12C5 8.13401 8.13401 5 12 5C12.3386 5 12.6718 5.02151 13 5.06289V7.08144C12.6717 7.02813 12.3381 7 12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17C14.7614 17 17 14.7614 17 12H19Z"
                                                fill="currentColor"
                                              />
                                            </svg>
                                          ) : (
                                            <svg
                                              width="16"
                                              height="16"
                                              viewBox="0 0 24 24"
                                              fill="none"
                                              className="text-[#A855F7]"
                                            >
                                              <path
                                                d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                              />
                                              <path
                                                d="M14 2V8H20"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                              />
                                            </svg>
                                          )}
                                        </div>
                                        <span
                                          className="text-sm font-medium text-gray-700"
                                          style={{
                                            fontFamily: "var(--font-bengali), sans-serif",
                                          }}
                                        >
                                          {lesson.title}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-3">
                                        <span className="text-xs text-gray-500">{lesson.duration}</span>
                                        
                                        {/* Lock Icon */}
                                        <svg
                                          width="18"
                                          height="18"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          className={lesson.isLocked ? "text-[#FF6B35]" : "text-[#3B82F6]"}
                                        >
                                          {lesson.isLocked ? (
                                            <path
                                              d="M6 10V8C6 5.79086 7.79086 4 10 4H14C16.2091 4 18 5.79086 18 8V10M6 10H4C3.44772 10 3 10.4477 3 11V19C3 19.5523 3.44772 20 4 20H20C20.5523 20 21 19.5523 21 19V11C21 10.4477 20.5523 10 20 10H18M6 10H18"
                                              stroke="currentColor"
                                              strokeWidth="2"
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                            />
                                          ) : (
                                            <path
                                              d="M8 11V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V11M6 11H4C3.44772 11 3 11.4477 3 12V20C3 20.5523 3.44772 21 4 21H20C20.5523 21 21 20.5523 21 20V12C21 11.4477 20.5523 11 20 11H18"
                                              stroke="currentColor"
                                              strokeWidth="2"
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                            />
                                          )}
                                        </svg>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                      )}
                    </div>
                  );
                  })
                )}
              </div>
            )}

            {activeTab === "description" && (
              <div className="space-y-6">
                {/* Course Description - only when description is provided */}
                {courseData.description ? (
                <div className="rounded-lg bg-white p-6 shadow-sm">
                  <h3
                    className="mb-4 text-xl font-bold text-[#1E3A8A]"
                    style={{ fontFamily: "var(--font-bengali), sans-serif" }}
                  >
                    কোর্স সম্পর্কে
                  </h3>
                  <div
                    className="prose prose-sm max-w-none leading-relaxed text-gray-600"
                    style={{ fontFamily: "var(--font-bengali), sans-serif" }}
                    dangerouslySetInnerHTML={{ __html: courseData.description }}
                  />
                </div>
                ) : (
                <div className="rounded-lg bg-white p-6 shadow-sm">
                  <p className="text-gray-500" style={{ fontFamily: "var(--font-bengali), sans-serif" }}>
                    এই কোর্সের জন্য কোনো বিবরণ দেওয়া হয়নি।
                  </p>
                </div>
                )}

                {/* Chapters and Lessons */}
                <div className="rounded-lg bg-white p-6 shadow-sm">
                  <h3
                    className="mb-4 text-xl font-bold text-[#1E3A8A]"
                    style={{ fontFamily: "var(--font-bengali), sans-serif" }}
                  >
                    কোর্স কারিকুলাম
                  </h3>
                  <div className="space-y-3">
                    {loading && !chapters.length ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A855F7] mx-auto mb-4"></div>
                          <p className="text-gray-600" style={{ fontFamily: "var(--font-bengali), sans-serif" }}>
                            কারিকুলাম লোড হচ্ছে...
                          </p>
                        </div>
                      </div>
                    ) : courseData.curriculum.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-600" style={{ fontFamily: "var(--font-bengali), sans-serif" }}>
                          এখনও কোনো অধ্যায় বা পাঠ যোগ করা হয়নি।
                        </p>
                      </div>
                    ) : (
                      courseData.curriculum.map((section) => {
                      const isExpanded = expandedSections.includes(section.id);
                      return (
                        <div
                          key={section.id}
                          className="overflow-hidden rounded-lg border-2 border-solid border-[#A855F7]/50 bg-white shadow-sm"
                          style={{ borderColor: "rgba(168, 85, 247, 0.5)" }}
                        >
                          <button
                            onClick={() => toggleSection(section.id)}
                            className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-gray-50"
                          >
                            <div className="flex items-center gap-3">
                              <span
                                className={`font-semibold ${
                                  isExpanded ? "text-[#A855F7]" : "text-[#1E3A8A]"
                                }`}
                                style={{ fontFamily: "var(--font-bengali), sans-serif" }}
                              >
                                {section.title}
                              </span>
                              {section.lessons.length > 0 && (
                                <span className="text-xs text-gray-500">
                                  ({section.lessons.length} {section.lessons.length === 1 ? 'পাঠ' : 'পাঠ'})
                                </span>
                              )}
                            </div>
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              className={`transition-transform ${
                                isExpanded ? "rotate-180" : ""
                              } ${isExpanded ? "text-[#A855F7]" : "text-[#1E3A8A]"}`}
                            >
                              <path
                                d="M6 9L12 15L18 9"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>
                          {isExpanded && (
                            <div className="border-t border-gray-100 bg-white p-4">
                              {section.lessons.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-4" style={{ fontFamily: "var(--font-bengali), sans-serif" }}>
                                  এই অধ্যায়ে এখনও কোনো পাঠ নেই।
                                </p>
                              ) : (
                                <div className="space-y-2">
                                  {section.lessons.map((lesson, lessonIndex) => {
                                    const isActive = activeLesson === lesson.id;
                                    
                                    return (
                                    <div
                                      key={`${section.id}-${lesson.id}-${lessonIndex}`}
                                      onClick={() => {
                                        if (!lesson.isLocked && lesson.isFree) {
                                          handleLessonClick(lesson._id, lesson.title, true);
                                        }
                                      }}
                                      className={`flex items-center justify-between rounded-lg border-2 border-solid bg-white p-3 transition-all ${
                                        isActive ? "border-[#3B82F6]" : "border-gray-300"
                                      } ${!lesson.isLocked ? "cursor-pointer hover:border-gray-400" : "cursor-not-allowed opacity-75"}`}
                                      style={{ borderColor: isActive ? "#3B82F6" : "#D1D5DB" }}
                                    >
                                        <div className="flex items-center gap-3">
                                          {/* Lesson Type Icon */}
                                          <div
                                            className={`flex h-10 w-10 items-center justify-center rounded-full ${
                                              lesson.isCompleted
                                                ? "bg-[#3B82F6]/10"
                                                : lesson.isLocked
                                                ? "bg-[#A855F7]/10"
                                                : "bg-[#3B82F6]/10"
                                            }`}
                                          >
                                            {lesson.isCompleted ? (
                                              <svg
                                                width="20"
                                                height="20"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                className="text-[#10B981]"
                                              >
                                                <path
                                                  d="M20 6L9 17L4 12"
                                                  stroke="currentColor"
                                                  strokeWidth="2"
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                />
                                              </svg>
                                            ) : lesson.type === "video" ? (
                                              <svg
                                                width="16"
                                                height="16"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                className={lesson.isLocked ? "text-[#A855F7]" : "text-[#3B82F6]"}
                                              >
                                                <path
                                                  d="M8 5V19L19 12L8 5Z"
                                                  fill="currentColor"
                                                />
                                              </svg>
                                            ) : lesson.type === "audio" ? (
                                              <svg
                                                width="16"
                                                height="16"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                className="text-[#A855F7]"
                                              >
                                                <path
                                                  d="M12 3V12C12 13.6569 10.6569 15 9 15C7.34315 15 6 13.6569 6 12C6 10.3431 7.34315 9 9 9C9.35064 9 9.68722 9.06015 10 9.17071V3H12Z"
                                                  fill="currentColor"
                                                />
                                                <path
                                                  d="M19 10V12C19 15.866 15.866 19 12 19C8.13401 19 5 15.866 5 12C5 8.13401 8.13401 5 12 5C12.3386 5 12.6718 5.02151 13 5.06289V7.08144C12.6717 7.02813 12.3381 7 12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17C14.7614 17 17 14.7614 17 12H19Z"
                                                  fill="currentColor"
                                                />
                                              </svg>
                                            ) : (
                                              <svg
                                                width="16"
                                                height="16"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                className="text-[#A855F7]"
                                              >
                                                <path
                                                  d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
                                                  stroke="currentColor"
                                                  strokeWidth="2"
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                />
                                                <path
                                                  d="M14 2V8H20"
                                                  stroke="currentColor"
                                                  strokeWidth="2"
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                />
                                              </svg>
                                            )}
                                          </div>
                                          <span
                                            className="text-sm font-medium text-gray-700"
                                            style={{
                                              fontFamily: "var(--font-bengali), sans-serif",
                                            }}
                                          >
                                            {lesson.title}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                          
                                          {lesson.duration !== "00:00" &&  <span className="text-xs text-gray-500">{lesson.duration}</span> }
                                          
                                          {/* Lock Icon */}
                                          <svg
                                            width="18"
                                            height="18"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            className={lesson.isLocked ? "text-[#FF6B35]" : "text-[#3B82F6]"}
                                          >
                                            {lesson.isLocked ? (
                                              <path
                                                d="M6 10V8C6 5.79086 7.79086 4 10 4H14C16.2091 4 18 5.79086 18 8V10M6 10H4C3.44772 10 3 10.4477 3 11V19C3 19.5523 3.44772 20 4 20H20C20.5523 20 21 19.5523 21 19V11C21 10.4477 20.5523 10 20 10H18M6 10H18"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                              />
                                            ) : (
                                              <path
                                                d="M8 11V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V11M6 11H4C3.44772 11 3 11.4477 3 12V20C3 20.5523 3.44772 21 4 21H20C20.5523 21 21 20.5523 21 20V12C21 11.4477 20.5523 11 20 11H18"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                              />
                                            )}
                                          </svg>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "instructor" && courseData.instructor?.name?.trim() && (
              <div className="space-y-6">
                {/* Instructor Profile Card */}
                <div className="rounded-lg bg-white p-6 md:p-8 shadow-sm">
                  <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                    {/* Instructor Avatar */}
                    <div className="flex-shrink-0">
                      <div className="relative h-32 w-32 md:h-40 md:w-40 overflow-hidden rounded-full border-4 border-purple-100 shadow-lg">
                        <Image
                          src={courseData.instructor.avatar}
                          alt={courseData.instructor.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 128px, 160px"
                        />
                      </div>
                    </div>

                    {/* Instructor Info */}
                    <div className="flex-1">
                      <div className="mb-4">
                        <h3
                          className="text-2xl md:text-3xl font-bold text-[#1E3A8A] mb-2"
                          style={{ fontFamily: "var(--font-bengali), sans-serif" }}
                        >
                          {courseData.instructor.name}
                        </h3>
                      </div>

                      {(courseData.instructor.phone?.trim() || courseData.instructor.address?.trim()) && (
                        <div className="mb-6 rounded-lg border border-purple-100 bg-purple-50/40 p-4">
                          {courseData.instructor.phone?.trim() && (
                            <p
                              className="mb-2 text-sm text-gray-700 md:text-base"
                              style={{ fontFamily: "var(--font-bengali), sans-serif" }}
                            >
                              <span className="font-semibold text-[#1E3A8A]">মোবাইল নম্বর:</span> {courseData.instructor.phone}
                            </p>
                          )}
                          {courseData.instructor.address?.trim() && (
                            <p
                              className="text-sm text-gray-700 md:text-base"
                              style={{ fontFamily: "var(--font-bengali), sans-serif" }}
                            >
                              <span className="font-semibold text-[#1E3A8A]">ঠিকানা:</span> {courseData.instructor.address}
                            </p>
                          )}
                        </div>
                      )}

                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "review" && (
              <div className="space-y-6">
                {/* Review Summary Card */}
                <div className="rounded-lg bg-white p-6 shadow-sm">
                  <div className="flex flex-col gap-6 md:flex-row md:items-center">
                    {/* Left Side - Average Rating */}
                    <div className="flex flex-col items-center md:items-start">
                      <div
                        className="mb-2 text-5xl font-bold text-[#1E3A8A]"
                        style={{ fontFamily: "var(--font-bengali), sans-serif" }}
                      >
                        {courseData.rating}
                      </div>
                      <div className="mb-2 flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill={i < Math.floor(courseData.rating) ? "#F97316" : "none"}
                            stroke="#F97316"
                            strokeWidth="2"
                          >
                            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                          </svg>
                        ))}
                      </div>
                      <p
                        className="text-sm text-gray-600"
                        style={{ fontFamily: "var(--font-bengali), sans-serif" }}
                      >
                        {courseData.totalReviews.toLocaleString()} জন শিক্ষার্থীর রিভিউ
                      </p>
                    </div>

                    {/* Right Side - Rating Breakdown */}
                    <div className="flex-1 space-y-3">
                      {[5, 4, 3, 2, 1].map((stars) => {
                        const count = courseData.ratingBreakdown[stars as keyof typeof courseData.ratingBreakdown];
                        const percentage = courseData.totalReviews > 0 
                          ? Math.round((count / courseData.totalReviews) * 100) 
                          : 0;
                        return (
                          <div key={stars} className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <svg
                                  key={i}
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill={i < stars ? "#F97316" : "none"}
                                  stroke="#F97316"
                                  strokeWidth="2"
                                >
                                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                                </svg>
                              ))}
                            </div>
                            <div className="flex-1">
                              <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                                <div
                                  className="h-full rounded-full bg-[#F97316]"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                            <span className="text-sm font-medium text-gray-700">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Individual Reviews Card */}
                <div className="rounded-lg bg-white p-6 shadow-sm">
                  <h3
                    className="mb-6 text-xl font-bold text-[#1E3A8A]"
                    style={{ fontFamily: "var(--font-bengali), sans-serif" }}
                  >
                    রিভিউ ({courseData.totalReviews.toLocaleString()})
                  </h3>
                  <div className="space-y-6">
                    {reviewsLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A855F7] mx-auto mb-4"></div>
                        <p className="text-gray-600" style={{ fontFamily: "var(--font-bengali), sans-serif" }}>
                          রিভিউ লোড হচ্ছে...
                        </p>
                      </div>
                    ) : courseData.individualReviews.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-gray-600" style={{ fontFamily: "var(--font-bengali), sans-serif" }}>
                          এখনও কোনো রিভিউ নেই। প্রথম রিভিউ দিন!
                        </p>
                      </div>
                    ) : (
                      courseData.individualReviews.slice(0, visibleReviews).map((review) => (
                      <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                        <div className="mb-3 flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-white shadow-sm">
                              <Image
                                src={review.avatar}
                                alt={review.name}
                                fill
                                className="object-cover"
                                sizes="48px"
                              />
                            </div>
                            <div>
                              <p
                                className="font-semibold text-[#1E3A8A]"
                                style={{ fontFamily: "var(--font-bengali), sans-serif" }}
                              >
                                {review.name}
                              </p>
                              <div className="flex items-center gap-1 text-sm text-[#A855F7]">
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <circle cx="12" cy="12" r="10" />
                                  <path d="M12 6V12L16 14" />
                                </svg>
                                <span
                                  style={{ fontFamily: "var(--font-bengali), sans-serif" }}
                                >
                                  {review.timeAgo}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill={i < review.rating ? "#F97316" : "none"}
                                stroke="#F97316"
                                strokeWidth="2"
                              >
                                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                        
                        {/* Review Title (shown for both text and video reviews) */}
                        {review.title && (
                          <p className="mt-2 text-sm font-medium text-gray-700" style={{ fontFamily: "var(--font-bengali), sans-serif" }}>
                            {review.title}
                          </p>
                        )}
                        
                        {/* Text Review Content */}
                        {(review.reviewType === 'text' || (!review.reviewType && review.text)) && review.text && (
                          <div className="mt-2">
                            <p
                              className="leading-relaxed text-gray-600"
                              style={{ fontFamily: "var(--font-bengali), sans-serif" }}
                            >
                              {review.text}
                            </p>
                          </div>
                        )}
                  
                  {/* Video Preview */}
                  {review.reviewType === 'video' && review.videoUrl && (
                    <div className="space-y-3">
                      {review.videoUrl.includes('youtube.com/embed') && (
                        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-gray-900">
                          {reviewVideoPlaying !== review.id && review.videoThumbnail ? (
                            <div 
                              className="relative w-full h-full cursor-pointer group"
                              onClick={() => setReviewVideoPlaying(review.id)}
                            >
                              <Image
                                src={review.videoThumbnail}
                                alt="Video thumbnail"
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 50vw"
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                                <div className="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                  <Play className="w-10 h-10 text-white ml-1" />
                                </div>
                              </div>
                            </div>
                          ) : (
                            <>
                              <iframe
                                src={reviewVideoPlaying === review.id ? `${review.videoUrl}?autoplay=1` : review.videoUrl}
                                className="h-full w-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                title="YouTube video player"
                              />
                              <VideoWatermark />
                            </>
                          )}
                        </div>
                      )}
         
                    </div>
                  )}
                      </div>
                      ))
                    )}
                  </div>
                  {!reviewsLoading && courseData.individualReviews.length > 0 && visibleReviews < courseData.individualReviews.length && (
                    <div className="mt-6 flex justify-center">
                      <button
                        onClick={() => setVisibleReviews((prev) => Math.min(prev + 3, courseData.individualReviews.length))}
                        className="rounded-lg border-2 border-[#A855F7] bg-white px-6 py-3 font-semibold text-[#A855F7] transition-all hover:bg-[#A855F7] hover:text-white"
                        style={{ fontFamily: "var(--font-bengali), sans-serif" }}
                      >
                        আরও দেখুন
                      </button>
                    </div>
                  )}
                </div>

              </div>
            )}

                     {/* FAQ Section - Universal */}
      <div className="py-16">
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="space-y-8">
            {/* FAQ Header */}
            <div className="text-center">
       

              {/* Main Title */}
              <h2
                className={`text-left text-xl font-bold leading-tight ${
                  isLoaded ? "animate-fade-in-up" : "animate-on-load"
                }`}
                style={{
                  animationDelay: "0.3s",
                  fontFamily: "var(--font-bengali), sans-serif",
                }}
              >
                <span style={{ color: faqContent.titleColors.part1 }}>{faqContent.title.part1}</span>{" "}
                {faqContent.titleColors.part2 === 'gradient' ? (
                  <span
                    className="bg-clip-text text-transparent"
                    style={{
                      backgroundImage: faqContent.gradientColors?.via
                        ? `linear-gradient(to right, ${faqContent.gradientColors.from}, ${faqContent.gradientColors.via}, ${faqContent.gradientColors.to})`
                        : `linear-gradient(to right, ${faqContent.gradientColors?.from || '#10B981'}, ${faqContent.gradientColors?.to || '#A855F7'})`,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {faqContent.title.part2}
                  </span>
                ) : (
                  <span style={{ color: faqContent.titleColors.part2 }}>{faqContent.title.part2}</span>
                )}
              </h2>
            </div>

            {/* FAQ Items - course-based when available, otherwise global */}
            <div className="mx-auto max-w-4xl space-y-4">
              {courseFaqs.length > 0
                ? [...courseFaqs]
                    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                    .map((faq) => {
                      const isExpanded = expandedFAQ === faq._id;
                      return (
                        <div
                          key={faq._id}
                          className="overflow-hidden rounded-lg bg-white shadow-sm transition-all hover:shadow-md border border-gray-100"
                        >
                          <button
                            onClick={() => {
                              setExpandedFAQ(isExpanded ? null : faq._id);
                            }}
                            className="flex w-full cursor-pointer items-center justify-between p-6 text-left transition-colors hover:bg-gray-50"
                          >
                            <h3
                              className="flex-1 pr-4 text-lg font-semibold text-[#1E3A8A]"
                              style={{ fontFamily: "var(--font-bengali), sans-serif" }}
                            >
                              {faq.question}
                            </h3>
                            <svg
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              className={`flex-shrink-0 transition-transform duration-300 ease-in-out ${
                                isExpanded ? "rotate-180" : "rotate-0"
                              } text-[#A855F7]`}
                            >
                              <path
                                d="M6 9L12 15L18 9"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>
                          <div
                            className={`overflow-hidden transition-all duration-300 ease-in-out ${
                              isExpanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
                            }`}
                          >
                            <div className="border-t border-gray-100 bg-gray-50 p-6">
                              <p
                                className="leading-relaxed text-gray-700"
                                style={{ fontFamily: "var(--font-bengali), sans-serif" }}
                              >
                                {faq.answer}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                : faqContent.faqs
                    .sort((a, b) => a.order - b.order)
                    .map((faq) => {
                      const isExpanded = expandedFAQ === faq.id;
                      return (
                        <div
                          key={faq.id}
                          className="overflow-hidden rounded-lg bg-white shadow-sm transition-all hover:shadow-md border border-gray-100"
                        >
                          <button
                            onClick={() => {
                              setExpandedFAQ(isExpanded ? null : faq.id);
                            }}
                            className="flex w-full cursor-pointer items-center justify-between p-6 text-left transition-colors hover:bg-gray-50"
                          >
                            <h3
                              className="flex-1 pr-4 text-lg font-semibold text-[#1E3A8A]"
                              style={{ fontFamily: "var(--font-bengali), sans-serif" }}
                            >
                              {faq.question}
                            </h3>
                            <svg
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              className={`flex-shrink-0 transition-transform duration-300 ease-in-out ${
                                isExpanded ? "rotate-180" : "rotate-0"
                              } text-[#A855F7]`}
                            >
                              <path
                                d="M6 9L12 15L18 9"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>
                          <div
                            className={`overflow-hidden transition-all duration-300 ease-in-out ${
                              isExpanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
                            }`}
                          >
                            <div className="border-t border-gray-100 bg-gray-50 p-6">
                              <p
                                className="leading-relaxed text-gray-700"
                                style={{ fontFamily: "var(--font-bengali), sans-serif" }}
                              >
                                {faq.answer}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
            </div>
          </div>
        </div>
      </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="relative w-full lg:w-1/3">
       
          {/* Regular sidebar - visible on small devices; on large, hidden only when sticky sidebar is active (scrolled) so Add to Cart stays clickable */}
            <div
              className={`${isScrolledForStickySidebar && !isMobile ? "hidden" : ""} course-single-sidebar rounded-[25px] bg-white ${isScrolledForStickySidebar && !isMobile ? 'sticky top-10' : ''}`}
              style={{
                padding: "30px",
                boxShadow: "0px 30px 50px 0px rgba(1, 11, 60, 0.1)",
              }}
            >
              {/* Pricing */}
              <div className="mb-6">
                <div className="mb-2 flex items-baseline gap-2">
                  <span
                    className="text-4xl font-bold text-[#FF6B35]"
                    style={{ fontFamily: "var(--font-bengali), sans-serif" }}
                  >
                    ${courseData.price}
                  </span>
                  {courseData.originalPrice && (
                    <>
                      <span className="text-lg text-gray-400 line-through">
                        ${courseData.originalPrice}
                      </span>
                      <span className="rounded-full bg-pink-100 px-2 py-0.5 text-xs font-semibold text-pink-600">
                        {courseData.discount}% Off
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Enrollment Button */}
              <button
                onClick={handleEnrollment}
                disabled={isEnrolled || isLoadingEnrollment || !course}
                className={`mb-3 w-full rounded-lg px-6 py-3.5 font-semibold text-white transition-all hover:shadow-lg ${
                  isEnrolled || isLoadingEnrollment || !course
                    ? 'opacity-50 cursor-not-allowed'
                    : 'cursor-pointer'
                }`}
                style={{
                  fontFamily: "var(--font-bengali), sans-serif",
                  background: isEnrolled
                    ? "linear-gradient(135deg, #10B981 0%, #059669 100%)"
                    : "linear-gradient(135deg, #A855F7 0%, #EC4899 100%)",
                }}
              >
                <div className="flex items-center justify-center gap-2">
                  {isLoadingEnrollment ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>{course?.isPaid ? 'পেমেন্ট প্রক্রিয়াকরণ...' : 'নিবন্ধন করা হচ্ছে...'}</span>
                    </>
                  ) : isEnrolled ? (
                    <>
                      <Check className="w-5 h-5" />
                      <span>Already Enrolled</span>
                    </>
                  ) : (
                    <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                      <span>{course?.isPaid ? 'এখনই নিবন্ধন করুন' : 'বিনামূল্যে নিবন্ধন করুন'}</span>
                    </>
                  )}
                </div>
              </button>

              {isEnrolled ? (
                <button
                  type="button"
                  onClick={handleStartCourse}
                  className="mb-6 w-full cursor-pointer rounded-lg border-2 border-[#10B981] bg-white px-6 py-3.5 font-semibold text-[#10B981] transition-all hover:bg-[#10B981] hover:text-white"
                  style={{
                    fontFamily: "var(--font-bengali), sans-serif",
                  }}
                >
                  <div className="flex items-center justify-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M8 5V19L19 12L8 5Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>কোর্স শুরু করুন</span>
                  </div>
                </button>
              ) : (
                /* Add to Cart Button - shows "Added" state when course is already in cart */
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isCourseInCart}
                  className={`mb-6 w-full rounded-lg border-2 px-6 py-3.5 font-semibold transition-all ${
                    isCourseInCart
                      ? 'cursor-default border-[#10B981] bg-[#10B981] text-white'
                      : 'border-[#A855F7] bg-white text-[#A855F7] hover:bg-[#A855F7] hover:text-white'
                  }`}
                  style={{
                    fontFamily: "var(--font-bengali), sans-serif",
                  }}
                >
                  <div className="flex items-center justify-center gap-2">
                    {isCourseInCart ? (
                      <>
                        <Check className="w-5 h-5 shrink-0" />
                        <span>কার্টে যোগ করা হয়েছে</span>
                      </>
                    ) : (
                      <>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17M17 13V17C17 18.1 17.9 19 19 19C20.1 19 21 18.1 21 17V13"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span>কার্টে যোগ করুন</span>
                      </>
                    )}
                  </div>
                </button>
              )}

              <div className="mb-6 rounded-lg border border-[#A855F7]/20 bg-[#A855F7]/5 p-3 text-center">
                <p
                  className="text-xs text-gray-600"
                  style={{ fontFamily: "var(--font-bengali), sans-serif" }}
                >
                  এখনই যোগাযোগ করুন
                </p>
                <p className="text-sm font-semibold text-[#A855F7]">{contactPhone}</p>
              </div>

              {/* Course Details - only show rows with known/non-empty values; hide when 0 */}
              {(() => {
                const details = [
                  ...(courseData.instructor?.name?.trim() ? [{
                    icon: (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="2" />
                        <path
                          d="M6 21V19C6 17.9391 6.42143 16.9217 7.17157 16.1716C7.92172 15.4214 8.93913 15 10 15H14C15.0609 15 16.0783 15.4214 16.8284 16.1716C17.5786 16.9217 18 17.9391 18 19V21"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ),
                    label: "শিক্ষক",
                    value: courseData.instructor.name,
                  }] : []),
                  ...(courseData.lectures > 0 ? [{
                    icon: (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                        <path d="M3 10H21" stroke="currentColor" strokeWidth="2" />
                      </svg>
                    ),
                    label: "লেকচার",
                    value: `${courseData.lectures} টি লেকচার`,
                  }] : []),
                  ...(courseData.duration ? [{
                    icon: (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                        <path
                          d="M12 6V12L16 14"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    ),
                    label: "সময়কাল",
                    value: courseData.duration,
                  }] : []),
                  ...(courseData.enrolled > 0 ? [{
                    icon: (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ),
                    label: "নিবন্ধিত",
                    value: `${courseData.enrolled} জন শিক্ষার্থী`,
                  }] : []),
                  ...(courseData.language?.trim() ? [{
                    icon: (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                        <path
                          d="M12 2C15.31 2 18 4.69 18 8C18 11.31 15.31 14 12 14C8.69 14 6 11.31 6 8C6 4.69 8.69 2 12 2Z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path d="M2 12H22" stroke="currentColor" strokeWidth="2" />
                      </svg>
                    ),
                    label: "ভাষা",
                    value: courseData.language,
                  }] : []),
                ]
                  .filter((detail) => detail.value != null && String(detail.value).trim() !== '' && !isPlaceholder(String(detail.value)));
                if (details.length === 0) return null;
                return (
                  <div className="mb-6 space-y-3 border-b border-gray-200 pb-6">
                    {details.map((detail, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#A855F7]/10 text-[#A855F7]">
                          {detail.icon}
                        </div>
                        <div className="flex-1">
                          <p
                            className="text-xs text-gray-500"
                            style={{ fontFamily: "var(--font-bengali), sans-serif" }}
                          >
                            {detail.label}
                          </p>
                          <p className="text-sm font-semibold text-gray-800">{detail.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* Course Includes - only show when there are items */}
              {courseData.includes.length > 0 && (
              <div className="mb-6">
                <h3
                  className="mb-4 text-lg font-bold text-gray-800"
                  style={{ fontFamily: "var(--font-bengali), sans-serif" }}
                >
                  কোর্সে অন্তর্ভুক্ত
                </h3>
                <div className="space-y-2">
                  {courseData.includes.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="text-[#10B981]"
                      >
                        <path
                          d="M20 6L9 17L4 12"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span
                        className="text-sm text-gray-700"
                        style={{ fontFamily: "var(--font-bengali), sans-serif" }}
                      >
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              )}

              {/* Social Share */}
              {/* <div>
                <h3
                  className="mb-4 text-lg font-bold text-gray-800"
                  style={{ fontFamily: "var(--font-bengali), sans-serif" }}
                >
                  শেয়ার করুন
                </h3>
                <div className="flex gap-3">
                  {[
                    {
                      name: "Facebook",
                      color: "#1877F2",
                      icon: (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                      ),
                    },
                    {
                      name: "Twitter",
                      color: "#1DA1F2",
                      icon: (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                        </svg>
                      ),
                    },
                    {
                      name: "Instagram",
                      color: "#E4405F",
                      icon: (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </svg>
                      ),
                    },
                    {
                      name: "LinkedIn",
                      color: "#0077B5",
                      icon: (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                      ),
                    },
                    {
                      name: "YouTube",
                      color: "#FF0000",
                      icon: (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                        </svg>
                      ),
                    },
                  ].map((social) => (
                    <button
                      key={social.name}
                      className="flex h-10 w-10 items-center justify-center rounded-full text-white transition-all hover:scale-110"
                      style={{ backgroundColor: social.color }}
                      aria-label={social.name}
                    >
                      {social.icon}
                    </button>
                  ))}
                </div>
              </div> */}
              </div>
            </div>

          
          </div>

      </div>

     

      {/* Related Courses Section */}
      <div id="related-courses-section" className="bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          {/* Section Header */}
          <div className="mb-8 text-center md:mb-12">
            {/* Related Courses Badge */}
            <div
              className={`mb-4 inline-flex items-center gap-3 rounded-full bg-[#A855F7] px-5 py-2.5 ${
                isLoaded ? "animate-fade-in-up" : "animate-on-load"
              }`}
              style={{
                animationDelay: "0.1s",
                fontFamily: "var(--font-bengali), sans-serif",
              }}
            >
              <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-[#A855F7]"
                >
                  <path
                    d="M12 2C8.13 2 5 5.13 5 9C5 11.38 6.19 13.47 8 14.74V17C8 17.55 8.45 18 9 18H15C15.55 18 16 17.55 16 17V14.74C17.81 13.47 19 11.38 19 9C19 5.13 15.87 2 12 2Z"
                    fill="currentColor"
                  />
                  <path
                    d="M9 21H15"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="text-xs font-semibold text-white">সম্পর্কিত কোর্স</span>
            </div>

            {/* Main Title */}
            <h2
              className={`text-3xl font-bold leading-tight md:text-4xl lg:text-5xl ${
                isLoaded ? "animate-fade-in-up" : "animate-on-load"
              }`}
              style={{
                animationDelay: "0.3s",
                fontFamily: "var(--font-bengali), sans-serif",
              }}
            >
              <span className="text-[#1E3A8A]">সম্পর্কিত</span>{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: "linear-gradient(to right, #10B981, #14B8A6, #A855F7)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                কোর্সসমূহ
              </span>
            </h2>
          </div>

          {/* Related Courses Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                id: 2,
                image: "https://live.themewild.com/edubo/assets/img/course/05.jpg",
                level: "বিশেষজ্ঞ",
                levelColor: "bg-[#A855F7]",
                category: "ডেভেলপমেন্ট",
                categoryColor: "bg-blue-100 text-blue-600",
                rating: "7.3k",
                title: "সম্পূর্ণ ডিজিটাল মার্কেটিং কোর্স - ১২টি কোর্স একসাথে",
                lectures: 120,
                hours: 150,
                instructor: {
                  name: "লিও হেন্ডার",
                  avatar: "https://live.themewild.com/edubo/assets/img/course/ins-1.jpg",
                },
                price: 98,
                originalPrice: null,
              },
              {
                id: 3,
                image: "https://live.themewild.com/edubo/assets/img/course/05.jpg",
                level: "শুরু",
                levelColor: "bg-green-500",
                category: "ব্যবসা",
                categoryColor: "bg-purple-100 text-purple-600",
                rating: "5.2k",
                title: "ওয়েব ডিজাইনিং সম্পূর্ণ কোর্স - ২০টি ওয়েব টেমপ্লেট সহ",
                lectures: 75,
                hours: 58,
                instructor: {
                  name: "মাইকেল জনি",
                  avatar: "https://live.themewild.com/edubo/assets/img/course/ins-1.jpg",
                },
                price: 125,
                originalPrice: null,
              },
              {
                id: 4,
                image: "https://live.themewild.com/edubo/assets/img/course/05.jpg",
                level: "মধ্যম",
                levelColor: "bg-yellow-500",
                category: "আর্ট ও ডিজাইন",
                categoryColor: "bg-pink-100 text-pink-600",
                rating: "4.8k",
                title: "গ্রাফিক ডিজাইন মাস্টারক্লাস - অ্যাডোবি ফটোশপ ও ইলাস্ট্রেটর",
                lectures: 90,
                hours: 72,
                instructor: {
                  name: "এমা উইলসন",
                  avatar: "https://live.themewild.com/edubo/assets/img/course/ins-1.jpg",
                },
                price: 89,
                originalPrice: 120,
              },
              {
                id: 5,
                image: "https://live.themewild.com/edubo/assets/img/course/05.jpg",
                level: "বিশেষজ্ঞ",
                levelColor: "bg-red-500",
                category: "প্রোগ্রামিং",
                categoryColor: "bg-indigo-100 text-indigo-600",
                rating: "6.1k",
                title: "পাইথন প্রোগ্রামিং সম্পূর্ণ কোর্স - শূন্য থেকে মাস্টার",
                lectures: 150,
                hours: 200,
                instructor: {
                  name: "ডেভিড ব্রাউন",
                  avatar: "https://live.themewild.com/edubo/assets/img/course/ins-1.jpg",
                },
                price: 149,
                originalPrice: 199,
              },
            ].map((course, index) => (
              <CourseCard
                key={course.id}
                course={course}
                index={index}
                isLoaded={isLoaded}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
