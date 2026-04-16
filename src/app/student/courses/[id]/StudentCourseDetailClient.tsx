'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import { useMockSession } from '@/lib/mockSession';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { StudentRoleShell } from '@/components/role-area/StudentRoleShell';
import { LuPlay as PlayCircle, LuCheck as CheckCircle, LuTrophy as Trophy, LuStar as Star, LuTarget as Target, LuAward as Award, LuArrowLeft as ArrowLeft, LuArrowRight as ArrowRight, LuHistory as History, LuClock as Clock, LuTrendingUp as TrendingUp, LuChevronDown as ChevronDown, LuPaperclip as Paperclip, LuDownload as Download } from 'react-icons/lu';;
import PageSection from '@/components/PageSection';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleHeader } from '@/components/ui/collapsible';
import confetti from 'canvas-confetti';
import { htmlToPlainText } from '@/lib/utils';

const DEFAULT_LESSON_BANNER_TITLE = 'আজকের লেসনে স্বাগতম';
const QUIZ_KEEP_PRACTICING_THRESHOLD = 60;
const getLastLessonStorageKey = (courseId: string) => `student-course-last-lesson:${courseId}`;
const getLessonPlaybackStorageKey = (courseId: string, lessonId: string) =>
  `student-course-playback:${courseId}:${lessonId}`;

const safeText = (value: unknown, fallback = 'N/A'): string => {
  if (value == null) return fallback;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (Array.isArray(value)) {
    const flattened = value
      .map((item) => safeText(item, ''))
      .filter((item) => item.length > 0)
      .join(', ');
    return flattened || fallback;
  }
  if (typeof value === 'object') {
    const candidate = value as Record<string, unknown>;
    for (const key of ['name', 'title', 'label', 'text', 'value']) {
      const entry = candidate[key];
      if (
        typeof entry === 'string' ||
        typeof entry === 'number' ||
        typeof entry === 'boolean'
      ) {
        return String(entry);
      }
    }
  }
  return fallback;
};

export default function StudentCourseLearningPage() {
  const { data: session, status } = useMockSession();
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;

  const [course, setCourse] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [chapters, setChapters] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [markingComplete, setMarkingComplete] = useState(false);
  const [quizMeta, setQuizMeta] = useState<{ required: boolean; questionsCount: number; fetchUrl: string; submitUrl: string } | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<any[] | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitting, setQuizSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState<{ scorePercentage: number; correctAnswers: number; totalQuestions: number } | null>(null);
  const [quizStartedAt, setQuizStartedAt] = useState<Date | null>(null);
  const [submissionHistory, setSubmissionHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [lessonCompleted, setLessonCompleted] = useState(false);
  const [checkingCompletion, setCheckingCompletion] = useState(false);
  const [chapterProgress, setChapterProgress] = useState<Record<string, any>>({});
  const [courseProgress, setCourseProgress] = useState<any>(null);
  const [certificateInfo, setCertificateInfo] = useState<{
    issued: boolean;
    url: string | null;
  }>({
    issued: false,
    url: null
  });
  const [quizAlreadySubmitted, setQuizAlreadySubmitted] = useState(false);
  const [showSubmissionHistory, setShowSubmissionHistory] = useState(false);
  const [showQuizResultModal, setShowQuizResultModal] = useState(false);
  const [quizResultDetailsLoading, setQuizResultDetailsLoading] = useState(false);
  const [quizResultDetailsError, setQuizResultDetailsError] = useState<string | null>(null);
  const [quizResultDetails, setQuizResultDetails] = useState<{
    scorePercentage: number;
    correctAnswers: number;
    totalQuestions: number;
    submittedAt?: string;
    questions: Array<{
      order: number;
      question: string;
      options: string[];
      selectedIndex: number;
      correctOptionIndex: number;
      isCorrect: boolean;
      explanation?: string;
    }>;
  } | null>(null);
  const [showCongratsModal, setShowCongratsModal] = useState(false);
  const [hideVideo, setHideVideo] = useState(false);
  const [hasQuiz, setHasQuiz] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [openChapterId, setOpenChapterId] = useState<string | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [playerReloadKey, setPlayerReloadKey] = useState(0);
  const [lessonQuizCounts, setLessonQuizCounts] = useState<Record<string, number>>({});
  const [submittedQuizByLesson, setSubmittedQuizByLesson] = useState<Record<string, boolean>>({});
  const [studentPhone, setStudentPhone] = useState('');
  const [courseLessonBanner, setCourseLessonBanner] = useState<{
    enabled: boolean;
    title: string;
    imageUrl: string;
  } | null>(null);
  const isValidQuizSubmission = (submission: any) => {
    const totalQuestions = Number(submission?.totalQuestions ?? 0);
    const correctAnswers = Number(submission?.correctAnswers ?? 0);
    const scorePercentage = Number(submission?.scorePercentage ?? 0);

    return (
      Number.isFinite(totalQuestions) &&
      Number.isFinite(correctAnswers) &&
      Number.isFinite(scorePercentage) &&
      totalQuestions > 0 &&
      correctAnswers >= 0 &&
      correctAnswers <= totalQuestions &&
      scorePercentage >= 0 &&
      scorePercentage <= 100
    );
  };

  const playerInstanceRef = useRef<any | null>(null);
  const videoContainerRef = useRef<HTMLDivElement | null>(null);
  const lastPlaybackTimeRef = useRef(0);
  const wasPlayingBeforeHideRef = useRef(false);
  const lastPlaybackPersistedAtRef = useRef(0);
  const loadedCourseKeyRef = useRef<string | null>(null);
  const pendingAutoQuizLessonIdRef = useRef<string | null>(null);
  const studentWatermarkText = useMemo(() => {
    const digitsOnly = studentPhone.replace(/\D/g, '').trim();
    return digitsOnly;
  }, [studentPhone]);

  useEffect(() => {
    if (status === 'loading') return;

    const userId = session?.user?.id;
    if (!userId) {
      router.push('/login');
      return;
    }
    if (!courseId) return;

    const loadKey = `${userId}:${courseId}`;
    if (loadedCourseKeyRef.current === loadKey) return;
    loadedCourseKeyRef.current = loadKey;
    fetchCourseAndContent();
  }, [courseId, status, session?.user?.id, router]);

  useEffect(() => {
    const fetchStudentPhone = async () => {
      if (!session?.user?.id) return;
      try {
        const response = await fetch(`/api/users/${session.user.id}`, { cache: 'no-store' });
        if (!response.ok) return;
        const data = await response.json();
        const phone = data?.user?.phone || '';
        setStudentPhone(typeof phone === 'string' ? phone : '');
      } catch (error) {
        console.error('Failed to fetch student phone:', error);
      }
    };

    fetchStudentPhone();
  }, [session?.user?.id]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/website-content', { cache: 'no-store' });
        if (!res.ok || cancelled) return;
        const json = await res.json();
        const data = json?.data;
        if (cancelled) return;
        if (data?.courseLessonBanner != null) {
          setCourseLessonBanner(data.courseLessonBanner);
        }
      } catch {
        if (!cancelled) setCourseLessonBanner(null);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const fetchCourseAndContent = async () => {
    try {
      setLoading(true);
      setError(null);
      const [courseRes, chaptersRes, lessonsRes] = await Promise.all([
        fetch(`/api/courses/${courseId}`),
        fetch(`/api/chapters?course=${courseId}&isPublished=true&limit=100`),
        fetch(`/api/lessons?course=${courseId}&isPublished=true&limit=1000`),
      ]);
      
      if (courseRes.ok) {
        const cd = await courseRes.json();
        console.log('Course API response:', cd);
        // Handle different response structures
        const courseData = cd.data || cd.course || cd;
        console.log('Course data extracted:', courseData);
        if (courseData && (courseData._id || courseData.id)) {
          setCourse(courseData);
        } else {
          console.error('Invalid course data structure:', courseData);
        }
      } else {
        const errorData = await courseRes.json().catch(() => ({}));
        console.error('Failed to fetch course:', courseRes.status, errorData);
        setError(errorData.error || 'Failed to load course');
      }
      
      let chaptersList: any[] = [];
      if (chaptersRes.ok) {
        const d = await chaptersRes.json();
        chaptersList = d.data?.chapters || d.chapters || [];
        setChapters(chaptersList);
      }
      if (lessonsRes.ok) {
        const d = await lessonsRes.json();
        const ls = d.data?.lessons || d.lessons || [];
        setLessons(ls);
        if (ls.length > 0) {
          const savedLessonId = typeof window !== 'undefined'
            ? localStorage.getItem(getLastLessonStorageKey(courseId))
            : null;
          const hasSavedLesson = savedLessonId
            ? ls.some((lesson: any) => lesson._id === savedLessonId)
            : false;

          const orderedLessons = [...ls].sort((a: any, b: any) => {
            const chapterA = chaptersList.find((ch: any) => ch._id === a.chapter || ch._id === a.chapter?._id);
            const chapterB = chaptersList.find((ch: any) => ch._id === b.chapter || ch._id === b.chapter?._id);
            if (chapterA && chapterB) {
              const chapterOrderDiff = (chapterA.order || 0) - (chapterB.order || 0);
              if (chapterOrderDiff !== 0) return chapterOrderDiff;
            }
            return (a.order || 0) - (b.order || 0);
          });

          const firstVideoLesson = orderedLessons.find((lesson: any) =>
            Boolean(lesson.youtubeVideoId || lesson.videoUrl || lesson.video)
          );
          const fallbackFirstLesson = orderedLessons[0];
          const initialLessonId = hasSavedLesson
            ? savedLessonId
            : (firstVideoLesson?._id || fallbackFirstLesson?._id || null);

          if (initialLessonId) {
            setSelectedLessonId(initialLessonId);
          }
        }
      }
    } catch (e) {
      console.error('Error fetching course content:', e);
      setError('Failed to load course content');
    } finally {
      setLoading(false);
    }
  };

  const selectedLesson = useMemo(() => lessons.find((l: any) => l._id === selectedLessonId), [lessons, selectedLessonId]);


  // Load submission history and check completion when lesson changes
  useEffect(() => {
    if (selectedLesson) {
      const shouldAutoOpenQuiz = pendingAutoQuizLessonIdRef.current === selectedLesson._id;
      if (shouldAutoOpenQuiz) {
        pendingAutoQuizLessonIdRef.current = null;
      }

      // Reset quiz state when lesson changes
      setQuizAlreadySubmitted(false);
      setQuizResult(null);
      setHideVideo(shouldAutoOpenQuiz);
      setShowCongratsModal(false);
      setHasQuiz(false);
      setCurrentQuestionIndex(0);
      setIsVideoPlaying(false);
      // Automatically show history when lesson is selected
      setShowSubmissionHistory(true);
      fetchSubmissionHistory(selectedLesson._id);
      checkLessonCompletion(selectedLesson._id);
      checkQuizSubmissionStatus(selectedLesson._id);
      checkQuizAvailability(selectedLesson._id);

      if (shouldAutoOpenQuiz) {
        void startQuizForLesson(selectedLesson._id);
      }
    }
  }, [selectedLesson]);

  // Persist currently selected lesson, so refresh/reload returns to the same video lesson
  useEffect(() => {
    if (!courseId || !selectedLessonId) return;
    localStorage.setItem(getLastLessonStorageKey(courseId), selectedLessonId);
  }, [courseId, selectedLessonId]);

  // Load quiz availability for all lessons in this course (for lesson list badges).
  useEffect(() => {
    const loadLessonQuizCounts = async () => {
      if (!courseId || lessons.length === 0) {
        setLessonQuizCounts({});
        return;
      }

      try {
        const res = await fetch(`/api/lessons/quiz-availability?course=${courseId}`, {
          cache: 'no-store',
        });
        const data = await res.json();
        if (res.ok && data?.success) {
          setLessonQuizCounts(data.data?.countsByLesson || {});
        } else {
          setLessonQuizCounts({});
        }
      } catch (error) {
        console.error('Failed to load lesson quiz availability:', error);
        setLessonQuizCounts({});
      }
    };

    loadLessonQuizCounts();
  }, [courseId, lessons.length]);

  // Load non-practice quiz completion per lesson (used for next-lesson unlock rules).
  useEffect(() => {
    const loadSubmittedQuizByLesson = async () => {
      if (!courseId || !session?.user?.id) {
        setSubmittedQuizByLesson({});
        return;
      }

      try {
        const res = await fetch(`/api/student/quiz/completion?course=${courseId}`, {
          cache: 'no-store',
        });
        const data = await res.json();
        if (res.ok && data?.success) {
          const lessonIds: string[] = Array.isArray(data?.data?.lessonIds) ? data.data.lessonIds : [];
          const map: Record<string, boolean> = {};
          for (const lessonId of lessonIds) map[lessonId] = true;
          setSubmittedQuizByLesson(map);
        } else {
          setSubmittedQuizByLesson({});
        }
      } catch (error) {
        console.error('Failed to load submitted quiz map:', error);
        setSubmittedQuizByLesson({});
      }
    };

    loadSubmittedQuizByLesson();
  }, [courseId, session?.user?.id]);

  // Load course progress dashboard when course loads (avoid depending on unstable session object / loading churn)
  useEffect(() => {
    if (!courseId || !session?.user?.id) return;
    if (!course?._id) return;
    void fetchCourseProgress();
  }, [courseId, session?.user?.id, course?._id]);

  // Recover YouTube/Plyr player when user switches browser tabs.
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!selectedLesson?.youtubeVideoId || hideVideo) return;

      if (document.hidden) {
        if (playerInstanceRef.current) {
          try {
            wasPlayingBeforeHideRef.current = Boolean(playerInstanceRef.current.playing);
            lastPlaybackTimeRef.current = Number(playerInstanceRef.current.currentTime) || 0;
            if (courseId && selectedLessonId) {
              localStorage.setItem(
                getLessonPlaybackStorageKey(courseId, selectedLessonId),
                String(Math.max(0, lastPlaybackTimeRef.current))
              );
            }
          } catch {
            wasPlayingBeforeHideRef.current = false;
            lastPlaybackTimeRef.current = 0;
          }
        }
        return;
      }

      if (!playerInstanceRef.current) {
        // Fallback: if player is unexpectedly missing, recreate once.
        setPlayerReloadKey(prev => prev + 1);
        return;
      }

      try {
        if (lastPlaybackTimeRef.current > 0) {
          const currentTime = Number(playerInstanceRef.current.currentTime) || 0;
          if (Math.abs(currentTime - lastPlaybackTimeRef.current) > 1.5) {
            playerInstanceRef.current.currentTime = lastPlaybackTimeRef.current;
          }
        }

        if (wasPlayingBeforeHideRef.current && typeof playerInstanceRef.current.play === 'function') {
          const playPromise = playerInstanceRef.current.play();
          if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(() => {});
          }
        }
      } catch {
        // Only if player is really broken, recreate it.
        try {
          playerInstanceRef.current.destroy();
        } catch {}
        playerInstanceRef.current = null;
        setPlayerReloadKey(prev => prev + 1);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [selectedLesson?.youtubeVideoId, hideVideo, courseId, selectedLessonId]);

  // Initialize / cleanup Plyr player when lesson video changes or video is hidden
  useEffect(() => {
    let mounted = true;

    if (!selectedLesson?.youtubeVideoId || hideVideo) {
      setIsVideoPlaying(false);
      if (playerInstanceRef.current) {
        if (courseId && selectedLessonId) {
          try {
            const currentTime = Number(playerInstanceRef.current.currentTime) || 0;
            localStorage.setItem(
              getLessonPlaybackStorageKey(courseId, selectedLessonId),
              String(Math.max(0, currentTime))
            );
          } catch {}
        }
        playerInstanceRef.current.destroy();
        playerInstanceRef.current = null;
      }
      return;
    }

    const container = videoContainerRef.current;
    if (!container) return;

    // Reset container content before initializing a new instance
    container.innerHTML = '';

    // Use Plyr's recommended YouTube embed via data attributes, which avoids the native YouTube title bar UI
    const wrapper = document.createElement('div');
    wrapper.id = `plyr-player-${playerReloadKey}`;
    wrapper.setAttribute('data-plyr-provider', 'youtube');
    wrapper.setAttribute('data-plyr-embed-id', selectedLesson.youtubeVideoId);
    container.appendChild(wrapper);

    const initPlayer = async () => {
      const plyrModule = await import('plyr');
      const Plyr = (plyrModule as any).default || plyrModule;
      if (!mounted) return;

      if (courseId && selectedLessonId) {
        try {
          const savedTime = Number(localStorage.getItem(getLessonPlaybackStorageKey(courseId, selectedLessonId)) || '0');
          if (Number.isFinite(savedTime) && savedTime > 0) {
            lastPlaybackTimeRef.current = savedTime;
          }
        } catch {}
      }

      const player = new Plyr(wrapper, {
        controls: [
          'play-large',
          'play',
          'progress',
          'current-time',
          'mute',
          'volume',
          'settings',
          'pip',
          'airplay',
          'fullscreen',
        ],
        youtube: {
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3,
          modestbranding: 1,
        },
      });

      player.on('ready', () => {
        if (lastPlaybackTimeRef.current > 0) {
          try {
            player.currentTime = lastPlaybackTimeRef.current;
          } catch {}
        }
      });
      player.on('play', () => setIsVideoPlaying(true));
      player.on('pause', () => {
        setIsVideoPlaying(false);
        if (courseId && selectedLessonId) {
          try {
            const currentTime = Number(player.currentTime) || 0;
            localStorage.setItem(
              getLessonPlaybackStorageKey(courseId, selectedLessonId),
              String(Math.max(0, currentTime))
            );
          } catch {}
        }
      });
      player.on('ended', () => {
        setIsVideoPlaying(false);
        if (courseId && selectedLessonId) {
          try {
            localStorage.setItem(getLessonPlaybackStorageKey(courseId, selectedLessonId), '0');
          } catch {}
        }
      });
      player.on('timeupdate', () => {
        if (!courseId || !selectedLessonId) return;
        const now = Date.now();
        if (now - lastPlaybackPersistedAtRef.current < 3000) return;
        lastPlaybackPersistedAtRef.current = now;
        try {
          const currentTime = Number(player.currentTime) || 0;
          localStorage.setItem(
            getLessonPlaybackStorageKey(courseId, selectedLessonId),
            String(Math.max(0, currentTime))
          );
        } catch {}
      });

      const plyrRoot = container.querySelector('.plyr');
      if (plyrRoot) {
        plyrRoot.classList.add('video-title-crop');

        const existingLayer = plyrRoot.querySelector('.video-watermark-layer');
        if (existingLayer) {
          existingLayer.remove();
        }

        if (studentWatermarkText) {
          const layer = document.createElement('div');
          layer.className = 'video-watermark-layer pointer-events-none absolute inset-0 z-30 overflow-hidden';

          const floating = document.createElement('div');
          floating.className = 'video-watermark-float';

          const text = document.createElement('span');
          text.className = 'video-watermark-item';
          text.textContent = studentWatermarkText;

          floating.appendChild(text);
          layer.appendChild(floating);
          plyrRoot.appendChild(layer);
        }
      }

      playerInstanceRef.current = player;
    };

    initPlayer().catch((err) => {
      console.error('Failed to initialize Plyr:', err);
    });

    return () => {
      mounted = false;
      if (playerInstanceRef.current) {
        try {
          lastPlaybackTimeRef.current = Number(playerInstanceRef.current.currentTime) || 0;
          if (courseId && selectedLessonId) {
            localStorage.setItem(
              getLessonPlaybackStorageKey(courseId, selectedLessonId),
              String(Math.max(0, lastPlaybackTimeRef.current))
            );
          }
        } catch {
          lastPlaybackTimeRef.current = 0;
        }
        playerInstanceRef.current.destroy();
        playerInstanceRef.current = null;
      }
    };
  }, [selectedLesson?.youtubeVideoId, hideVideo, studentWatermarkText, playerReloadKey, courseId, selectedLessonId]);

  // Check if quiz exists for the lesson
  const checkQuizAvailability = async (lessonId: string) => {
    try {
      const quizRes = await fetch(`/api/lessons/${lessonId}/quiz`);
      const quizData = await quizRes.json();
      if (quizRes.ok && quizData?.success) {
        const hasQuestions = quizData.data && quizData.data.length > 0;
        setHasQuiz(hasQuestions);
      } else {
        setHasQuiz(false);
      }
    } catch (e) {
      console.error('Failed to check quiz availability', e);
      setHasQuiz(false);
    }
  };

  // Check completion status from database using new API
  const checkLessonCompletion = async (lessonId: string) => {
    try {
      setCheckingCompletion(true);
      
      const res = await fetch(`/api/progress/lesson-status?course=${courseId}&lesson=${lessonId}`);
      const data = await res.json();
      
      if (res.ok && data?.success) {
        const lessonData = data.data;
        const isCompleted = lessonData.isCompleted === true;
        setLessonCompleted(isCompleted);
      } else {
        setLessonCompleted(false);
      }
    } catch (e) {
      console.error('Failed to check lesson completion:', e);
      setLessonCompleted(false);
    } finally {
      setCheckingCompletion(false);
    }
  };

  // Fetch comprehensive course progress
  const fetchCourseProgress = async () => {
    try {
      const dashboardRequest = fetch(`/api/progress/dashboard?course=${courseId}`);
      const enrollmentRequest = session?.user?.id
        ? fetch(`/api/enrollments?student=${session.user.id}&course=${courseId}&limit=1`)
        : null;

      const [dashboardRes, enrollmentRes] = await Promise.all([
        dashboardRequest,
        enrollmentRequest
      ]);

      const dashboardDataResponse = await dashboardRes.json();
      if (dashboardRes.ok && dashboardDataResponse?.success) {
        const dashboardData = dashboardDataResponse.data;
        setCourseProgress(dashboardData.course);

        // Set chapter progress
        const chapterProgressMap: Record<string, any> = {};
        dashboardData.chapters.forEach((chapter: any) => {
          chapterProgressMap[chapter.id] = chapter;
        });
        setChapterProgress(chapterProgressMap);
      }

      if (enrollmentRes) {
        const enrollmentDataResponse = await enrollmentRes.json();
        const currentEnrollment = enrollmentDataResponse?.data?.enrollments?.[0];
        const certificateUrl = currentEnrollment?.certificateUrl || null;
        setCertificateInfo({
          issued: Boolean(currentEnrollment?.certificateIssued) || Boolean(certificateUrl),
          url: certificateUrl
        });
      }
    } catch (e) {
      console.error('Failed to fetch course progress:', e);
    }
  };

  // Check chapter completion status
  const checkChapterCompletion = async (chapterId: string) => {
    try {
      const res = await fetch(`/api/progress/chapter-status?course=${courseId}&chapter=${chapterId}`);
      const data = await res.json();
      
      if (res.ok && data?.success) {
        const chapterData = data.data;
        setChapterProgress(prev => ({
          ...prev,
          [chapterId]: chapterData
        }));
        return chapterData;
      }
    } catch (e) {
      console.error('Failed to check chapter completion:', e);
    }
    return null;
  };

  const lessonsByChapter = useMemo(() => {
    const map: Record<string, any[]> = {};
    for (const lesson of lessons) {
      const key = lesson.chapter?.toString ? lesson.chapter.toString() : lesson.chapter;
      if (!map[key]) map[key] = [];
      map[key].push(lesson);
    }
    Object.values(map).forEach(arr => arr.sort((a, b) => (a.order || 0) - (b.order || 0)));
    return map;
  }, [lessons]);

  // All lessons in course order (chapter order, then lesson order) for prev/next navigation
  const allLessonsOrdered = useMemo(() => {
    return [...lessons].sort((a: any, b: any) => {
      const chapterA = chapters.find((ch: any) => ch._id === a.chapter || ch._id === a.chapter?._id);
      const chapterB = chapters.find((ch: any) => ch._id === b.chapter || ch._id === b.chapter?._id);
      if (chapterA && chapterB) {
        const chapterOrderDiff = (chapterA.order || 0) - (chapterB.order || 0);
        if (chapterOrderDiff !== 0) return chapterOrderDiff;
      }
      return (a.order || 0) - (b.order || 0);
    });
  }, [lessons, chapters]);

  const currentLessonIndex = useMemo(() => {
    if (!selectedLessonId) return -1;
    return allLessonsOrdered.findIndex((l: any) => l._id === selectedLessonId);
  }, [allLessonsOrdered, selectedLessonId]);

  const hasPreviousLesson = currentLessonIndex > 0;
  const hasNextLesson = currentLessonIndex >= 0 && currentLessonIndex < allLessonsOrdered.length - 1;
  const selectedLessonQuizCount = selectedLessonId ? Number(lessonQuizCounts[selectedLessonId] || 0) : 0;
  const canOpenCurrentLessonQuizFromNext = Boolean(
    selectedLessonId &&
    selectedLessonQuizCount > 0 &&
    !quizAlreadySubmitted
  );
  const completedLessonIds = useMemo(() => {
    const ids = new Set<string>();

    Object.values(chapterProgress || {}).forEach((chapter: any) => {
      const chapterLessons = chapter?.lessons || [];
      chapterLessons.forEach((lesson: any) => {
        if (lesson?.id && lesson?.isCompleted) ids.add(lesson.id);
      });
    });

    if (selectedLessonId && lessonCompleted) {
      ids.add(selectedLessonId);
    }

    return ids;
  }, [chapterProgress, selectedLessonId, lessonCompleted]);

  const isLessonUnlocked = (lessonId: string) => {
    const targetIndex = allLessonsOrdered.findIndex((l: any) => l._id === lessonId);
    if (targetIndex === -1) return false;
    if (targetIndex === 0) return true;
    const previousLesson = allLessonsOrdered[targetIndex - 1];
    const previousLessonCompleted = completedLessonIds.has(previousLesson._id);
    if (!previousLessonCompleted) return false;

    const previousLessonQuizCount = Number(lessonQuizCounts[previousLesson._id] || 0);
    if (previousLessonQuizCount <= 0) return true;

    return Boolean(submittedQuizByLesson[previousLesson._id]);
  };

  const selectLessonWithLock = (lessonId: string, options?: { autoOpenQuiz?: boolean }) => {
    if (!isLessonUnlocked(lessonId)) {
      const targetIndex = allLessonsOrdered.findIndex((l: any) => l._id === lessonId);
      const previousLesson = targetIndex > 0 ? allLessonsOrdered[targetIndex - 1] : null;
      const needsQuiz = Boolean(previousLesson && Number(lessonQuizCounts[previousLesson._id] || 0) > 0);
      const quizDone = Boolean(previousLesson && submittedQuizByLesson[previousLesson._id]);

      if (previousLesson && needsQuiz && !quizDone) {
        pendingAutoQuizLessonIdRef.current = previousLesson._id;
        setSelectedLessonId(previousLesson._id);
        setShowCongratsModal(false);
      } else {
        pendingAutoQuizLessonIdRef.current = null;
        window.alert('আগের ভিডিও সম্পূর্ণ শেষ না করলে পরের ভিডিও চালু হবে না।');
      }
      return false;
    }

    const shouldAutoOpenQuiz = Boolean(
      options?.autoOpenQuiz &&
      Number(lessonQuizCounts[lessonId] || 0) > 0 &&
      !submittedQuizByLesson[lessonId]
    );
    pendingAutoQuizLessonIdRef.current = shouldAutoOpenQuiz ? lessonId : null;
    setSelectedLessonId(lessonId);
    setShowCongratsModal(false);
    setHideVideo(shouldAutoOpenQuiz ? true : false);
    return true;
  };
  const handlePreviousLesson = () => {
    if (!hasPreviousLesson) return;
    const prevLesson = allLessonsOrdered[currentLessonIndex - 1];
    selectLessonWithLock(prevLesson._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextLesson = () => {
    if (hasNextLesson) {
      const nextLesson = allLessonsOrdered[currentLessonIndex + 1];
      selectLessonWithLock(nextLesson._id, { autoOpenQuiz: true });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (selectedLessonId && canOpenCurrentLessonQuizFromNext) {
      void startQuizForLesson(selectedLessonId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleMarkCompleted = async () => {
    if (!session?.user || !selectedLesson) return;
    try {
      setMarkingComplete(true);
      setQuizMeta(null);
      setQuizQuestions(null);
      setQuizResult(null);
      
      // Use the new progress completion API
      const res = await fetch('/api/progress/completion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          course: courseId, 
          lesson: selectedLesson._id, 
          isCompleted: true, 
          progressPercentage: 100,
          timeSpent: 0, // You can calculate actual time spent
          type: 'lesson'
        }),
      });
      const data = await res.json();
      
      if (!res.ok || !data?.success) throw new Error(data?.error || 'Failed to mark complete');
      
      setLessonCompleted(true);
      setShowCongratsModal(true);
      
      // Refresh course progress to get updated chapter and course progress
      await fetchCourseProgress();
      
      // Check if quiz has already been submitted
      await checkQuizSubmissionStatus(selectedLesson._id);
      
      // Check quiz availability
      await checkQuizAvailability(selectedLesson._id);
      
      // Only show quiz if it hasn't been submitted yet
      if (!quizAlreadySubmitted) {
        // Check if there's a quiz for this lesson
        const quizRes = await fetch(`/api/lessons/${selectedLesson._id}/quiz`);
        const quizData = await quizRes.json();
        if (quizRes.ok && quizData?.success && quizData.data?.length > 0) {
          setQuizMeta({
            required: true,
            questionsCount: quizData.data.length,
            fetchUrl: `/api/lessons/${selectedLesson._id}/quiz`,
            submitUrl: `/api/lessons/${selectedLesson._id}/quiz/submit`
          });
          setQuizQuestions(quizData.data);
          setQuizAnswers({});
          setQuizStartedAt(new Date());
        }
      }
    } catch (e) {
      console.error('Failed to mark lesson as completed:', e);
    } finally {
      setMarkingComplete(false);
    }
  };

  const startQuizForLesson = async (lessonId: string) => {
    try {
      setHideVideo(true);
      setQuizMeta(null);
      setQuizQuestions(null);
      setQuizResult(null);
      setCurrentQuestionIndex(0);

      window.scrollTo({ top: 0, behavior: 'smooth' });

      const fetchUrl = `/api/lessons/${lessonId}/quiz`;
      const submitUrl = `/api/lessons/${lessonId}/quiz/submit`;
      const qRes = await fetch(fetchUrl);
      const qData = await qRes.json();
      if (qRes.ok && qData?.success) {
        const questions = qData.data || [];
        if (questions.length === 0) {
          setQuizMeta({ required: false, questionsCount: 0, fetchUrl, submitUrl });
          setQuizQuestions([]);
        } else {
          setQuizQuestions(questions);
          setQuizAnswers({});
          setQuizStartedAt(new Date());
          setQuizMeta({ required: true, questionsCount: questions.length, fetchUrl, submitUrl });
        }
      } else {
        setQuizMeta({ required: false, questionsCount: 0, fetchUrl, submitUrl });
        setQuizQuestions([]);
      }
    } catch (e) {
      console.error('Failed to start quiz', e);
      setQuizMeta({ required: false, questionsCount: 0, fetchUrl: '', submitUrl: '' });
      setQuizQuestions([]);
    }
  };

  const handlePracticeQuiz = async () => {
    if (!selectedLesson) return;
    if (quizAlreadySubmitted) {
      const fetchUrl = `/api/lessons/${selectedLesson._id}/quiz`;
      const submitUrl = `/api/lessons/${selectedLesson._id}/quiz/submit`;
      const fallbackCount = Number(
        lessonQuizCounts[selectedLesson._id] ||
        quizResult?.totalQuestions ||
        submissionHistory[0]?.totalQuestions ||
        0
      );

      setHideVideo(true);
      setQuizQuestions(null);
      setCurrentQuestionIndex(0);
      setQuizMeta({
        required: fallbackCount > 0,
        questionsCount: fallbackCount,
        fetchUrl,
        submitUrl,
      });

      if (!quizResult) {
        await checkQuizSubmissionStatus(selectedLesson._id);
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    await startQuizForLesson(selectedLesson._id);
  };

  const handleStartPracticeQuizFromModal = async () => {
    setShowCongratsModal(false);
    setHideVideo(true);
    await handlePracticeQuiz();
  };

  const handleContinueLearning = () => {
    if (!selectedLesson) return;
    if (hasQuiz && !quizAlreadySubmitted) {
      void startQuizForLesson(selectedLesson._id);
      return;
    }
    
    // Find the next lesson by sorting all lessons by chapter order and lesson order
    const allLessons = [...lessons].sort((a: any, b: any) => {
      // Sort by chapter order first, then by lesson order
      const chapterA = chapters.find((ch: any) => ch._id === a.chapter || ch._id === a.chapter?._id);
      const chapterB = chapters.find((ch: any) => ch._id === b.chapter || ch._id === b.chapter?._id);
      if (chapterA && chapterB) {
        const chapterOrderDiff = (chapterA.order || 0) - (chapterB.order || 0);
        if (chapterOrderDiff !== 0) return chapterOrderDiff;
      }
      return (a.order || 0) - (b.order || 0);
    });

    const currentIndex = allLessons.findIndex((l: any) => l._id === selectedLesson._id);
    
    if (currentIndex >= 0 && currentIndex < allLessons.length - 1) {
      // There's a next lesson
      const nextLesson = allLessons[currentIndex + 1];
      selectLessonWithLock(nextLesson._id);
      setShowCongratsModal(false);
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // No next lesson, just close the modal
      setShowCongratsModal(false);
    }
  };

  const handleViewCertificate = () => {
    if (!certificateInfo.issued || !certificateInfo.url) return;
    window.open(certificateInfo.url, '_blank', 'noopener,noreferrer');
  };

  const handleOpenQuizResultModal = async () => {
    if (!selectedLesson?._id) return;
    try {
      setQuizResultDetailsLoading(true);
      setQuizResultDetailsError(null);
      setShowQuizResultModal(true);

      const res = await fetch(`/api/lessons/${selectedLesson._id}/quiz/result-details`, { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Failed to load quiz result details');
      }

      setQuizResultDetails(data.data || null);
    } catch (e: any) {
      setQuizResultDetails(null);
      setQuizResultDetailsError(e?.message || 'Failed to load quiz result details');
    } finally {
      setQuizResultDetailsLoading(false);
    }
  };

  const handleSelectAnswer = (questionId: string, index: number) => {
    setQuizAnswers(prev => ({ ...prev, [questionId]: index }));
  };

  const handleNextQuestion = () => {
    if (quizQuestions && currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmitQuiz = async () => {
    if (!quizMeta || !quizQuestions || quizAlreadySubmitted) return;
    try {
      setQuizSubmitting(true);
      const answers = quizQuestions.map((q: any) => ({ questionId: q._id, selectedIndex: quizAnswers[q._id] ?? -1 }));
      const res = await fetch(quizMeta.submitUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          startedAt: quizStartedAt?.toISOString() || new Date().toISOString(), 
          answers,
          isPracticeMode: false
        }),
      });
      const data = await res.json();
      if (res.ok && data?.success) {
        if (isValidQuizSubmission(data.data)) {
          setQuizResult({
            scorePercentage: data.data.scorePercentage,
            correctAnswers: data.data.correctAnswers,
            totalQuestions: data.data.totalQuestions
          });
          window.dispatchEvent(new CustomEvent('quiz-mark-updated', {
            detail: {
              scorePercentage: data.data.scorePercentage,
              correctAnswers: data.data.correctAnswers,
              totalQuestions: data.data.totalQuestions,
            },
          }));
        } else {
          setQuizResult(null);
        }
        
        setQuizAlreadySubmitted(true);
        if (selectedLesson?._id) {
          setSubmittedQuizByLesson(prev => ({ ...prev, [selectedLesson._id]: true }));
        }
        // Clear questions to prevent re-submission, keep meta so result stays visible in video area.
        setQuizQuestions(null);
        
        // Trigger confetti for 100% score
        if (data.data.scorePercentage === 100) {
          triggerConfetti();
        }
        
        // Refresh submission history after successful submission
        if (selectedLesson) {
          fetchSubmissionHistory(selectedLesson._id);
          checkQuizSubmissionStatus(selectedLesson._id);
        }
      }
    } catch (e) {
      console.error('Failed to submit quiz', e);
    } finally {
      setQuizSubmitting(false);
    }
  };

  const fetchSubmissionHistory = async (lessonId: string) => {
    try {
      setLoadingHistory(true);
      const res = await fetch(`/api/lessons/${lessonId}/quiz/history`);
      const data = await res.json();
      if (res.ok && data?.success) {
        const history = Array.isArray(data.data) ? data.data : [];
        const validHistory = history.filter(isValidQuizSubmission);
        setSubmissionHistory(validHistory);
      }
    } catch (e) {
      console.error('Failed to fetch submission history', e);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Check if quiz has already been submitted (non-practice mode)
  const checkQuizSubmissionStatus = async (lessonId: string) => {
    try {
      const res = await fetch(`/api/lessons/${lessonId}/quiz/history`);
      const data = await res.json();
      if (res.ok && data?.success) {
        const history = (Array.isArray(data.data) ? data.data : []).filter(isValidQuizSubmission);
        // Check if there's any non-practice submission (isPracticeMode === false or undefined/null for old records)
        const hasRealSubmission = history.some((submission: any) => 
          submission.isPracticeMode === false || 
          (submission.isPracticeMode !== true && submission.isPracticeMode !== false) // Handle undefined/null
        );
        setQuizAlreadySubmitted(hasRealSubmission);
        
        // If there's a real submission, show the latest result
        if (hasRealSubmission) {
          const latestSubmission = history.find((sub: any) => 
            sub.isPracticeMode === false || 
            (sub.isPracticeMode !== true && sub.isPracticeMode !== false)
          ) || history[0];
          if (latestSubmission) {
            setQuizResult({
              scorePercentage: latestSubmission.scorePercentage,
              correctAnswers: latestSubmission.correctAnswers,
              totalQuestions: latestSubmission.totalQuestions
            });
          }
        }
      }
    } catch (e) {
      console.error('Failed to check quiz submission status', e);
      // On error, don't change the state
    }
  };

  const triggerConfetti = () => {
    // Create a burst of confetti from the center
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff']
    });

    // Add a second burst after a short delay
    setTimeout(() => {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.4 },
        colors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff']
      });
    }, 250);
  };

  const latestQuizMark = useMemo(() => {
    if (submissionHistory.length === 0) {
      if (!quizResult) return null;
      return {
        scorePercentage: quizResult.scorePercentage,
        correctAnswers: quizResult.correctAnswers,
        totalQuestions: quizResult.totalQuestions,
        isPracticeMode: false,
        submittedAt: null as string | null,
      };
    }

    const realSubmission = submissionHistory.find((submission: any) =>
      submission.isPracticeMode === false ||
      (submission.isPracticeMode !== true && submission.isPracticeMode !== false)
    );
    const latestSubmission = realSubmission || submissionHistory[0];
    if (!latestSubmission) return null;

    return {
      scorePercentage: latestSubmission.scorePercentage,
      correctAnswers: latestSubmission.correctAnswers,
      totalQuestions: latestSubmission.totalQuestions,
      isPracticeMode: Boolean(latestSubmission.isPracticeMode),
      submittedAt: latestSubmission.submittedAt || null,
    };
  }, [submissionHistory, quizResult]);

  if (loading) {
    return (
      <StudentRoleShell>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </StudentRoleShell>
    );
  }

  if (error) {
    return (
      <StudentRoleShell>
        <div className="p-4">
          <div className="bg-red-50 border border-red-200 rounded p-3 text-red-700">{error}</div>
        </div>
      </StudentRoleShell>
    );
  }

  return (
    <StudentRoleShell>
      <main className="relative z-10 p-2 sm:p-3 md:p-4">
        {/* Back Navigation */}
        <div className="mb-3 sm:mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/student/courses')}
            className="flex items-center gap-2 text-xs sm:text-sm cursor-pointer"
          >
            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Back to My Courses</span>
            <span className="sm:hidden">Back</span>
          </Button>
        </div>

        {courseLessonBanner?.enabled !== false && (() => {
          const bannerImageUrl = (courseLessonBanner?.imageUrl ?? '').trim();
          const bannerTitle = courseLessonBanner?.title?.trim() || DEFAULT_LESSON_BANNER_TITLE;
          if (!bannerImageUrl) return null;
          return (
            <section className="mb-3 sm:mb-4">
              <div className="relative w-full overflow-hidden rounded-xl sm:rounded-2xl shadow-md border border-gray-200">
                <div className="relative w-full aspect-[4/1] min-h-[88px] sm:min-h-[110px] bg-gray-100">
                  {bannerImageUrl.startsWith('http') ? (
                    <img
                      src={bannerImageUrl}
                      alt={bannerTitle}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <Image
                      src={bannerImageUrl}
                      alt={bannerTitle}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 1200px"
                      priority
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 md:p-5">
                    <h2 className="inline-block max-w-full rounded-lg sm:rounded-xl bg-white/15 px-3 py-2 sm:px-4 sm:py-2.5 text-left text-sm sm:text-lg md:text-xl font-semibold text-white shadow-lg backdrop-blur-sm border border-white/20 break-words">
                      {bannerTitle}
                    </h2>
                  </div>
                </div>
              </div>
            </section>
          );
        })()}
        
        {/* Mobile-first responsive grid */}
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-3 sm:gap-4">
          {/* Left: Video + Complete + Quiz */}
          <div className="lg:col-span-2 flex flex-col space-y-2 sm:space-y-3 md:space-y-4 min-h-0 order-1">
            {/* Course Title Header - Above Video */}
            {loading ? (
              <div className="relative bg-white rounded-lg sm:rounded-xl shadow-md sm:shadow-lg overflow-hidden border border-gray-200 mb-3 sm:mb-4 p-3 sm:p-4 md:p-6">
                <div className="text-gray-600 text-xs sm:text-sm flex items-center gap-2">
                  <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-blue-600"></div>
                  <span className="truncate">Loading course information...</span>
                </div>
              </div>
            ) : course && course.title ? (
              <div className="relative bg-white rounded-lg sm:rounded-xl shadow-md sm:shadow-lg overflow-hidden border border-gray-200 mb-3 sm:mb-4">
                <div className="relative p-3 sm:p-4 md:p-6">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <div className="p-2 sm:p-2.5 bg-blue-100 rounded-lg shadow-sm flex-shrink-0">
                      <PlayCircle className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-gray-500 text-xs sm:text-sm font-semibold uppercase tracking-wide block truncate">Course</span>
                      {course.category && (
                        <span className="text-gray-600 text-xs font-medium mt-0.5 block truncate">
                          {safeText(course.category)}
                        </span>
                      )}
                    </div>
                  </div>
                  <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 line-clamp-2 sm:line-clamp-3 leading-tight break-words">
                    {safeText(course.title, 'Untitled Course')}
                  </h1>
                 
                </div>
              </div>
            ) : error ? (
              <div className="relative bg-white rounded-lg sm:rounded-xl shadow-md sm:shadow-lg overflow-hidden border border-red-300 mb-3 sm:mb-4 p-3 sm:p-4 md:p-6">
                <div className="text-red-600 text-xs sm:text-sm break-words">{error}</div>
              </div>
            ) : null}

            <PageSection>
              {hideVideo && quizMeta ? (
                <div className="w-full bg-white rounded-lg sm:rounded-xl shadow-md sm:shadow-lg border border-blue-200 p-3 sm:p-4">
                  <h3 className="text-sm sm:text-base font-semibold text-blue-900 mb-3">
                    Lesson Quiz ({quizMeta.questionsCount} questions)
                  </h3>
                  {quizAlreadySubmitted && (
                    <div className="mb-2 sm:mb-3 text-xs text-orange-700 bg-orange-50 border border-orange-200 rounded px-2 py-1 inline-block break-words">
                      ⚠️ Quiz already submitted. You cannot submit again.
                    </div>
                  )}
                  {quizResult ? (
                    <div className="relative overflow-hidden rounded-lg sm:rounded-xl border border-blue-300 bg-gradient-to-br from-blue-50 via-indigo-50 to-white px-4 py-6 sm:px-6 sm:py-8">
                      {(() => {
                        const shouldKeepPracticing = quizResult.scorePercentage < QUIZ_KEEP_PRACTICING_THRESHOLD;
                        return (
                      <div className="mx-auto flex max-w-xl flex-col items-center text-center">
                        <div className="relative mb-5 sm:mb-6">
                          <div className="h-28 w-28 sm:h-36 sm:w-36 rounded-full border-4 border-blue-500/80 bg-white shadow-[0_0_25px_rgba(59,130,246,0.35)] flex items-center justify-center">
                            <span className="text-3xl sm:text-4xl font-bold text-blue-900">
                              {quizResult.correctAnswers}/{quizResult.totalQuestions}
                            </span>
                          </div>
                          <div className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 p-1.5 shadow-lg">
                            <CheckCircle className="w-5 h-5 text-white" />
                          </div>
                        </div>

                        <h3 className="text-3xl sm:text-4xl font-bold text-blue-700 mb-2">
                          {shouldKeepPracticing ? 'Keep practicing' : 'Great Job!'}
                        </h3>
                        <p className="text-base sm:text-lg text-gray-700 max-w-md">
                          {shouldKeepPracticing
                            ? `Your score is ${quizResult.scorePercentage}%. Keep practicing to improve your marks.`
                            : `You have completed the Quiz and achieved ${quizResult.correctAnswers} marks!`}
                        </p>

                        <Button
                          onClick={handleOpenQuizResultModal}
                          className="mt-6 sm:mt-7 rounded-full border border-blue-500 bg-white text-blue-700 hover:bg-blue-50 px-8 py-2.5 text-base font-semibold"
                        >
                          See Result
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                        );
                      })()}
                    </div>
                  ) : quizMeta.questionsCount === 0 ? (
                    <div className="p-3 sm:p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                      <div className="text-yellow-800 font-medium text-sm sm:text-base">No quiz available for this lesson</div>
                      <div className="text-xs sm:text-sm text-yellow-700 mt-1">This lesson doesn't have any quiz questions yet.</div>
                    </div>
                  ) : quizQuestions && quizQuestions.length > 0 ? (
                    <div className="space-y-4 sm:space-y-5">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                        <div className="text-xs sm:text-sm text-gray-600">
                          Question {currentQuestionIndex + 1} of {quizQuestions.length} • Answered {Object.keys(quizAnswers).length}/{quizQuestions.length}
                        </div>
                        {Object.keys(quizAnswers).length < quizQuestions.length && (
                          <div className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded px-2 py-1 whitespace-nowrap">
                            Please answer all questions
                          </div>
                        )}
                      </div>

                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${((currentQuestionIndex + 1) / quizQuestions.length) * 100}%` }}
                        ></div>
                      </div>

                      {quizQuestions[currentQuestionIndex] && (() => {
                        const q = quizQuestions[currentQuestionIndex];
                        const selected = quizAnswers[q._id];
                        return (
                          <div className="border rounded-lg p-3 sm:p-4 border-blue-300 hover:border-blue-400 transition-colors">
                            <div className="font-medium mb-2 sm:mb-3 text-sm sm:text-base break-words">
                              {currentQuestionIndex + 1}. {safeText(q.question)}
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                              {q.options.map((opt: string, i: number) => {
                                const isActive = selected === i;
                                return (
                                  <button
                                    key={i}
                                    type="button"
                                    onClick={() => handleSelectAnswer(q._id, i)}
                                    className={`text-left px-3 py-2.5 sm:py-2 rounded border transition-colors w-full cursor-pointer ${isActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}
                                  >
                                    <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                                      <span className={`inline-block w-4 h-4 sm:w-5 sm:h-5 rounded-full border flex-shrink-0 ${isActive ? 'border-blue-500 bg-blue-500' : 'border-gray-300 bg-white'}`}></span>
                                      <span className="break-words flex-1">{safeText(opt)}</span>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()}

                      <div className="flex items-center justify-between gap-2 sm:gap-3 pt-2">
                        <Button
                          onClick={handlePreviousQuestion}
                          disabled={currentQuestionIndex === 0}
                          variant="outline"
                          className="flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base py-2.5 sm:py-2"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          <span className="hidden sm:inline">Previous</span>
                          <span className="sm:hidden">Prev</span>
                        </Button>

                        {currentQuestionIndex === quizQuestions.length - 1 ? (
                          <Button
                            onClick={handleSubmitQuiz}
                            disabled={quizSubmitting || quizAlreadySubmitted || Object.keys(quizAnswers).length < quizQuestions.length}
                            className="flex-1 sm:flex-initial min-w-[140px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base py-2.5 sm:py-2"
                            title={quizAlreadySubmitted ? "Quiz already submitted" : Object.keys(quizAnswers).length < quizQuestions.length ? "Please answer all questions" : ""}
                          >
                            {quizSubmitting ? 'Submitting...' : quizAlreadySubmitted ? 'Already Submitted' : 'Submit Quiz'}
                          </Button>
                        ) : (
                          <Button
                            onClick={handleNextQuestion}
                            className="flex-1 sm:flex-initial min-w-[140px] text-sm sm:text-base py-2.5 sm:py-2"
                          >
                            <span className="hidden sm:inline">Next</span>
                            <span className="sm:hidden">Next</span>
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : !hideVideo ? (
                <div className="relative isolate w-full aspect-video bg-gray-100 rounded-lg sm:rounded-xl overflow-hidden shadow-md sm:shadow-lg border border-gray-200">
              {selectedLesson?.youtubeVideoId ? (
                <>
                  <div ref={videoContainerRef} className="relative w-full h-full" />
                </>
              ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-sm sm:text-base">No video</div>
                  )}
                </div>
              ) : null}
              {/* Previous / Next lesson navigation - watch lesson by lesson */}
              {selectedLesson && (
                <div className="mt-3 sm:mt-4 flex items-center justify-between gap-2">
                  <Button
                    variant="outline"
                    size="default"
                    onClick={handlePreviousLesson}
                    disabled={!hasPreviousLesson}
                    className="flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border-2 border-gray-300 hover:border-blue-400 text-gray-700 hover:text-blue-600 px-4 py-2.5"
                  >
                    <ArrowLeft className="w-4 h-4 shrink-0" />
                    <span className="hidden sm:inline">Previous lesson</span>
                    <span className="sm:hidden">Previous</span>
                  </Button>
                  <span className="text-xs sm:text-sm text-gray-500 shrink-0">
                    {currentLessonIndex >= 0 ? `${currentLessonIndex + 1} / ${allLessonsOrdered.length}` : '—'}
                  </span>
                  <Button
                    variant="outline"
                    size="default"
                    onClick={handleNextLesson}
                    disabled={!hasNextLesson && !canOpenCurrentLessonQuizFromNext}
                    className="flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border-2 border-gray-300 hover:border-blue-400 text-gray-700 hover:text-blue-600 px-4 py-2.5"
                  >
                    <span className="hidden sm:inline">{hasNextLesson ? 'Next lesson' : 'Go to Quiz'}</span>
                    <span className="sm:hidden">{hasNextLesson ? 'Next' : 'Quiz'}</span>
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </Button>
                </div>
              )}
              <div className="mt-3 sm:mt-4 w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2 sm:gap-3">
                <Button 
                  onClick={handleMarkCompleted} 
                  disabled={!selectedLesson || markingComplete || lessonCompleted || checkingCompletion} 
                  variant="outline" 
                  className={`w-full sm:w-auto sm:flex-1 flex items-center justify-center gap-2 text-sm sm:text-base py-2.5 sm:py-3 px-4 sm:px-6 ${
                    lessonCompleted 
                      ? 'border-green-300 bg-green-50 text-green-700 cursor-default' 
                      : 'border-blue-300 hover:border-blue-400 text-gray-700 cursor-pointer'
                  }`}
                >
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">
                    {lessonCompleted ? 'Completed' : markingComplete ? 'Marking...' : checkingCompletion ? 'Checking...' : 'Mark as Completed'}
                  </span>
                </Button>
              </div>
              {selectedLesson?.description && (
                <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl">
                  <h3 className="text-sm font-semibold text-gray-800 mb-2">Lesson description</h3>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {htmlToPlainText(safeText(selectedLesson.description, ''))}
                  </p>
                </div>
              )}
              {Array.isArray(selectedLesson?.attachments) && selectedLesson.attachments.length > 0 && (
                <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg sm:rounded-xl">
                  <h3 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <Paperclip className="w-4 h-4" />
                    Lesson Attachments
                  </h3>
                  <div className="space-y-2">
                    {selectedLesson.attachments.map((attachment: any, index: number) => (
                      <a
                        key={`${attachment?.url || attachment?.name || 'attachment'}-${index}`}
                        href={attachment?.url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between gap-2 rounded-md border border-blue-200 bg-white px-3 py-2 hover:bg-blue-50 transition-colors"
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-blue-900 truncate">
                            {safeText(attachment?.name, `Attachment ${index + 1}`)}
                          </div>
                          <div className="text-xs text-blue-700">
                            {safeText(attachment?.type, 'File')}
                          </div>
                        </div>
                        <Download className="w-4 h-4 text-blue-700 shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </PageSection>

            {/* Submission History - Always show when lesson is selected */}
            {selectedLesson && (
              <PageSection 
                title={`Quiz History${submissionHistory.length > 0 ? ` (${submissionHistory.length} ${submissionHistory.length === 1 ? 'attempt' : 'attempts'})` : ''}`}
                actions={
                  submissionHistory.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowSubmissionHistory(!showSubmissionHistory)}
                      className="flex items-center gap-2 text-xs sm:text-sm cursor-pointer"
                    >
                      <History className="w-3 h-3 sm:w-4 sm:h-4" />
                      {showSubmissionHistory ? 'Hide History' : 'Show History'}
                    </Button>
                  )
                }
                className="border-purple-200"
              >
                {loadingHistory ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                  </div>
                ) : showSubmissionHistory && submissionHistory.length > 0 ? (
                  <div className="space-y-2 sm:space-y-3">
                    {submissionHistory.map((submission: any, index: number) => (
                    <div key={submission._id || index} className="p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-2">
                        <div className="flex items-center gap-2">
                          <History className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600 flex-shrink-0" />
                          <span className="text-xs sm:text-sm font-medium text-purple-800">
                            Attempt #{submissionHistory.length - index}
                            {submission.isPracticeMode && (
                              <span className="ml-2 text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded">Practice</span>
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                          <span className="text-xs text-gray-600 whitespace-nowrap">
                            {new Date(submission.submittedAt).toLocaleDateString()} at {new Date(submission.submittedAt).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="text-xl sm:text-2xl font-bold text-purple-800">
                            {submission.scorePercentage}%
                          </div>
                          <div className="text-xs sm:text-sm text-purple-700">
                            {submission.correctAnswers}/{submission.totalQuestions} correct
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {submission.scorePercentage >= 80 ? (
                            <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 flex-shrink-0" />
                          ) : submission.scorePercentage >= 60 ? (
                            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                          ) : (
                            <Target className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />
                          )}
                          <span className="text-xs font-medium text-gray-700">
                            {submission.scorePercentage >= 80 ? 'Excellent' : submission.scorePercentage >= 60 ? 'Good' : 'Keep practicing'}
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            submission.scorePercentage >= 80 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                            submission.scorePercentage >= 60 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                            'bg-gradient-to-r from-blue-400 to-blue-600'
                          }`}
                          style={{ width: `${submission.scorePercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                  </div>
                ) : showSubmissionHistory && submissionHistory.length === 0 ? (
                  <div className="p-4 sm:p-6 text-center bg-gray-50 border border-gray-200 rounded-lg">
                    <History className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm sm:text-base text-gray-600">No quiz submissions yet for this lesson</p>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">Complete the quiz to see your submission history here</p>
                  </div>
                ) : null}
              </PageSection>
            )}
          </div>

          {/* Right: Chapters and Lessons */}
          <div className="flex flex-col space-y-2 sm:space-y-3 md:space-y-4 min-h-0 order-2 lg:order-last">
            {/* Course Progress Overview */}
            {courseProgress && (
              <PageSection title="Course Progress" className="border-green-200">
                <div className="space-y-2 sm:space-y-3">
                  <div className="p-2.5 sm:p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm sm:text-base font-medium text-green-800">Overall Progress</span>
                      <span className="text-base sm:text-lg font-bold text-green-600">{courseProgress.progressPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${courseProgress.progressPercentage}%` }}
                      ></div>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between gap-1 sm:gap-0 text-xs text-green-700">
                      <span>{courseProgress.completedLessons}/{courseProgress.totalLessons} lessons</span>
                      <span>{courseProgress.totalTimeSpent}min total</span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-green-200">
                      {certificateInfo.url ? (
                        <button
                          type="button"
                          onClick={handleViewCertificate}
                          className="inline-flex items-center gap-1 text-sm font-semibold text-green-700 hover:text-green-900 underline"
                        >
                          <Award className="w-4 h-4" />
                          Certificate
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                          <Award className="w-3.5 h-3.5" />
                          Certificate not available
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </PageSection>
            )}

            <PageSection title="Chapters">
              <div className="space-y-2 sm:space-y-3">
                {chapters.length === 0 ? (
                  <div className="text-xs sm:text-sm text-gray-500">No chapters available.</div>
                ) : (
                  chapters.map((ch) => {
                    const chapterProg = chapterProgress[ch._id];
                    const isChapterCompleted = chapterProg?.isCompleted || false;
                    const chapterProgressPercentage = chapterProg?.progressPercentage || 0;
                    
                    const isOpen = openChapterId === ch._id;
                    const chapterLessons = lessonsByChapter[ch._id] || [];
                    
                    return (
                      <Collapsible
                        key={ch._id}
                        open={isOpen}
                        onOpenChange={(open) => {
                          if (open) {
                            // When opening a chapter, close all others by setting only this one as open
                            setOpenChapterId(ch._id);
                          } else {
                            // When closing, set to null
                            setOpenChapterId(null);
                          }
                        }}
                      >
                        <div className={`border rounded-lg overflow-hidden ${
                          isChapterCompleted 
                            ? 'border-green-300 bg-green-50' 
                            : 'border-blue-300 bg-white'
                        }`}>
                          <CollapsibleHeader className={`p-2.5 sm:p-3 cursor-pointer ${
                            isChapterCompleted 
                              ? 'hover:bg-green-100' 
                              : 'hover:bg-blue-50'
                          }`}>
                            <div className="flex items-start sm:items-center justify-between gap-2 w-full">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <div className="text-sm sm:text-base font-semibold break-words flex-1 min-w-0 text-left">
                                  {safeText(ch.title)}
                                </div>
                                {isChapterCompleted && (
                                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 sm:py-1 rounded-full whitespace-nowrap flex-shrink-0">
                                    
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            {chapterProg && (
                              <div className="mt-2 w-full">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs text-gray-600">Progress</span>
                                  <span className="text-xs font-medium text-gray-700">{chapterProgressPercentage}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                  <div 
                                    className={`h-1.5 rounded-full transition-all duration-500 ${
                                      isChapterCompleted 
                                        ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                                        : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                                    }`}
                                    style={{ width: `${chapterProgressPercentage}%` }}
                                  ></div>
                                </div>
                                <div className="flex flex-col sm:flex-row justify-between gap-0.5 sm:gap-0 text-xs text-gray-500 mt-1">
                                  <span>{chapterProg.completedLessons}/{chapterProg.totalLessons} lessons</span>
                                  <span>{chapterProg.totalTimeSpent}min</span>
                                </div>
                              </div>
                            )}
                          </CollapsibleHeader>
                          
                          {chapterLessons.length > 0 && (
                            <CollapsibleContent className="px-2.5 sm:px-3 pb-2.5 sm:pb-3">
                              <div className="space-y-1.5 sm:space-y-2 pt-2 border-t border-gray-200">
                                {chapterLessons.map((l) => {
                                  const lessonProg = chapterProg?.lessons?.find((lp: any) => lp.id === l._id);
                                  const isLessonCompleted = lessonProg?.isCompleted || false;
                                  const isUnlocked = isLessonUnlocked(l._id);
                                  const hasVideo = Boolean(l.youtubeVideoId || l.videoUrl || l.video);
                                  const quizCount = Number(lessonQuizCounts[l._id] || 0);
                                  const hasQuizInLesson = quizCount > 0;
                                  
                                  return (
                                    <div key={l._id} className="space-y-1.5">
                                      <button
                                        className={`w-full text-left px-2.5 sm:px-3 py-1.5 sm:py-2 rounded border transition-colors cursor-pointer ${
                                          selectedLessonId === l._id 
                                            ? 'border-blue-400 bg-blue-50' 
                                            : !isUnlocked
                                            ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : isLessonCompleted
                                            ? 'border-green-300 bg-green-50'
                                            : 'border-gray-200 hover:bg-gray-50'
                                        }`}
                                        onClick={() => selectLessonWithLock(l._id)}
                                      >
                                        <div className="flex items-center justify-between gap-2">
                                          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
                                            {isLessonCompleted && (
                                              <span className="text-green-600 flex-shrink-0">✓</span>
                                            )}
                                            {!isUnlocked && (
                                              <span className="text-gray-500 flex-shrink-0">🔒</span>
                                            )}
                                            {hasVideo && (
                                              <PlayCircle className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                                            )}
                                            <div className="min-w-0 flex-1">
                                              <span className="block text-xs sm:text-sm font-medium truncate">
                                                {l.order}. {safeText(l.title)}
                                              </span>
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                                            {hasQuizInLesson && (
                                              <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-[10px] sm:text-xs font-semibold text-purple-700 whitespace-nowrap">
                                                Quiz
                                              </span>
                                            )}
                                            {l.duration && (
                                              <span className="text-xs text-gray-500 whitespace-nowrap">{Math.round((l.duration || 0) / 60)}m</span>
                                            )}
                                            {isLessonCompleted && (
                                              <span className="text-xs text-green-600 whitespace-nowrap">Done</span>
                                            )}
                                          </div>
                                        </div>
                                      </button>
                                      {selectedLessonId === l._id && hasQuiz && (
                                        <Button
                                          onClick={handlePracticeQuiz}
                                          disabled={!selectedLesson || !hasQuiz}
                                          size="sm"
                                          className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 hover:from-blue-600 hover:via-purple-600 hover:to-indigo-700 text-white shadow-sm hover:shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-xs sm:text-sm py-2 px-3"
                                          title={!hasQuiz ? "No quiz available for this lesson" : ""}
                                        >
                                          <PlayCircle className="w-4 h-4 flex-shrink-0" />
                                          <span className="truncate">{quizAlreadySubmitted ? 'Quiz Submitted' : 'Quiz'}</span>
                                        </Button>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </CollapsibleContent>
                          )}
                        </div>
                      </Collapsible>
                    );
                  })
                )}
              </div>
            </PageSection>
          </div>
        </div>

        {/* Congratulatory Modal */}
        <Dialog open={showCongratsModal} onOpenChange={setShowCongratsModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <div className="flex flex-col items-center text-center space-y-4 py-4">
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-12 h-12 text-white" />
                </div>
                <DialogTitle className="text-2xl font-bold text-gray-900">
                  Congratulations! 🎉
                </DialogTitle>
                <DialogDescription className="text-base text-gray-600">
                  You've successfully completed this lesson! Great job!
                </DialogDescription>
              </div>
            </DialogHeader>
            
            {/* Quiz availability message */}
            {!hasQuiz && (
              <div className="px-4 pb-2">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-3">
                  <Target className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-yellow-800">No Quiz Available</p>
                    <p className="text-xs text-yellow-700 mt-1">This lesson doesn't have a quiz. You can continue to the next lesson.</p>
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-4">
              {hasQuiz && (
                <Button
                  onClick={handleStartPracticeQuizFromModal}
                  className="w-full sm:w-auto relative overflow-hidden bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 hover:from-blue-600 hover:via-purple-600 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 px-6 py-3 rounded-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-lg group"
                  title=""
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
                  <PlayCircle className="w-5 h-5 relative z-10" />
                  <span className="relative z-10">{quizAlreadySubmitted ? 'Quiz Submitted' : 'Start Quiz'}</span>
                </Button>
              )}
              <Button
                onClick={handleContinueLearning}
                disabled={hasQuiz && !quizAlreadySubmitted}
                title={hasQuiz && !quizAlreadySubmitted ? 'এই lesson-এ Quiz দেওয়া বাধ্যতামূলক। আগে Quiz দিন।' : ''}
                className="w-full sm:w-auto relative overflow-hidden bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600 hover:from-green-600 hover:via-emerald-600 hover:to-teal-700 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 px-6 py-3 rounded-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-lg group"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
                <span className="relative z-10">Continue Learning</span>
                <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform duration-200" />
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showQuizResultModal} onOpenChange={setShowQuizResultModal}>
          <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Quiz Result Details</DialogTitle>
              <DialogDescription>
                Correct answer and your selected answer are shown for each question.
              </DialogDescription>
            </DialogHeader>

            <div className="max-h-[calc(85vh-140px)] overflow-y-auto pr-1 space-y-3 sm:space-y-4">
              {quizResultDetailsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-blue-600"></div>
                </div>
              ) : quizResultDetailsError ? (
                <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {quizResultDetailsError}
                </div>
              ) : quizResultDetails ? (
                <>
                  <div className="rounded border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-900">
                    Score: {quizResultDetails.correctAnswers}/{quizResultDetails.totalQuestions} ({quizResultDetails.scorePercentage}%)
                  </div>
                  {quizResultDetails.questions.map((q) => (
                    <div
                      key={`${q.order}-${safeText(q.question, 'question')}`}
                      className={`rounded-lg border p-3 sm:p-4 ${
                        q.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                      }`}
                    >
                      <div className="mb-2 text-sm sm:text-base font-semibold text-gray-900">
                        {q.order}. {safeText(q.question)}
                      </div>
                      <div className="space-y-1.5">
                        {q.options.map((opt, idx) => {
                          const isSelected = idx === q.selectedIndex;
                          const isCorrect = idx === q.correctOptionIndex;
                          return (
                            <div
                              key={`${q.order}-${idx}`}
                              className={`rounded border px-2.5 py-2 text-xs sm:text-sm ${
                                isCorrect
                                  ? 'border-green-400 bg-green-100 text-green-900'
                                  : isSelected
                                  ? 'border-red-300 bg-red-100 text-red-900'
                                  : 'border-gray-200 bg-white text-gray-700'
                              }`}
                            >
                              {safeText(opt)}
                              {isCorrect ? '  (Correct)' : isSelected ? '  (Your Answer)' : ''}
                            </div>
                          );
                        })}
                      </div>
                      {q.explanation && (
                        <div className="mt-2 rounded border border-blue-200 bg-blue-50 px-2.5 py-2 text-xs sm:text-sm text-blue-900">
                          Explanation: {q.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </>
              ) : (
                <div className="rounded border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
                  No result details available.
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </StudentRoleShell>
  );
}
