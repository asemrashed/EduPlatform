'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LuStar as Star } from 'react-icons/lu';
import { useCourseReviews } from '@/hooks/useCourseReviews';

interface Course {
  _id: string;
  title: string;
  description?: string;
  category?: string;
  thumbnailUrl?: string;
  isPaid: boolean;
  price?: number;
  salePrice?: number;
  finalPrice: number;
  discountPercentage: number;
  createdBy?: {
    name: string;
    role: string;
  };
  updatedAt: string;
  rating?: number;
  reviewCount?: number;
}

const LatestCoursesSection = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCourses, setTotalCourses] = useState(0);

  // Get course IDs for fetching reviews
  const courseIds = courses.map(course => course._id);
  
  // Fetch reviews for all courses
  const { 
    reviewsData, 
    loading: reviewsLoading 
  } = useCourseReviews(courseIds);

  useEffect(() => {
    fetchLatestCourses();
  }, []);

  // Update courses with rating data when reviews are loaded
  useEffect(() => {
    if (courses.length > 0 && Object.keys(reviewsData).length > 0) {
      const coursesWithRatings = courses.map((course: Course) => {
        const reviewStats = reviewsData[course._id];
        return {
          ...course,
          rating: reviewStats?.averageRating || 0,
          reviewCount: reviewStats?.totalReviews || 0
        };
      });
      setCourses(coursesWithRatings);
    }
  }, [reviewsData]);

  const fetchLatestCourses = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/public/courses?limit=3&sortBy=updatedAt&sortOrder=desc');
      
      if (response.ok) {
        const data = await response.json();
        const coursesData = data.data?.courses || data.courses || [];
        setCourses(coursesData);
        
        // Get total count from pagination info
        const totalCount = data.data?.pagination?.total || data.pagination?.total || coursesData.length;
        setTotalCourses(totalCount);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to load courses');
      }
    } catch (error) {
      console.error('Error fetching latest courses:', error);
      setError('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const getGradientClass = (index: number) => {
    const gradients = [
      'from-red-500 to-red-600',
      'from-red-500 to-red-600', 
      'from-cyan-500 to-cyan-600'
    ];
    return gradients[index % gradients.length];
  };

  const getCategoryDisplay = (category?: string) => {
    if (!category) return 'A2-LEVEL (9702)';
    
    if (category.toLowerCase().includes('as')) return 'AS-LEVEL (9702)';
    if (category.toLowerCase().includes('a2')) return 'A2-LEVEL (9702)';
    if (category.toLowerCase().includes('igcse') || category.toLowerCase().includes('gcse')) return 'IGCSE (0625)';
    
    return category.toUpperCase();
  };

  const getLevelDisplay = (category?: string) => {
    if (!category) return 'In A2 Level';
    
    if (category.toLowerCase().includes('as')) return 'In AS Level';
    if (category.toLowerCase().includes('a2')) return 'In A2 Level';
    if (category.toLowerCase().includes('igcse') || category.toLowerCase().includes('gcse')) return 'In IGCSE';
    
    return `In ${category}`;
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 py-16 lg:py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
              Latest Courses
            </h2>
            <p className="text-lg sm:text-xl text-gray-700 font-medium">
              Full Syllabus Lectures according to recent syllabus of CAIE
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-300"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded mb-4"></div>
                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-gray-300 rounded w-20"></div>
                    <div className="h-8 bg-gray-300 rounded w-24"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 py-16 lg:py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
              Latest Courses
            </h2>
            <p className="text-lg sm:text-xl text-gray-700 font-medium mb-8">
              Full Syllabus Lectures according to recent syllabus of CAIE
            </p>
            <div className="bg-white rounded-xl shadow-lg p-8">
              <p className="text-gray-600 mb-4">{error}</p>
              <button 
                onClick={fetchLatestCourses}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 py-16 lg:py-24 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200 rounded-full blur-3xl transform -translate-x-32 -translate-y-32"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-200 rounded-full blur-3xl transform translate-x-24 translate-y-24"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-200 rounded-full blur-2xl transform -translate-x-1/2 -translate-y-1/2"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
            Latest Courses
          </h2>
          <p className="text-lg sm:text-xl text-gray-700 font-medium">
            Full Syllabus Lectures according to recent syllabus of CAIE
          </p>
        </div>

        {/* Course Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.length > 0 ? (
            courses.map((course, index) => (
              <div key={course._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
                {/* Header Area */}
                {course.thumbnailUrl ? (
                  <Link href={`/course/${course._id}`} className="block relative h-48 overflow-hidden cursor-pointer group">
                    <img 
                      src={course.thumbnailUrl} 
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </Link>
                ) : (
                  <Link href={`/course/${course._id}`} className={`block bg-gradient-to-br ${getGradientClass(index)} p-6 relative cursor-pointer group hover:shadow-lg transition-all duration-300`}>
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-white text-sm font-medium">{getCategoryDisplay(course.category)}</span>
                      <div className="w-6 h-6 border-2 border-white rounded-sm flex items-center justify-center">
                        <div className="w-3 h-3 bg-white rounded-sm"></div>
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                        <div className="w-12 h-12 bg-white/30 rounded-full flex items-center justify-center">
                          <div className="w-8 h-8 bg-white/50 rounded-full flex items-center justify-center">
                            <div className="w-4 h-4 bg-white rounded-full"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                )}
                
                {/* Content Area */}
                <div className="p-6">
                  <Link href={`/course/${course._id}`} className="block">
                    <h4 className="text-gray-900 font-semibold text-lg mb-2 hover:text-blue-600 transition-colors duration-200 cursor-pointer">{course.title}</h4>
                  </Link>
                  
                  {/* Rating Display */}
                  {course.rating && course.rating > 0 && (
                    <div className="flex items-center mb-3">
                      <div className="flex space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${
                              i < Math.floor(course.rating || 0) 
                                ? 'text-yellow-400 fill-current' 
                                : 'text-gray-300'
                            }`} 
                          />
                        ))}
                      </div>
                      <span className="ml-2 text-sm text-gray-600">
                        {course.rating?.toFixed(1)} ({course.reviewCount} review{course.reviewCount !== 1 ? 's' : ''})
                      </span>
                    </div>
                  )}
                  
                  <p className="text-gray-600 text-sm mb-4">{getLevelDisplay(course.category)}</p>
                  <div className="flex justify-between items-center">
                    <div>
                      {course.discountPercentage > 0 && course.price && (
                        <span className="text-gray-400 line-through text-sm">
                          BDT {course.price.toLocaleString()}
                        </span>
                      )}
                      <span className="text-gray-900 font-bold text-lg ml-2">
                        BDT {course.finalPrice.toLocaleString()}
                      </span>
                    </div>
                    <Link 
                      href={`/course/${course._id}`} 
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      View Course
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-600 text-lg">No courses available at the moment.</p>
            </div>
          )}
        </div>

        {/* View More Button - Only show if there are more courses */}
        {totalCourses > 3 && (
          <div className="text-center mt-12">
            <Link 
              href="/courses" 
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              View More Courses ({totalCourses - 3} more available)
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default LatestCoursesSection;
