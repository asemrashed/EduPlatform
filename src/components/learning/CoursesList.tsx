'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LuClock as Clock, LuStar as Star, LuPlay as PlayCircle, LuCheck as CheckCircle, LuUsers as Users, LuBookOpen as BookOpen, LuAward as Award, LuTrendingUp as TrendingUp, LuCalendar as Calendar, LuUser as User } from 'react-icons/lu';;
import { Course } from '@/types/course';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEnrollments } from '@/hooks/useEnrollments';
import Link from 'next/link';
import { htmlToPlainText } from '@/lib/utils';

interface CoursesListProps {
  courses: Course[];
}

export default function CoursesList({ courses }: CoursesListProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { enrollStudent } = useEnrollments();
  const [enrolling, setEnrolling] = useState<string | null>(null);

  const handleEnrollCourse = async (courseId: string) => {
    if (!session?.user) {
      router.push('/login');
      return;
    }

    const userId = session?.user?.id;
    if (!userId) {
      router.push('/login');
      return;
    }

    try {
      setEnrolling(courseId);
      await enrollStudent(userId, courseId);
      router.push('/student/courses');
    } catch (error) {
      console.error('Error enrolling in course:', error);
    } finally {
      setEnrolling(null);
    }
  };

  const formatPrice = (price: number, isPaid: boolean) => {
    if (!isPaid) return 'Free';
    return `$${price}`;
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'Self-paced';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Recently updated';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getDifficultyColor = (level?: string) => {
    switch (level?.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (courses.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <PlayCircle className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses available</h3>
        <p className="text-gray-600">Check back later for new courses!</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {courses.map((course) => (
        <Card key={course._id} className="group hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-blue-300 overflow-hidden">
          <Link href={`/course/${course._id}`} className="block">
            <div className="relative cursor-pointer">
              {course.thumbnailUrl ? (
                <img
                  src={course.thumbnailUrl}
                  alt={course.title}
                  className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-56 bg-gradient-to-br from-blue-100 via-purple-100 to-indigo-100 flex items-center justify-center group-hover:from-blue-200 group-hover:via-purple-200 group-hover:to-indigo-200 transition-all duration-300">
                  <PlayCircle className="w-16 h-16 text-blue-400 group-hover:text-blue-500 transition-colors" />
                </div>
              )}
            
            {/* Overlay badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              <Badge 
                variant={course.isPaid ? "default" : "secondary"}
                className={`${course.isPaid ? "bg-green-100 text-green-800 border-green-200" : "bg-blue-100 text-blue-800 border-blue-200"} shadow-sm`}
              >
                {course.isPaid ? 'Premium' : 'Free'}
              </Badge>
              {course.difficulty && (
                <Badge 
                  variant="outline" 
                  className={`${getDifficultyColor(course.difficulty)} border-current shadow-sm`}
                >
                  {course.difficulty}
                </Badge>
              )}
            </div>
            
            <div className="absolute top-4 right-4">
              <div className="flex items-center space-x-1 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 shadow-sm">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm font-medium text-gray-700">4.8</span>
              </div>
            </div>
            </div>
          </Link>
          
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between mb-2">
              <Link href={`/course/${course._id}`} className="block">
                <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 cursor-pointer hover:text-blue-600">
                  {course.title}
                </CardTitle>
              </Link>
            </div>
            <CardDescription className="text-gray-600 line-clamp-3 leading-relaxed">
              {htmlToPlainText(course.description)}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Course stats */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2 text-gray-600">
                <Clock className="w-4 h-4 text-blue-500" />
                <span>{formatDuration(course.duration)}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <BookOpen className="w-4 h-4 text-green-500" />
                <span>{course.lessonCount || 0} lessons</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Users className="w-4 h-4 text-purple-500" />
                <span>{course.enrollmentCount || 0} students</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Calendar className="w-4 h-4 text-orange-500" />
                <span>{formatDate(course.updatedAt)}</span>
              </div>
            </div>

            {/* Instructor information */}
            {course.instructor && (
              <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                <User className="w-4 h-4 text-indigo-500" />
                <div className="flex-1">
                  <span className="text-gray-500">Instructor:</span>
                  <span className="ml-1 font-medium text-gray-900">
                    {typeof course.instructor === 'string' 
                      ? 'Instructor' 
                      : `${(course.instructor as any).firstName} ${(course.instructor as any).lastName}`
                    }
                  </span>
                </div>
              </div>
            )}
            
            {/* Category and tags */}
            <div className="flex flex-wrap gap-2">
              {course.categoryInfo && (
                <Badge variant="outline" className="text-xs">
                  {course.categoryInfo.name}
                </Badge>
              )}
              {course.tags && course.tags.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {course.tags[0]}
                </Badge>
              )}
            </div>

            {/* Course features */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Award className="w-4 h-4 text-yellow-500" />
                <span>Certificate of Completion</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span>Lifetime Access</span>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="pt-4 border-t border-gray-100">
            <div className="w-full space-y-4">
              {/* Price section */}
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-gray-900">
                  {formatPrice(course.finalPrice, course.isPaid)}
                </div>
                {course.originalPrice && course.originalPrice > course.finalPrice && (
                  <div className="text-sm text-gray-500 line-through">
                    ${course.originalPrice}
                  </div>
                )}
              </div>
              
              {/* Action buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={() => router.push(`/course/${course._id}`)}
                  variant="outline"
                  className="flex-1 border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400"
                >
                  <PlayCircle className="w-4 h-4 mr-2" />
                  Preview
                </Button>
                <Button
                  onClick={() => handleEnrollCourse(course._id)}
                  disabled={enrolling === course._id}
                  className="flex-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 hover:from-blue-600 hover:via-purple-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {enrolling === course._id ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Enrolling...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {session?.user ? 'Enroll Now' : 'Get Started'}
                    </>
                  )}
                </Button>
              </div>
              
              {/* Additional info */}
              <div className="text-center text-xs text-gray-500">
                {session?.user ? 'Start learning immediately' : 'Sign up to get started'}
              </div>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
