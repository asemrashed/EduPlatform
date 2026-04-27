'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import StudentDashboardLayout from '@/components/StudentDashboardLayout';
import PageSection from '@/components/PageSection';
import PageGrid from '@/components/PageGrid';
import ContentArea from '@/components/ContentArea';
import WelcomeSection from '@/components/WelcomeSection';
import StudentKPICards from '@/components/StudentKPICards';
import StudentActivities from '@/components/StudentActivities';
import StudentProgressChart from '@/components/StudentProgressChart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DataTable, { Column, Action } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LuBookOpen as BookOpen, LuClock as Clock, LuAward as Award, LuTrendingUp as TrendingUp, LuCalendar as Calendar, LuPlay as PlayCircle, LuCheck as CheckCircle, LuStar as Star, LuTarget as Target, LuUsers as Users, LuFileText as LuFileText, LuChartBar } from 'react-icons/lu';;

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
}

interface Enrollment {
  _id: string;
  course: Course;
  enrolledAt: string;
  status: 'active' | 'completed' | 'dropped' | 'suspended';
  progress: number;
  lastAccessedAt: string;
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'failed';
}

interface CourseProgress {
  _id: string;
  course: string;
  isCompleted: boolean;
  completedAt?: string;
  progressPercentage: number;
  totalLessons: number;
  completedLessons: number;
  totalTimeSpent: number;
  lastAccessedAt: string;
  startedAt: string;
}

interface StudentStats {
  totalEnrollments: number;
  activeCourses: number;
  completedCourses: number;
  totalTimeSpent: number;
  averageProgress: number;
  recentActivity: Array<{
    type: 'enrollment' | 'completion' | 'progress';
    course: string;
    timestamp: string;
    description: string;
  }>;
}

export default function StudentDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [courseProgress, setCourseProgress] = useState<CourseProgress[]>([]);
  const [stats, setStats] = useState<StudentStats>({
    totalEnrollments: 0,
    activeCourses: 0,
    completedCourses: 0,
    totalTimeSpent: 0,
    averageProgress: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    
    fetchStudentData();
  }, [session, status, router]);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      
      // Fetch enrollments (use same endpoint as courses page to get courseLuInfo populated)
      const enrollmentsQuery = new URLSearchParams({
        page: '1',
        limit: '50',
        student: session?.user?.id || ''
      });
      const enrollmentsResponse = await fetch(`/api/enrollments?${enrollmentsQuery.toString()}`);
      
      if (enrollmentsResponse.ok) {
        const enrollmentsData = await enrollmentsResponse.json();
        const data = enrollmentsData.data || enrollmentsData;
        const rawEnrollments = data.enrollments || [];
        const allowedStatuses = new Set(['active', 'completed', 'enrolled', 'in_progress']);
        const filtered = rawEnrollments.filter((en: any) => {
          const status = (en?.status || '').toString().toLowerCase();
          return allowedStatuses.has(status);
        });
        setEnrollments(filtered.length ? filtered : rawEnrollments);
      }

      // Fetch course progress
      const progressResponse = await fetch('/api/progress', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (progressResponse.ok) {
        const progressData = await progressResponse.json();
        setCourseProgress(progressData.progress || []);
      }

      // Stats will be recalculated when state updates below useEffect
    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Recalculate stats whenever enrollments or courseProgress change
  useEffect(() => {
    calculateStats();
  }, [enrollments, courseProgress]);

  const calculateStats = () => {
    const activeEnrollments = enrollments.filter(e => e.status === 'active');
    const completedEnrollments = enrollments.filter(e => e.status === 'completed');
    const totalTime = courseProgress.reduce((sum, cp) => sum + cp.totalTimeSpent, 0);
    const avgProgress = enrollments.length > 0 
      ? enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length 
      : 0;

    setStats({
      totalEnrollments: enrollments.length,
      activeCourses: activeEnrollments.length,
      completedCourses: completedEnrollments.length,
      totalTimeSpent: totalTime,
      averageProgress: Math.round(avgProgress),
      recentActivity: generateRecentActivity()
    });
  };

  const generateRecentActivity = () => {
    const activities: Array<{
      type: 'enrollment' | 'completion' | 'progress';
      course: string;
      timestamp: string;
      description: string;
    }> = [];
    
    // Add recent enrollments
    enrollments
      .sort((a, b) => new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime())
      .slice(0, 3)
      .forEach(enrollment => {
        activities.push({
          type: 'enrollment' as const,
          course: enrollment.course.title,
          timestamp: enrollment.enrolledAt,
          description: `Enrolled in ${enrollment.course.title}`
        });
      });

    // Add recent completions
    courseProgress
      .filter(cp => cp.isCompleted)
      .sort((a, b) => new Date(b.completedAt || '').getTime() - new Date(a.completedAt || '').getTime())
      .slice(0, 2)
      .forEach(progress => {
        const course = enrollments.find(e => e.course._id === progress.course);
        if (course) {
          activities.push({
            type: 'completion' as const,
            course: course.course.title,
            timestamp: progress.completedAt || '',
            description: `Completed ${course.course.title}`
          });
        }
      });

    return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5);
  };

  const formatTimeSpent = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'dropped': return 'bg-red-100 text-red-800';
      case 'suspended': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Dynamic Learning Goals derived from stats
  const goals = [
    {
      key: 'courses',
      title: `Complete ${Math.max(5, stats.totalEnrollments || 5)} Courses`,
      current: stats.completedCourses,
      target: Math.max(5, stats.totalEnrollments || 5),
      percent: stats.totalEnrollments || 0 ? Math.min((stats.completedCourses / Math.max(5, stats.totalEnrollments || 5)) * 100, 100) : 0,
      cardClass: 'from-green-50 to-emerald-50 border-green-200',
      titleClass: 'text-green-900',
      iconWrapClass: 'bg-green-100',
      iconClass: 'text-green-600',
      barBgClass: 'bg-green-200',
      barFillClass: 'from-green-500 to-emerald-500',
      leftValue: `${stats.completedCourses}/${Math.max(5, stats.totalEnrollments || 5)}`,
      Icon: CheckCircle
    },
    {
      key: 'time',
      title: 'Study 20 Hours',
      current: stats.totalTimeSpent,
      target: 1200, // minutes
      percent: Math.min(((stats.totalTimeSpent || 0) / 1200) * 100, 100),
      cardClass: 'from-blue-50 to-cyan-50 border-blue-200',
      titleClass: 'text-blue-900',
      iconWrapClass: 'bg-blue-100',
      iconClass: 'text-blue-600',
      barBgClass: 'bg-blue-200',
      barFillClass: 'from-blue-500 to-cyan-500',
      leftValue: formatTimeSpent(stats.totalTimeSpent || 0),
      Icon: Clock
    },
    {
      key: 'average',
      title: 'Maintain 80% Average',
      current: stats.averageProgress,
      target: 80,
      percent: Math.min(((stats.averageProgress || 0) / 80) * 100, 100),
      cardClass: 'from-purple-50 to-pink-50 border-purple-200',
      titleClass: 'text-purple-900',
      iconWrapClass: 'bg-purple-100',
      iconClass: 'text-purple-600',
      barBgClass: 'bg-purple-200',
      barFillClass: 'from-purple-500 to-pink-500',
      leftValue: `${stats.averageProgress}%`,
      Icon: TrendingUp
    }
  ];

  if (loading) {
    return (
      <StudentDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </StudentDashboardLayout>
    );
  }

  return (
    <StudentDashboardLayout>
      <main className="relative z-10 p-2 sm:p-4">
        {/* Welcome Section */}
        <WelcomeSection 
          title={`Welcome back, ${session?.user?.name || 'Student'}! 👋`}
          description="Here's your learning progress and upcoming activities"
        />

        {/* Main Content Grid */}
        <PageGrid 
          columns={3} 
          gap="md"
        >
          {/* Left Column - KPI Cards and Charts */}
          <div className="xl:col-span-2 flex flex-col space-y-2 sm:space-y-4 min-h-0">
            <PageSection 
              title="Learning Overview"
              className="flex-shrink-0"
            >
              <StudentKPICards 
                totalEnrollments={stats.totalEnrollments}
                activeCourses={stats.activeCourses}
                completedCourses={stats.completedCourses}
                totalTimeSpent={stats.totalTimeSpent}
                averageProgress={stats.averageProgress}
              />
            </PageSection>
            
            <PageSection 
              title="Progress Analytics"
              className="flex-1"
            >
              <StudentProgressChart enrollments={enrollments} />
            </PageSection>
          </div>
          
          {/* Right Column - Activities and Quick Actions */}
          <div className="flex flex-col space-y-2 sm:space-y-4 min-h-0">
            <PageSection 
              title="Recent Activity"
              className="flex-shrink-0"
            >
              <StudentActivities activities={stats.recentActivity} />
            </PageSection>
            
            <PageSection 
              title="Quick Actions"
              className="flex-1"
            >
              <div className="grid grid-cols-1 gap-2">
                <Button 
                  variant="ghost"
                  className="w-full justify-start gap-2 border border-blue-300 text-blue-700 hover:border-blue-500 focus:ring-2 focus:ring-blue-200 cursor-pointer"
                  onClick={() => router.push('/student/courses')}
                  aria-label="Browse Courses"
                >
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-md">
                    <BookOpen className="h-4 w-4" />
                  </span>
                  <span>Browse Courses</span>
                </Button>
                <Button 
                  variant="ghost"
                  className="w-full justify-start gap-2 border border-emerald-300 text-emerald-700 hover:border-emerald-500 focus:ring-2 focus:ring-emerald-200 cursor-pointer"
                  onClick={() => router.push('/student/profile')}
                  aria-label="View Profile"
                >
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-md">
                    <Users className="h-4 w-4" />
                  </span>
                  <span>View Profile</span>
                </Button>
                <Button 
                  variant="ghost"
                  className="w-full justify-start gap-2 border border-orange-300 text-orange-700 hover:border-orange-500 focus:ring-2 focus:ring-orange-200 cursor-pointer"
                  onClick={() => router.push('/student/assignments')}
                  aria-label="Assignments"
                >
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-md">
                    <LuFileText className="h-4 w-4" />
                  </span>
                  <span>Assignments</span>
                </Button>
                <Button 
                  variant="ghost"
                  className="w-full justify-start gap-2 border border-yellow-300 text-yellow-700 hover:border-yellow-500 focus:ring-2 focus:ring-yellow-200 cursor-pointer"
                  onClick={() => router.push('/student/reviews')}
                  aria-label="Reviews"
                >
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-md">
                    <Star className="h-4 w-4" />
                  </span>
                  <span>Reviews</span>
                </Button>
              </div>
            </PageSection>
          </div>
        </PageGrid>
        
        {/* Bottom Section - My Courses */}
        <PageSection 
          title="My Courses"
          description="Your enrolled courses and progress"
          className="mt-2"
        >
          {enrollments.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No courses yet</h3>
              <p className="text-gray-600 mb-4">Start your learning journey by enrolling in a course.</p>
              <Button onClick={() => router.push('/student/courses')}>
                Browse Courses
              </Button>
            </div>
          ) : (
            <DataTable
              data={enrollments}
              variant="table"
              columns={[
                { key: 'course', label: 'Course', width: 'w-2/5', render: (e: Enrollment) => {
                  const fallback = (e as any)?.courseLuInfo && typeof (e as any).courseLuInfo === 'object' ? (e as any).courseLuInfo : {};
                  const c: any = (e && typeof e.course === 'object') ? e.course : fallback;
                  const courseId = c?._id || (typeof e.course === 'string' ? e.course : '');
                  const title = c?.title || 'Untitled Course';
                  const description = c?.description || 'No description available';
                  const categoryName = typeof c?.category === 'string' ? c?.category : (c?.category?.name || 'Uncategorized');
                  const thumbnailUrl = c?.thumbnailUrl || '';
                  return (
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <button
                          onClick={() => courseId && router.push(`/student/courses/${courseId}`)}
                          className="w-12 h-12 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center hover:from-blue-100 hover:to-purple-100 transition-all duration-200 cursor-pointer group overflow-hidden"
                          title="Continue Learning"
                        >
                          {thumbnailUrl ? (
                            <img 
                              src={thumbnailUrl} 
                              alt={title}
                              className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-200"
                            />
                          ) : (
                            <BookOpen className="h-6 w-6 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" />
                          )}
                        </button>
                      </div>
                      <div className="flex-1 min-w-0">
                        <button
                          onClick={() => courseId && router.push(`/student/courses/${courseId}`)}
                          className="text-left w-full hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors duration-200 group cursor-pointer"
                          title="Continue Learning"
                        >
                          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
                            {title}
                          </h3>
                          <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                            {description}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {categoryName}
                            </Badge>
                            <div className="flex items-center gap-1 text-xs text-yellow-600">
                              <Star className="h-3 w-3 fill-current" />
                              <span>{'4.5'}</span>
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>
                  );
                }},
                { key: 'instructor', label: 'Instructor', width: 'w-1/5', render: (e: Enrollment) => {
                  const fallback = (e as any)?.courseLuInfo && typeof (e as any).courseLuInfo === 'object' ? (e as any).courseLuInfo : {};
                  const c: any = (e && typeof e.course === 'object') ? e.course : fallback;
                  const firstName = c?.instructor?.firstName || 'Unknown';
                  const lastName = c?.instructor?.lastName || 'Instructor';
                  return (
                    <div className="text-sm text-gray-900">{`${firstName} ${lastName}`}</div>
                  );
                }},
                { key: 'status', label: 'Status', width: 'w-1/6', render: (e: Enrollment) => (
                  <Badge className={getStatusColor(e.status)}>{e.status}</Badge>
                )},
                { key: 'progress', label: 'Progress', width: 'w-1/6', render: (e: Enrollment) => (
                  <div className="flex items-center gap-2">
                    <div className="w-24"><Progress value={e.progress} className="h-2" /></div>
                    <span className="text-sm text-gray-700">{e.progress}%</span>
                  </div>
                )},
                { key: 'lastAccessedAt', label: 'Last Accessed', width: 'w-1/6', render: (e: Enrollment) => (
                  <span className="text-sm text-gray-700">{e.lastAccessedAt ? new Date(e.lastAccessedAt).toLocaleDateString() : 'Never'}</span>
                )}
                ,
                { key: 'actions', label: 'Actions', width: 'w-1/6', render: (e: Enrollment) => {
                  const fallback = (e as any)?.courseLuInfo && typeof (e as any).courseLuInfo === 'object' ? (e as any).courseLuInfo : {};
                  const c: any = (e && typeof (e as any).course === 'object') ? (e as any).course : fallback;
                  const courseId = c?._id || (typeof (e as any).course === 'string' ? (e as any).course : '');
                  return (
                    <div className="flex items-center">
                      <Button 
                        size="sm" 
                        onClick={() => courseId && router.push(`/student/courses/${courseId}`)}
                        className="gap-1 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm hover:from-indigo-600 hover:to-purple-600 focus:ring-2 focus:ring-blue-200 transition-colors rounded-md cursor-pointer"
                      >
                        <PlayCircle className="w-4 h-4" />
                        <span className="hidden sm:inline">Continue</span>
                        <span className="sm:hidden">Go</span>
                      </Button>
                    </div>
                  );
                }}
              ] as Column<Enrollment>[]}
              actions={[
                {
                  key: 'continue',
                  label: 'Continue Learning',
                  icon: <PlayCircle className="w-4 h-4" />,
                  onClick: (e: Enrollment) => {
                  const c = (e as any).course;
                  const id = typeof c === 'object' ? c?._id : c;
                  if (id) router.push(`/student/courses/${id}`);
                }
                }
              ] as Action<Enrollment>[]}
              getItemId={(e: Enrollment) => e._id}
            />
          )}
        </PageSection>

        {/* Learning Goals Section */}
        <PageSection 
          title="Learning Goals"
          description="Track your progress towards achieving your learning objectives"
          className="mt-2"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {goals.map((g) => (
              <div key={g.key} className={`p-4 bg-gradient-to-br ${g.cardClass} rounded-lg border`}>
                <h4 className={`font-semibold ${g.titleClass} mb-2 flex items-center gap-2`}>
                  <g.Icon className="h-4 w-4" />
                  {g.title}
                </h4>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-2xl font-bold ${g.titleClass}`}>{g.leftValue}</span>
                  <div className={`w-8 h-8 ${g.iconWrapClass} rounded-full flex items-center justify-center`}>
                    <g.Icon className={`h-4 w-4 ${g.iconClass}`} />
                  </div>
                </div>
                <div className={`w-full ${g.barBgClass} rounded-full h-2`}>
                  <div
                    className={`bg-gradient-to-r ${g.barFillClass} h-2 rounded-full transition-all duration-300`}
                    style={{ width: `${g.percent}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </PageSection>
      </main>
    </StudentDashboardLayout>
  );
}
