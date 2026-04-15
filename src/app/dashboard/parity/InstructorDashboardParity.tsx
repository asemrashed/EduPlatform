"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageSection from "@/components/dashboard/lp/PageSection";
import PageGrid from "@/components/dashboard/lp/PageGrid";
import WelcomeSection from "@/components/dashboard/lp/WelcomeSection";
import TeacherKPICards from "@/components/dashboard/lp/TeacherKPICards";
import TeacherActivities from "@/components/dashboard/lp/TeacherActivities";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LuBookOpen as BookOpen,
  LuUsers as Users,
  LuAward as Award,
  LuStar as Star,
  LuMessageSquare as MessageSquare,
  LuPlus as Plus,
  LuPlay as PlayCircle,
  LuCheck as CheckCircle,
} from "react-icons/lu";
import { htmlToPlainText } from "@/lib/utils";
import type { InstructorDashboardApiPayload } from "@/types/dashboard";

function formatDashDate(iso: string | undefined): string {
  if (iso == null || iso === "") return "N/A";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Invalid date";
  return d.toLocaleDateString();
}

interface Course {
  _id: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  category: {
    _id: string;
    name: string;
  };
  studentCount: number;
  averageRating: number;
  totalLessons: number;
  createdAt: string;
  status: 'draft' | 'published' | 'archived';
}

interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  enrolledCourses: number;
  lastActive: string;
}

interface TeacherStats {
  totalCourses: number;
  totalStudents: number;
  totalAssignments: number;
  averageRating: number;
  totalHours: number;
  unreadMessages: number;
  recentActivity: Array<{
    type: 'course' | 'student' | 'assignment' | 'message' | 'rating' | 'schedule';
    title: string;
    description: string;
    timestamp: string;
    status?: 'completed' | 'pending' | 'urgent';
  }>;
}

export interface InstructorDashboardParityProps {
  userName: string;
  loading: boolean;
  apiData: InstructorDashboardApiPayload | null;
}

export function InstructorDashboardParity({
  userName,
  loading,
  apiData,
}: InstructorDashboardParityProps) {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState<TeacherStats>({
    totalCourses: 0,
    totalStudents: 0,
    totalAssignments: 0,
    averageRating: 0,
    totalHours: 0,
    unreadMessages: 0,
    recentActivity: [],
  });

  useEffect(() => {
    if (!apiData) return;
    const data = apiData;

    const titleToCount = new Map<string, number>();
    data.recentEnrollments.forEach((e) => {
      titleToCount.set(
        e.courseTitle,
        (titleToCount.get(e.courseTitle) ?? 0) + 1,
      );
    });

    const coursesFromMock: Course[] = [...titleToCount.keys()].map(
      (title, i) => {
        const first = data.recentEnrollments.find(
          (en) => en.courseTitle === title,
        );
        return {
          _id: `mock-course-${i}`,
          title,
          description: `${title} — activity from recent enrollments.`,
          category: { _id: "cat-mock", name: "Teaching" },
          studentCount: titleToCount.get(title) ?? 0,
          averageRating: 4.5,
          totalLessons: 24,
          createdAt: first?.enrolledAt ?? new Date().toISOString(),
          status: "published" as const,
        };
      },
    );

    const studentsFromMock: Student[] = data.recentEnrollments.map((e) => {
      const parts = e.studentName.trim().split(/\s+/);
      const firstName = parts[0] ?? "Student";
      const lastName = parts.length > 1 ? parts.slice(1).join(" ") : "";
      return {
        _id: e.id,
        firstName,
        lastName,
        email: e.studentEmail,
        enrolledCourses: 1,
        lastActive: e.enrolledAt,
      };
    });

    setStats({
      totalCourses: data.overview.totalCourses,
      totalStudents: data.overview.totalStudents,
      totalAssignments: 0,
      averageRating: 4.5,
      totalHours: 0,
      unreadMessages: 0,
      recentActivity: data.recentEnrollments.map((e) => ({
        type: "student" as const,
        title: `New enrollment: ${e.studentName}`,
        description: `Joined ${e.courseTitle}`,
        timestamp: e.enrolledAt,
        status: "completed",
      })),
    });
    setCourses(coursesFromMock);
    setStudents(studentsFromMock);
  }, [apiData]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <main className="relative z-10 p-2 sm:p-4">
        {/* Welcome Section */}
        <WelcomeSection 
          title={`Welcome back, ${userName || "Teacher"}! 👨‍🏫`}
          description="Here's your teaching overview and recent activities"
        />

        {/* Main Content Grid */}
        <PageGrid 
          columns={3} 
          gap="md"
        >
          {/* Left Column - KPI Cards and Charts */}
          <div className="xl:col-span-2 flex flex-col space-y-2 sm:space-y-4 min-h-0">
            <PageSection 
              title="Teaching Overview"
              className="flex-shrink-0"
            >
              <TeacherKPICards 
                totalCourses={stats.totalCourses}
                totalStudents={stats.totalStudents}
                totalAssignments={stats.totalAssignments}
                averageRating={stats.averageRating}
                totalHours={stats.totalHours}
                unreadMessages={stats.unreadMessages}
              />
            </PageSection>
            
            <PageSection 
              title="My Courses"
              className="flex-1"
            >
              {courses.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No courses yet</h3>
                  <p className="text-gray-600 mb-4">Start your teaching journey by creating your first course.</p>
                  <Button onClick={() => router.push('/instructor/courses/builder')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Course
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {courses.slice(0, 4).map((course) => (
                    <Card key={course._id} className="hover:shadow-lg transition-shadow duration-200">
                      <CardHeader className="pb-3">
                        <div className="aspect-video bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg mb-4 flex items-center justify-center">
                          {course.thumbnailUrl ? (
                            <img 
                              src={course.thumbnailUrl} 
                              alt={course.title}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <BookOpen className="h-12 w-12 text-gray-400" />
                          )}
                        </div>
                        <div className="flex items-start justify-between mb-2">
                          <Badge className={getStatusColor(course.status)}>
                            {course.status}
                          </Badge>
                          <div className="flex items-center gap-1 text-sm text-yellow-600">
                            <Star className="h-4 w-4 fill-current" />
                            <span>{course.averageRating.toFixed(1)}</span>
                          </div>
                        </div>
                        <CardTitle className="text-lg line-clamp-2">
                          {course.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-2">
                          {htmlToPlainText(course.description)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <span>{course.category?.name ?? "N/A"}</span>
                            <span>{course.studentCount} students</span>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <span>{course.totalLessons} lessons</span>
                            <span>Created {formatDashDate(course.createdAt)}</span>
                          </div>
                          
                          <Button 
                            className="w-full"
                            onClick={() => router.push(`/instructor/courses/${course._id}`)}
                          >
                            <PlayCircle className="h-4 w-4 mr-2" />
                            Manage Course
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </PageSection>
          </div>
          
          {/* Right Column - Activities and Quick Actions */}
          <div className="flex flex-col space-y-2 sm:space-y-4 min-h-0">
            <PageSection 
              title="Recent Activity"
              className="flex-shrink-0"
            >
              <TeacherActivities activities={stats.recentActivity} />
            </PageSection>
            
            <PageSection 
              title="Quick Actions"
              className="flex-1"
            >
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push('/instructor/courses/builder')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Course
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push('/instructor/students')}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Manage Students
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push('/instructor/assignments')}
                >
                  <Award className="h-4 w-4 mr-2" />
                  Create Assignment
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push('/instructor/messages')}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  View Messages
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push('/instructor/reviews')}
                >
                  <Star className="h-4 w-4 mr-2" />
                  Course Reviews
                </Button>
              </div>
            </PageSection>
          </div>
        </PageGrid>
        
        {/* Bottom Section - Recent Students */}
        <PageSection 
          title="Recent Students"
          description="Latest students enrolled in your courses"
          className="mt-2"
        >
          {students.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No students yet</h3>
              <p className="text-gray-600">Students will appear here once they enroll in your courses.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {students.slice(0, 6).map((student) => (
                <Card key={student._id} className="hover:shadow-lg transition-shadow duration-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                        {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {student.firstName} {student.lastName}
                        </h3>
                        <p className="text-sm text-gray-600">{student.email}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>{student.enrolledCourses} courses</span>
                          <span>Last active: {formatDashDate(student.lastActive)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </PageSection>

        {/* Teaching Goals Section */}
        <PageSection 
          title="Teaching Goals"
          description="Track your progress towards achieving your teaching objectives"
          className="mt-2"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Create 10 Courses
              </h4>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold text-green-900">{stats.totalCourses}/10</span>
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
              </div>
              <div className="w-full bg-green-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((stats.totalCourses / 10) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Teach 100 Students
              </h4>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold text-blue-900">{stats.totalStudents}/100</span>
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((stats.totalStudents / 100) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                <Star className="h-4 w-4" />
                Maintain 4.5+ Rating
              </h4>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold text-purple-900">{stats.averageRating.toFixed(1)}/4.5</span>
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Star className="h-4 w-4 text-purple-600" />
                </div>
              </div>
              <div className="w-full bg-purple-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((stats.averageRating / 4.5) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </PageSection>
      </main>
  );
}
