"use client";

import { useEffect, useState } from "react";
import { LuBookOpen } from "react-icons/lu";
import GradientButton from "./Button";
import CourseCard from "./CourseCard";
import type { CoursesByCategoryContent } from "@/constants/coursesByCategoryContent";
import { defaultCoursesByCategoryContent } from "@/constants/coursesByCategoryContent";
import type { Category } from "@/lib/categories";
import type { CourseWithStats } from "@/lib/courses";

interface CoursesByCategoryProps {
  initialContent?: CoursesByCategoryContent;
  initialCategories?: Category[];
  initialCourses?: CourseWithStats[];
}

export default function CoursesByCategory({ initialContent, initialCategories, initialCourses }: CoursesByCategoryProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [categories, setCategories] = useState<Category[]>(initialCategories || []);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [visibleCourses, setVisibleCourses] = useState(8); // Show 8 courses (4 per row × 2 rows)
  const [coursesByCategoryContent, setCoursesByCategoryContent] = useState<CoursesByCategoryContent>(initialContent || defaultCoursesByCategoryContent);
  const [courses, setCourses] = useState<CourseWithStats[]>(initialCourses || []);
  const [loadingCourses, setLoadingCourses] = useState(false);
  
  // Add static "All" category at the beginning
  const allCategories = [
    { _id: 'all', name: 'All', description: 'Show all courses', color: '#A855F7', isActive: true },
    ...categories
  ];

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    // Only fetch if initialContent was not provided (fallback for client-side updates)
    if (!initialContent) {
      const fetchCoursesByCategoryContent = async () => {
        try {
          const response = await fetch('/api/website-content', {
            cache: 'force-cache',
            next: { tags: ['website-content'] },
          });
          if (response.ok) {
            const data = await response.json();
            if (data.data?.coursesByCategory) {
              setCoursesByCategoryContent(data.data.coursesByCategory);
            }
          }
        } catch (error) {
          console.error('Error fetching courses by category content:', error);
        }
      };
      fetchCoursesByCategoryContent();
    }
  }, [initialContent]);

  useEffect(() => {
    // Fetch categories if not provided
    if (!initialCategories || initialCategories.length === 0) {
      const fetchCategories = async () => {
        try {
          const response = await fetch('/api/public/categories', {
            cache: 'force-cache',
            next: { tags: ['categories'] },
          });
          if (response.ok) {
            const data = await response.json();
            if (data.data && data.data.length > 0) {
              setCategories(data.data);
              // Keep "All" as default selected category
              if (!selectedCategory || selectedCategory === "") {
                setSelectedCategory("All");
              }
            }
          }
        } catch (error) {
          console.error('Error fetching categories:', error);
        }
      };
      fetchCategories();
    }
  }, [initialCategories, selectedCategory]);

  // Fetch courses when category changes
  useEffect(() => {
    const fetchCourses = async () => {
      setLoadingCourses(true);
      try {
        const categoryParam = selectedCategory === "All" ? "" : selectedCategory;
        // Use a higher limit to show more courses, or remove limit for "All"
        const limit = selectedCategory === "All" ? 100 : 20;
        const response = await fetch(`/api/public/courses-by-category?category=${encodeURIComponent(categoryParam)}&limit=${limit}`, {
          cache: 'no-store', // Always fetch fresh data to avoid showing deleted courses
        });
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setCourses(data.data);
            setVisibleCourses(8); // Reset visible courses when category changes (2 rows)
          }
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoadingCourses(false);
      }
    };

    // Always fetch when category changes, including "All"
    fetchCourses();
  }, [selectedCategory]);

  const loadMoreCourses = () => {
    setVisibleCourses((prev) => prev + 8); // Load 8 more courses (2 more rows)
  };

  // Get category color helper - returns Tailwind classes or inline style
  const getCategoryColor = (categoryName: string): { className?: string; style?: React.CSSProperties } => {
    const category = categories.find(cat => cat.name === categoryName);
    if (category?.color) {
      // If color is a hex code, use inline style
      if (category.color.startsWith('#')) {
        // Convert hex to rgba for background with opacity
        const hex = category.color.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        return {
          style: {
            backgroundColor: `rgba(${r}, ${g}, ${b}, 0.1)`,
            color: category.color,
          }
        };
      }
      // If it's a Tailwind color name, use classes
      return {
        className: `bg-${category.color}-100 text-${category.color}-600`
      };
    }
    // Fallback colors
    const fallbackColors: Record<string, string> = {
      'Development': 'bg-green-100 text-green-600',
      'Art & Design': 'bg-purple-100 text-purple-600',
      'Business': 'bg-blue-100 text-blue-600',
      'Lifestyle': 'bg-red-100 text-red-600',
      'Photo & Video': 'bg-pink-100 text-pink-600',
    };
    return {
      className: fallbackColors[categoryName] || 'bg-gray-100 text-gray-600'
    };
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
    const categoryColorObj = getCategoryColor(course.category || '');
    const categoryColor = categoryColorObj.className || '';
    
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

  // Filter courses based on selected category (already filtered by API, but keep for consistency)
  const filteredCourses = courses.filter((course) => {
    if (!selectedCategory || selectedCategory === "All") return true;
    return course.category === selectedCategory;
  });

  // Reset visible courses when category changes
  useEffect(() => {
    setVisibleCourses(8); // Show 2 rows (8 courses)
  }, [selectedCategory]);

  return (
    <section className="relative bg-white py-20 px-4 md:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-6 md:mb-12">
          {/* Top Row - Title and Button */}
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            {/* Left Side - Title */}
            <div>
              {/* Courses Button */}
              <div
                className={`mb-4 inline-flex items-center gap-3 rounded-full px-5 py-2.5 ${
                  isLoaded ? "animate-fade-in-up" : "animate-on-load"
                }`}
                style={{
                  animationDelay: "0.1s",
                  fontFamily: "var(--font-bengali), sans-serif",
                  backgroundColor: coursesByCategoryContent.label.backgroundColor,
                }}
              >
                <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white">
                  <LuBookOpen className="w-3.5 h-3.5" style={{ color: coursesByCategoryContent.label.backgroundColor }} />
                </div>
                <span className="text-xs font-semibold text-white">{coursesByCategoryContent.label.text}</span>
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
                <span style={{ color: coursesByCategoryContent.titleColors.part1 }}>{coursesByCategoryContent.title.part1}</span>{" "}
                <span style={{ color: coursesByCategoryContent.titleColors.part2 }}>{coursesByCategoryContent.title.part2}</span>{" "}
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage: `linear-gradient(to right, ${coursesByCategoryContent.gradientColors.from}, ${coursesByCategoryContent.gradientColors.to})`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {coursesByCategoryContent.title.part3}
                </span>
              </h2>
            </div>

            {/* Right Side - View All Button */}
            <div
              className={`${
                isLoaded ? "animate-fade-in-up" : "animate-on-load"
              }`}
              style={{ animationDelay: "0.4s" }}
            >
              {/* <Link
                href="/all-courses"
                className="group flex cursor-pointer items-center gap-2 rounded-lg px-6 py-3 text-base font-semibold text-white transition-all hover:shadow-xl"
                style={{
                  fontFamily: "var(--font-bengali), sans-serif",
                  background: "linear-gradient(135deg, #EC4899 0%, #A855F7 100%)",
                  boxShadow: "0 4px 15px rgba(236, 72, 153, 0.3)",
                }}
              >
                <span>সব কোর্স দেখুন</span>
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
              </Link> */}
              <GradientButton href={coursesByCategoryContent.buttonHref} showArrow={true}>
                {coursesByCategoryContent.buttonText}
              </GradientButton>
            </div>
          </div>

          {/* Bottom Row - Category Filters */}
          <div
            className={`flex items-center ${
              isLoaded ? "animate-fade-in-up" : "animate-on-load"
            }`}
            style={{ animationDelay: "0.5s" }}
          >
            {/* Filter Container with Border - Scrollable on Mobile */}
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex min-w-max items-center gap-2 rounded-4xl border-2 border-purple-200 bg-white p-2 sm:min-w-0 sm:flex-wrap">
                {allCategories.length > 0 ? (
                  allCategories.map((category) => (
                    <button
                      key={category._id}
                      onClick={() => setSelectedCategory(category.name)}
                      className={`flex-shrink-0 cursor-pointer whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition-all sm:px-5 sm:text-sm ${
                        selectedCategory === category.name
                          ? "text-white"
                          : "text-purple-700"
                      }`}
                      style={{
                        fontFamily: "var(--font-bengali), sans-serif",
                        background:
                          selectedCategory === category.name
                            ? "linear-gradient(to right, #EC4899, #A855F7)"
                            : "#F3E8FF",
                      }}
                    >
                      {category.name}
                    </button>
                  ))
                ) : (
                  // Fallback categories if none are loaded
                  ["All", "Development", "Art & Design", "Business", "Lifestyle", "Photo & Video"].map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`flex-shrink-0 cursor-pointer whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition-all sm:px-5 sm:text-sm ${
                        selectedCategory === category
                          ? "text-white"
                          : "text-purple-700"
                      }`}
                      style={{
                        fontFamily: "var(--font-bengali), sans-serif",
                        background:
                          selectedCategory === category
                            ? "linear-gradient(to right, #EC4899, #A855F7)"
                            : "#F3E8FF",
                      }}
                    >
                      {category}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        {loadingCourses ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(8)].map((_, index) => (
              <div
                key={index}
                className="group block overflow-hidden rounded-3xl bg-white shadow-lg animate-pulse"
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
        ) : filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {filteredCourses.slice(0, 8).map((course, index) => {
              const mappedCourse = mapCourseToCard(course, index);
              return (
                <CourseCard
                  key={course._id}
                  course={mappedCourse}
                  index={index}
                  isLoaded={isLoaded}
                  animationDelay={`${0.1 * index}s`}
                />
              );
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-600">No courses found</p>
              <p className="mt-2 text-sm text-gray-500">
                {selectedCategory === "All" 
                  ? "No courses available at the moment." 
                  : `No courses found in the "${selectedCategory}" category.`}
              </p>
            </div>
          </div>
        )}

        {/* Load More Button */}
        {filteredCourses.length > 8 && (
          <div className="mt-10 flex justify-center">
            <button
              onClick={loadMoreCourses}
              className="group flex items-center gap-2 rounded-lg px-8 py-3.5 text-base font-semibold text-white transition-all hover:shadow-xl hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${coursesByCategoryContent.buttonGradientFrom} 0%, ${coursesByCategoryContent.buttonGradientTo} 100%)`,
                boxShadow: "0 4px 15px rgba(236, 72, 153, 0.3)",
                fontFamily: "var(--font-bengali), sans-serif",
              }}
            >
              <span>আরও দেখুন</span>
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                className="transition-transform group-hover:translate-y-1"
              >
                <path
                  d="M9 3L9 15M9 15L15 9M9 15L3 9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        )}

       
      </div>
    </section>
  );
}

