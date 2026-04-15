'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  LuBookmark as Bookmark,
  LuStar as Star,
  LuClock as Clock,
  LuUsers as Users,
  LuUser as User,
  LuEye as Eye,
  LuAtom as Atom,
  LuCircle as Circle,
  LuZap as Zap
} from 'react-icons/lu';
import { Course } from '@/types/course';

interface Review {
  _id: string;
  student: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  course: string;
  rating: number;
  title?: string;
  comment?: string;
  isApproved: boolean;
  isPublic: boolean;
  helpfulVotes: number;
  createdAt: string;
  updatedAt: string;
}

interface CourseWithStats extends Omit<Course, 'instructor'> {
  rating?: number;
  reviewCount?: number;
  enrollmentCount?: number;
  duration?: number;
  lessonCount?: number;
  instructor?: {
    name: string;
    role: string;
  };
  recentReviews?: Review[];
}

interface CourseCardProps {
  course: CourseWithStats;
  index?: number;
  showViewDetails?: boolean;
}

export default function CourseCard({ 
  course, 
  index = 0, 
  showViewDetails = true
}: CourseCardProps) {
  const getBannerColor = (index: number) => {
    const colors = ['bg-red-500', 'bg-blue-500', 'bg-cyan-500'];
    return colors[index % colors.length];
  };

  const getBannerIcon = (course: CourseWithStats) => {
    if (course.title.toLowerCase().includes('gas')) return <Atom className="w-6 h-6" />;
    if (course.title.toLowerCase().includes('circle')) return <Circle className="w-6 h-6" />;
    if (course.title.toLowerCase().includes('particle')) return <Zap className="w-6 h-6" />;
    if (course.title.toLowerCase().includes('circuit')) return <Zap className="w-6 h-6" />;
    return <Atom className="w-6 h-6" />;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };


  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300">
      {/* Course Banner */}
      <div className={`${getBannerColor(index)} text-white p-4 relative`}>
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-medium opacity-90">
            {course.category?.toUpperCase() || 'A2-LEVEL'} (9702)
          </div>
          <Bookmark className="w-4 h-4 opacity-80" />
        </div>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">
            {course.title.toUpperCase()}
          </h3>
          <div className="text-white">
            {getBannerIcon(course)}
          </div>
        </div>
      </div>

      {/* Course Details */}
      <div className="p-4">
        {/* Rating */}
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
            {course.rating && course.rating > 0 
              ? `${course.rating.toFixed(1)} (${course.reviewCount || 0} ${(course.reviewCount || 0) === 1 ? 'review' : 'reviews'})` 
              : (course.reviewCount && course.reviewCount > 0)
              ? `(${course.reviewCount} ${course.reviewCount === 1 ? 'review' : 'reviews'})`
              : `(${course.reviewCount || 0} reviews)`}
          </span>
        </div>

    
        {/* Course Title */}
        <h4 className="text-lg font-semibold text-gray-900 mb-3">
          {course.title} | A Level Physics | 9702
        </h4>

        {/* Duration and Lessons */}
        <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4" />
            <span>{course.lessonCount || 0}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{formatDuration(course.duration || 0)}</span>
          </div>
        </div>

        {/* Instructor */}
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
            <User className="w-3 h-3 text-white" />
          </div>
          <span className="text-sm text-gray-600">
            By {course.instructor?.name || 'talhaahmed'} In {course.category || 'A2 Level'}
          </span>
        </div>

        {/* Pricing */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            {course.discountPercentage > 0 && (
              <span className="text-sm text-gray-500 line-through">
                Rs {course.price?.toLocaleString()}
              </span>
            )}
            <span className="text-lg font-bold text-gray-900">
              Rs {course.finalPrice.toLocaleString()}
            </span>
          </div>
        </div>

        {/* View Details Button */}
        {showViewDetails && (
          <Link href={`/course/${course._id}`}>
            <Button className="w-full flex items-center justify-center space-x-2 text-blue-600 border border-blue-200 hover:bg-blue-50">
              <Eye className="w-4 h-4" />
              <span>View Details</span>
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
