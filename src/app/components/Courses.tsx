"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LuBookOpen } from "react-icons/lu";
import { useSession } from "next-auth/react";
import CourseCard from "./CourseCard";
import type { CourseWithStats } from "@/lib/courses";
import type { CoursesContent } from "@/constants/coursesContent";
import { defaultCoursesContent } from "@/constants/coursesContent";

interface CoursesProps {
  initialCourses?: CourseWithStats[];
  initialContent?: CoursesContent;
}

// Helper function to get category color
const getCategoryColor = (category?: string): string => {
  const colors: Record<string, string> = {
    'Lifestyle': 'bg-red-100 text-red-600',
    'Marketing': 'bg-blue-100 text-blue-600',
    'Development': 'bg-green-100 text-green-600',
    'Art & Design': 'bg-purple-100 text-purple-600',
    'Business': 'bg-orange-100 text-orange-600',
    'Technology': 'bg-indigo-100 text-indigo-600',
    'Photography': 'bg-pink-100 text-pink-600',
    'Design': 'bg-purple-100 text-purple-600',
  };
  return colors[category || ''] || 'bg-gray-100 text-gray-600';
};


// Helper function to get level based on difficulty or default
const getLevel = (difficulty?: string): { level: string; color: string } => {
  const levels: Record<string, { level: string; color: string }> = {
    'beginner': { level: 'Beginner', color: 'bg-blue-400' },
    'intermediate': { level: 'Intermediate', color: 'bg-yellow-500' },
    'advanced': { level: 'Advance', color: 'bg-red-500' },
  };
  return levels[difficulty || ''] || { level: 'All Level', color: 'bg-[#A855F7]' };
};

// Map API course to CourseCard format
const mapCourseToCard = (course: CourseWithStats, index: number) => {
  const levelInfo = getLevel();
  const categoryColor = course.categoryInfo?.color 
    ? `bg-${course.categoryInfo.color}-100 text-${course.categoryInfo.color}-600`
    : getCategoryColor(course.category);
  
  // Calculate hours from minutes
  const hours = Math.round(course.totalDuration / 60);
  
  return {
    id: index + 1,
    image: course.thumbnailUrl || "https://live.themewild.com/edubo/assets/img/course/05.jpg",
    level: levelInfo.level,
    levelColor: levelInfo.color,
    category: course.category || 'Uncategorized',
    categoryColor,
    rating: "0", // Will be updated when reviews are integrated
    title: course.title,
    lectures: course.lessonCount,
    hours: hours || 0,
    instructor: {
      name: course.instructor?.name || 'Unknown Instructor',
      avatar: course.instructor?.avatar || "https://live.themewild.com/edubo/assets/img/course/ins-1.jpg",
    },
    price: course.finalPrice,
    originalPrice: course.discountPercentage > 0 && course.price ? course.price : null,
    courseId: course._id, // Add course ID for linking
  };
};

export default function Courses({ initialCourses, initialContent }: CoursesProps) {
  const { data: session } = useSession();
  const [isLoaded, setIsLoaded] = useState(false);
  const [visibleCourses, setVisibleCourses] = useState(8); // Show 8 courses (4 per row × 2 rows)
  const [courses, setCourses] = useState<CourseWithStats[]>(initialCourses || []);
  const [coursesContent, setCoursesContent] = useState<CoursesContent>(initialContent || defaultCoursesContent);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    // Only fetch if initialContent was not provided (fallback for client-side updates)
    if (!initialContent) {
      const fetchCoursesContent = async () => {
        try {
          const response = await fetch('/api/website-content', {
            cache: 'no-store', // Always fetch fresh data to avoid showing deleted courses
          });
          if (response.ok) {
            const data = await response.json();
            if (data.data?.courses) {
              setCoursesContent(data.data.courses);
            }
          }
        } catch (error) {
          console.error('Error fetching courses content:', error);
        }
      };
      fetchCoursesContent();
    }
  }, [initialContent]);

  useEffect(() => {
    const fetchMyEnrollments = async () => {
      if (!session?.user?.id) {
        setEnrolledCourseIds(new Set());
        return;
      }

      try {
        const response = await fetch(`/api/enrollments?student=${session.user.id}&limit=1000`, {
          cache: 'no-store',
        });
        if (!response.ok) return;

        const data = await response.json();
        const list = data?.data?.enrollments ?? data?.enrollments ?? [];
        const ids = new Set<string>();

        for (const enrollment of list) {
          if (enrollment?.status !== 'active' && enrollment?.status !== 'completed') continue;
          const courseId = typeof enrollment?.course === 'string'
            ? enrollment.course
            : enrollment?.course?._id;
          if (courseId) ids.add(String(courseId));
        }

        setEnrolledCourseIds(ids);
      } catch (error) {
        console.error('Error fetching enrollments for courses section:', error);
      }
    };

    fetchMyEnrollments();
  }, [session?.user?.id]);

  // Fetch courses from database
  useEffect(() => {
    const fetchCourses = async () => {
      // Only fetch if initialCourses were not provided
      if (!initialCourses || initialCourses.length === 0) {
        setLoadingCourses(true);
        try {
          const response = await fetch('/api/public/courses-by-category?category=&limit=8', {
            cache: 'no-store', // Always fetch fresh data to avoid showing deleted courses
          });
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data) {
              setCourses(data.data);
            }
          }
        } catch (error) {
          console.error('Error fetching courses:', error);
        } finally {
          setLoadingCourses(false);
        }
      }
    };

    fetchCourses();
  }, [initialCourses]);

  const loadMoreCourses = () => {
    setVisibleCourses((prev) => prev + 8); // Load 8 more courses (2 more rows)
  };

  const defaultCourses = [
    {
      id: 1,
      image: "https://live.themewild.com/edubo/assets/img/course/05.jpg",
      level: "All Level",
      levelColor: "bg-[#A855F7]",
      category: "Lifestyle",
      categoryColor: "bg-red-100 text-red-600",
      rating: "7.3k",
      title: "Become A Product Manager Learn The Skills & Job",
      lectures: 35,
      hours: 48,
      instructor: {
        name: "Heiner Tina",
        avatar: "https://live.themewild.com/edubo/assets/img/course/ins-1.jpg",
      },
      price: 84,
      originalPrice: null,
    },
    {
      id: 2,
      image: "https://live.themewild.com/edubo/assets/img/course/05.jpg",
      level: "Advance",
      levelColor: "bg-red-500",
      category: "Marketing",
      categoryColor: "bg-blue-100 text-blue-600",
      rating: "1.7k",
      title: "Complete Digital Marketing Course - 12 Courses In 1",
      lectures: 120,
      hours: 150,
      instructor: {
        name: "Leo Hender",
        avatar: "https://live.themewild.com/edubo/assets/img/course/ins-1.jpg",
      },
      price: 98,
      originalPrice: null,
    },
    {
      id: 3,
      image: "https://live.themewild.com/edubo/assets/img/course/05.jpg",
      level: "Beginner",
      levelColor: "bg-blue-400",
      category: "Development",
      categoryColor: "bg-green-100 text-green-600",
      rating: "3.5k",
      title: "Advance PHP Knowledge And Learn Laravel Framework",
      lectures: 64,
      hours: 30,
      instructor: {
        name: "Sara Wood",
        avatar: "https://live.themewild.com/edubo/assets/img/course/ins-1.jpg",
      },
      price: 69,
      originalPrice: 75,
    },
    {
      id: 4,
      image: "https://live.themewild.com/edubo/assets/img/course/05.jpg",
      level: "Advance",
      levelColor: "bg-red-500",
      category: "Art & Design",
      categoryColor: "bg-purple-100 text-purple-600",
      rating: "5.2k",
      title: "Full Web Designing Course With 20 Web Template",
      lectures: 75,
      hours: 58,
      instructor: {
        name: "Michel Johny",
        avatar: "https://live.themewild.com/edubo/assets/img/course/ins-1.jpg",
      },
      price: 125,
      originalPrice: null,
    },
    {
      id: 5,
      image: "https://live.themewild.com/edubo/assets/img/course/05.jpg",
      level: "Beginner",
      levelColor: "bg-blue-400",
      category: "Business",
      categoryColor: "bg-orange-100 text-orange-600",
      rating: "4.1k",
      title: "Business Strategy & Management Fundamentals",
      lectures: 50,
      hours: 60,
      instructor: {
        name: "David Smith",
        avatar: "https://live.themewild.com/edubo/assets/img/course/ins-1.jpg",
      },
      price: 89,
      originalPrice: null,
    },
    {
      id: 6,
      image: "https://live.themewild.com/edubo/assets/img/course/05.jpg",
      level: "Advance",
      levelColor: "bg-red-500",
      category: "Technology",
      categoryColor: "bg-indigo-100 text-indigo-600",
      rating: "6.8k",
      title: "Advanced React & Next.js Development Course",
      lectures: 90,
      hours: 120,
      instructor: {
        name: "Emily Chen",
        avatar: "https://live.themewild.com/edubo/assets/img/course/ins-1.jpg",
      },
      price: 95,
      originalPrice: null,
    },
    {
      id: 7,
      image: "https://live.themewild.com/edubo/assets/img/course/05.jpg",
      level: "All Level",
      levelColor: "bg-[#A855F7]",
      category: "Photography",
      categoryColor: "bg-pink-100 text-pink-600",
      rating: "2.9k",
      title: "Professional Photography & Editing Masterclass",
      lectures: 45,
      hours: 55,
      instructor: {
        name: "James Wilson",
        avatar: "https://live.themewild.com/edubo/assets/img/course/ins-1.jpg",
      },
      price: 79,
      originalPrice: null,
    },
    {
      id: 8,
      image: "https://live.themewild.com/edubo/assets/img/course/05.jpg",
      level: "Beginner",
      levelColor: "bg-blue-400",
      category: "Design",
      categoryColor: "bg-purple-100 text-purple-600",
      rating: "5.5k",
      title: "UI/UX Design Principles & Figma Workshop",
      lectures: 55,
      hours: 70,
      instructor: {
        name: "Lisa Anderson",
        avatar: "https://live.themewild.com/edubo/assets/img/course/ins-1.jpg",
      },
      price: 88,
      originalPrice: null,
    },
  ];


  return (
    <section
      className="course-area bg-img relative bg-gradient-to-b from-[#FEF9F3] to-[#F3E5F5] py-20 px-4 md:px-6 lg:px-8"
    >
      <div className="relative z-10 mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 text-center md:mb-12">
          {/* Our Courses Button */}
          <div
            className={`mb-4 inline-flex items-center gap-3 rounded-full px-5 py-2.5 ${
              isLoaded ? "animate-fade-in-up" : "animate-on-load"
            }`}
            style={{
              animationDelay: "0.1s",
              fontFamily: "var(--font-bengali), sans-serif",
              backgroundColor: coursesContent.label.backgroundColor,
            }}
          >
            <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white">
              <LuBookOpen className="w-3.5 h-3.5" style={{ color: coursesContent.label.backgroundColor }} />
            </div>
            <span className="text-xs font-semibold text-white">{coursesContent.label.text}</span>
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
            <span style={{ color: coursesContent.titleColors.part1 }}>{coursesContent.title.part1}</span>{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: coursesContent.gradientColors.via
                  ? `linear-gradient(to right, ${coursesContent.gradientColors.from}, ${coursesContent.gradientColors.via}, ${coursesContent.gradientColors.to})`
                  : `linear-gradient(to right, ${coursesContent.gradientColors.from}, ${coursesContent.gradientColors.to})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {coursesContent.title.part2}
            </span>
          </h2>
        </div>

        {/* Courses Carousel */}
        <div className="relative">
          {/* Courses Grid */}
          <div className="overflow-hidden">
            {loadingCourses ? (
              <div className="grid grid-cols-1 gap-6 pb-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[...Array(8)].map((_, index) => (
                  <div
                    key={index}
                    className="group block min-h-[430px] overflow-hidden rounded-3xl bg-white shadow-lg animate-pulse"
                  >
                    {/* Course Image Skeleton */}
                    <div className="relative h-52 overflow-hidden p-4 md:h-60 lg:h-64">
                      <div className="relative h-full w-full overflow-hidden rounded-2xl bg-gray-200"></div>
                    </div>

                    {/* Course Content Skeleton */}
                    <div className="p-5">
                      {/* Category and Rating Row Skeleton */}
                      <div className="mb-4 flex items-center justify-between">
                        <div className="h-6 w-20 rounded-full bg-gray-200"></div>
                        <div className="h-6 w-16 rounded-full bg-gray-200"></div>
                      </div>

                      {/* Course Title Skeleton */}
                      <div className="mb-4 space-y-2">
                        <div className="h-5 w-full rounded bg-gray-200"></div>
                        <div className="h-5 w-3/4 rounded bg-gray-200"></div>
                      </div>

                      {/* Price and Button Row Skeleton */}
                      <div className="flex items-center justify-between border-t border-gray-100 pt-4 gap-4">
                        <div className="flex flex-col gap-1">
                          <div className="h-6 w-16 rounded bg-gray-200"></div>
                          <div className="h-4 w-12 rounded bg-gray-200"></div>
                        </div>
                        <div className="h-10 w-24 rounded-lg bg-gray-200"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 pb-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {(courses.length > 0 
                  ? courses.map((course, index) => mapCourseToCard(course, index))
                  : defaultCourses
                ).slice(0, 8).map((course, index) => (
                  <CourseCard
                    key={(course as any).courseId || course.id}
                    course={course}
                    isEnrolled={Boolean((course as any).courseId && enrolledCourseIds.has((course as any).courseId))}
                    index={index}
                    isLoaded={isLoaded}
                    className="min-h-[430px]"
                  />
                ))}
              </div>
            )}
          </div>

          {/* See All Courses Button */}
          <div className="mt-10 flex justify-center">
            <Link
              href={coursesContent.buttonHref}
              className="group flex items-center gap-2 rounded-lg px-8 py-3.5 text-base font-semibold text-white transition-all hover:shadow-xl hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${coursesContent.buttonGradientFrom} 0%, ${coursesContent.buttonGradientTo} 100%)`,
                boxShadow: "0 4px 15px rgba(236, 72, 153, 0.3)",
                fontFamily: "var(--font-bengali), sans-serif",
              }}
            >
              <span>{coursesContent.buttonText}</span>
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
              >
                <path
                  d="M5 13L13 5M13 5H7M13 5V11"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
