'use client';

import { useEffect, useState } from 'react';
import { useMockSession } from '@/lib/mockSession';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { StudentRoleShell } from '@/components/role-area/StudentRoleShell';
import PageSection from '@/components/PageSection';
import WelcomeSection from '@/components/WelcomeSection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import DataTable, { Column, Action } from '@/components/ui/data-table';
import { LuBookOpen as BookOpen, LuClock as Clock, LuUsers as Users, LuStar as Star, LuPlay as PlayCircle, LuCheck as CheckCircle, LuDollarSign as DollarSign, LuPlus as Plus, LuEye as Eye, LuArrowRight as ArrowRight } from 'react-icons/lu';

// Fallback when API doesn't return promotional banner
const DEFAULT_PROMO_HEADLINE = 'আরও কোর্স এক্সপ্লোর করুন';
const DEFAULT_PROMO_SUBTEXT = 'নতুন কোর্সে বিশেষ ছাড় পেতে এখনই দেখুন';
const DEFAULT_PROMO_LINK = '/#courses';
const DEFAULT_PROMO_CTA = 'দেখুন';

interface Course {
  _id: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  price: number;
  isPaid: boolean;
  category: {
    _id: string;
    name: string;
  };
  instructor: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
  enrolledCount?: number;
  rating?: number;
  duration?: number;
}

interface Enrollment {
  _id: string;
  student: string;
  course: string;
  enrolledAt: string;
  status: 'active' | 'completed' | 'dropped' | 'suspended';
  progress: number;
  lastAccessedAt?: string;
  completedAt?: string;
  droppedAt?: string;
  suspendedAt?: string;
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'failed';
  paymentAmount?: number;
  paymentMethod?: string;
  paymentId?: string;
  notes?: string;
  certificateIssued?: boolean;
  certificateIssuedAt?: string;
  certificateUrl?: string;
  createdAt: string;
  updatedAt: string;
  courseLuInfo?: Course;
}

export default function StudentCourses() {
  const { data: session, status } = useMockSession();
  const router = useRouter();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 12
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  });
  const [promoBanner, setPromoBanner] = useState<{
    enabled: boolean;
    imageUrl: string;
    link: string;
    headline: string;
    subtext: string;
    ctaLabel: string;
  } | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user?.id) return;

    fetchEnrollments();
  }, [status, session?.user?.id, filters.page, filters.limit]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/website-content', { cache: 'no-store' });
        if (!res.ok || cancelled) return;
        const json = await res.json();
        const data = json?.data;
        if (cancelled) return;
        if (data?.promotionalBanner != null) {
          setPromoBanner(data.promotionalBanner);
        }
      } catch {
        if (!cancelled) setPromoBanner(null);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      
      const queryParams = new URLSearchParams({
        page: filters.page.toString(),
        limit: filters.limit.toString(),
        student: session?.user?.id || ''
      });

      const response = await fetch(`/api/enrollments?${queryParams}`);
      
      if (response.ok) {
        const result = await response.json();
        const data = result.data || result; // Handle both wrapped and unwrapped responses
        // Filter enrollments on the client side to show only active and completed
        const filteredEnrollments = (data.enrollments || []).filter((enrollment: any) => 
          enrollment.status === 'active' || enrollment.status === 'completed'
        );
        setEnrollments(filteredEnrollments);
        setPagination(data.pagination || { page: 1, limit: 12, total: 0, pages: 0 });
      } else {
        console.error('API Error:', response.status, response.statusText);
        const errorData = await response.json();
        console.error('Error details:', errorData);
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleContinueCourse = (courseId: string) => {
    router.push(`/student/courses/${courseId}`);
  };

  const formatPrice = (price: number, isPaid: boolean) => {
    if (!isPaid) return 'Free';
    return `$${price}`;
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  // Define table columns
  const columns: Column<Enrollment>[] = [
    {
      key: 'course',
      label: 'Course',
      width: 'w-2/5',
      render: (enrollment) => {
        const course = enrollment.courseLuInfo;
        if (!course) return <span className="text-gray-500">Course not found</span>;
        
        return (
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <button
                onClick={() => handleContinueCourse(course._id)}
                className="w-32 h-32 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center hover:from-blue-100 hover:to-purple-100 transition-all duration-200 cursor-pointer group"
                title="Continue Learning"
              >
                {course.thumbnailUrl ? (
                  <img 
                    src={course.thumbnailUrl} 
                    alt={course.title}
                    className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-200"
                  />
                ) : (
                  <BookOpen className="h-12 w-12 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" />
                )}
              </button>
            </div>
            <div className="flex-1 min-w-0">
              <div className="w-full rounded-lg p-2 -m-2 transition-colors duration-200 group hover:bg-gray-50">
                <button
                  onClick={() => handleContinueCourse(course._id)}
                  className="text-left w-full"
                  title="Continue Learning"
                >
                  <h3 className="text-base font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200 mb-3">
                    {course.title}
                  </h3>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleContinueCourse(course._id)}
                    className="group/btn relative h-11 px-6 text-white font-bold transition-all duration-300 shadow-xl rounded-xl flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer overflow-hidden"
                    style={{
                      background: "linear-gradient(135deg, #10B981 0%, #059669 50%, #047857 100%)",
                      boxShadow: "0 8px 20px rgba(16, 185, 129, 0.4), 0 0 0 1px rgba(16, 185, 129, 0.1)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "linear-gradient(135deg, #059669 0%, #047857 50%, #065F46 100%)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "linear-gradient(135deg, #10B981 0%, #059669 50%, #047857 100%)";
                    }}
                  >
                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full"></span>
                    <span className="relative z-10 flex items-center gap-2">
                      <PlayCircle className="h-4 w-4" />
                      <span>Continue Learning</span>
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      }
    },
    {
      key: 'progress',
      label: 'Progress',
      width: 'w-1/5',
      render: (enrollment) => (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium">{enrollment.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${enrollment.progress}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-500">
            {enrollment.status === 'completed' ? 'Completed' : 'In Progress'}
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      width: 'w-1/6',
      render: (enrollment) => (
        <Badge 
          variant={enrollment.status === 'completed' ? 'default' : 'outline'} 
          className={`text-xs ${
            enrollment.status === 'completed' 
              ? 'bg-green-100 text-green-800 border-green-200' 
              : 'bg-blue-100 text-blue-800 border-blue-200'
          }`}
        >
          {enrollment.status === 'completed' ? 'Completed' : 'In Progress'}
        </Badge>
      )
    },
    {
      key: 'certificate',
      label: 'Certificate',
      width: 'w-1/6',
      render: (enrollment) => (
        <div className="text-sm">
          {enrollment.certificateUrl ? (
            <Button
              size="sm"
              variant="outline"
              className="h-8 px-3"
              onClick={() => window.open(enrollment.certificateUrl as string, '_blank')}
            >
              Certificate
            </Button>
          ) : (
            <span className="text-gray-500">Not available</span>
          )}
        </div>
      )
    },
    {
      key: 'enrolledAt',
      label: 'Enrolled',
      width: 'w-1/6',
      render: (enrollment) => (
        <div className="text-sm text-gray-900">
          {new Date(enrollment.enrolledAt).toLocaleDateString()}
        </div>
      )
    },
    {
      key: 'lastAccessed',
      label: 'Last Accessed',
      width: 'w-1/6',
      render: (enrollment) => (
        <div className="text-sm text-gray-900">
          {enrollment.lastAccessedAt 
            ? new Date(enrollment.lastAccessedAt).toLocaleDateString()
            : 'Never'
          }
        </div>
      )
    }
  ];

  // Define table actions
  const actions: Action<Enrollment>[] = [
    {
      key: 'continue',
      label: 'Continue Learning',
      icon: <PlayCircle className="w-4 h-4" />,
      onClick: (enrollment: Enrollment) => {
        const course = enrollment.courseLuInfo;
        if (course) {
          handleContinueCourse(course._id);
        }
      },
      variant: 'default' as const
    },
    {
      key: 'view',
      label: 'View Details',
      icon: <Eye className="w-4 h-4" />,
      onClick: (enrollment: Enrollment) => {
        const course = enrollment.courseLuInfo;
        if (course) {
          router.push(`/student/courses/${course._id}`);
        }
      },
      variant: 'secondary' as const
    }
  ];

  if (loading) {
    return (
      <StudentRoleShell>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </StudentRoleShell>
    );
  }

  return (
    <StudentRoleShell>
      <main className="relative z-10 p-2 sm:p-4">
        {/* Welcome Section */}
        <WelcomeSection 
          title="My Courses 📚"
          description="Continue your learning journey with your purchased courses"
        />

        {/* Promotional Image Banner (from website content) */}
        {promoBanner?.enabled !== false && (() => {
          const bannerImageUrl = promoBanner?.imageUrl ?? '';
          const headline = promoBanner?.headline ?? DEFAULT_PROMO_HEADLINE;
          const subtext = promoBanner?.subtext ?? DEFAULT_PROMO_SUBTEXT;
          const ctaLabel = promoBanner?.ctaLabel ?? DEFAULT_PROMO_CTA;
          const link = promoBanner?.link ?? DEFAULT_PROMO_LINK;
          return (
            <section className="mb-4 sm:mb-6">
              <Link
                href={link}
                className="block w-full overflow-hidden rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label="View promotional offer"
              >
                {bannerImageUrl ? (
                  <div className="relative w-full aspect-[4/1] min-h-[72px] sm:min-h-[88px] bg-gray-100">
                    {bannerImageUrl.startsWith('http') ? (
                      <img
                        src={bannerImageUrl}
                        alt="Promotional banner"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <Image
                        src={bannerImageUrl}
                        alt="Promotional banner"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 1200px"
                        priority
                      />
                    )}
                    <div className="absolute inset-0 bg-black/20 flex flex-col items-center justify-center text-center px-4 sm:px-6">
                      <span className="text-white font-bold text-lg sm:text-xl md:text-2xl drop-shadow-md">{headline}</span>
                      <span className="text-white/90 text-sm sm:text-base mt-1 drop-shadow">{subtext}</span>
                      <span className="mt-3 inline-flex items-center gap-2 text-white font-medium text-sm sm:text-base bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                        {ctaLabel} <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                ) : (
                  <div
                    className="w-full aspect-[4/1] min-h-[72px] sm:min-h-[88px] flex flex-col items-center justify-center text-center px-4 sm:px-6 rounded-xl sm:rounded-2xl"
                    style={{
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 40%, #a855f7 70%, #7c3aed 100%)',
                      boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
                    }}
                  >
                    <span className="text-white font-bold text-lg sm:text-xl md:text-2xl drop-shadow-md">{headline}</span>
                    <span className="text-white/90 text-sm sm:text-base mt-1 drop-shadow">{subtext}</span>
                    <span className="mt-3 inline-flex items-center gap-2 text-white font-medium text-sm sm:text-base bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg hover:bg-white/30 transition-colors">
                      {ctaLabel} <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                )}
              </Link>
            </section>
          );
        })()}

        {/* Course Statistics */}
        <PageSection 
          title="My Learning Statistics"
          className="mb-2 sm:mb-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500 rounded-full">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-900">{pagination.total}</p>
                    <p className="text-blue-700">Purchased Courses</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-500 rounded-full">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-900">
                      {enrollments.filter(e => e.status === 'completed').length}
                    </p>
                    <p className="text-green-700">Completed Courses</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-500 rounded-full">
                    <Star className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-900">
                      {enrollments.length > 0 
                        ? Math.round(enrollments.reduce((acc, e) => acc + e.progress, 0) / enrollments.length)
                        : 0}%
                    </p>
                    <p className="text-purple-700">Average Progress</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </PageSection>

        {/* Courses Table */}
        <PageSection 
          title="My Purchased Courses"
          description="Continue learning with your enrolled courses"
          className="mb-2 sm:mb-4"
        >
          <div className="mt-4 space-y-3 md:hidden">
            {enrollments.length === 0 ? (
              <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
                <BookOpen className="mx-auto h-10 w-10 text-gray-400" />
                <p className="mt-3 text-sm font-medium text-gray-700">No purchased courses yet</p>
                <p className="mt-1 text-xs text-gray-500">Purchase some courses to start your learning journey.</p>
              </div>
            ) : (
              enrollments.map((enrollment) => {
                const course = enrollment.courseLuInfo;
                if (!course) return null;

                return (
                  <div key={enrollment._id} className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
                    <button
                      onClick={() => handleContinueCourse(course._id)}
                      className="flex w-full items-start gap-3 text-left"
                    >
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                        {course.thumbnailUrl ? (
                          <img src={course.thumbnailUrl} alt={course.title} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <BookOpen className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="line-clamp-2 text-sm font-semibold text-gray-900">{course.title}</h3>
                        <p className="mt-1 text-xs text-gray-500">
                          {course.category?.name || 'General'} • {formatDuration(course.duration)}
                        </p>
                      </div>
                    </button>

                    <div className="mt-3">
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium text-gray-800">{enrollment.progress}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-200">
                        <div
                          className="h-2 rounded-full bg-green-600 transition-all duration-300"
                          style={{ width: `${enrollment.progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-2">
                      <Badge
                        variant={enrollment.status === 'completed' ? 'default' : 'outline'}
                        className={enrollment.status === 'completed'
                          ? 'bg-green-100 text-green-800 border-green-200'
                          : 'bg-blue-100 text-blue-800 border-blue-200'}
                      >
                        {enrollment.status === 'completed' ? 'Completed' : 'In Progress'}
                      </Badge>
                      {enrollment.certificateUrl ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-2 text-xs"
                          onClick={() => window.open(enrollment.certificateUrl as string, '_blank')}
                        >
                          Certificate
                        </Button>
                      ) : (
                        <span className="text-xs text-gray-500">No certificate</span>
                      )}
                    </div>

                    <Button
                      onClick={() => handleContinueCourse(course._id)}
                      className="mt-3 h-10 w-full"
                    >
                      <PlayCircle className="mr-2 h-4 w-4" />
                      Continue Learning
                    </Button>
                  </div>
                );
              })
            )}

            {pagination.pages > 1 && (
              <div className="flex items-center justify-between gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
                  className="h-9 px-3"
                >
                  Previous
                </Button>
                <span className="text-xs text-gray-600">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => handlePageChange(Math.min(pagination.pages, pagination.page + 1))}
                  className="h-9 px-3"
                >
                  Next
                </Button>
              </div>
            )}
          </div>

          <div className="hidden md:block">
            <DataTable
              data={enrollments}
              columns={columns}
              actions={actions}
              loading={loading}
              variant="table"
              pagination={{
                page: pagination.page,
                limit: pagination.limit,
                total: pagination.total,
                pages: pagination.pages,
                onPageChange: handlePageChange
              }}
              emptyState={{
                title: 'No purchased courses yet',
                description: 'Purchase some courses to start your learning journey.',
                icon: <BookOpen className="h-12 w-12 text-gray-400" />
              }}
              className="mt-4"
            />
          </div>
        </PageSection>

      </main>
    </StudentRoleShell>
  );
}
