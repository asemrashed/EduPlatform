'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { StudentRoleShell } from '@/components/role-area/StudentRoleShell';
import PageSection from '@/components/PageSection';
import WelcomeSection from '@/components/WelcomeSection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import DataTable, { Column } from '@/components/ui/data-table';
import { LuBookOpen as BookOpen, LuClock as Clock, LuAward as Award, LuCalendar as Calendar, LuPlay as PlayCircle, LuCheck as CheckCircle, LuTarget as Target, LuUsers as Users, LuFileText as LuFileText, LuChartBar, LuEye as Eye, LuTriangleAlert as AlertCircle, LuTimer as Timer, LuCheck as CheckCircle2, LuX as XCircle, LuSearch as Search, LuX as X, LuGraduationCap as GraduationCap, LuTrendingUp as TrendingUp } from 'react-icons/lu';;
import { format } from 'date-fns';
import { htmlToPlainText } from '@/lib/utils';

interface Exam {
  _id: string;
  title: string;
  description: string;
  type: 'mcq' | 'written' | 'mixed';
  duration: number;
  totalMarks: number;
  passingMarks: number;
  instructions: string;
  isActive: boolean;
  isPublished: boolean;
  startDate?: string;
  endDate?: string;
  course?: {
    _id: string;
    title: string;
  };
  createdBy: {
    _id: string;
    name: string;
  };
  questionCount: number;
  attempts: number;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showCorrectAnswers: boolean;
  showResults: boolean;
  allowReview: boolean;
  timeLimit: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ExamAttempt {
  _id: string;
  exam: string;
  student: string;
  status: 'in_progress' | 'completed' | 'abandoned';
  score: number;
  percentage: number;
  passed: boolean;
  timeSpent: number;
  answers: any[];
  startedAt: string;
  completedAt?: string;
  createdAt: string;
  // Added by API for in-progress attempts
  remainingSeconds?: number;
}

function StudentExamsPageContent() {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [hasMounted, setHasMounted] = useState(false);
  const [exams, setExams] = useState<Exam[]>([]);
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'available' | 'completed' | 'in_progress'>('all');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  });
  const [stats, setStats] = useState({
    availableExams: 0
  });

  const fetchExams = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(search && { search }),
        ...(filter !== 'all' && { status: filter })
      });

      const response = await fetch(`/api/student/exams?${queryParams}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Student Exams Frontend - API Response:', data);
        setExams(data.data?.exams || []);
        setPagination(data.data?.pagination || {
          page: 1,
          limit: 12,
          total: 0,
          pages: 0
        });
        // Update stats from API
        setStats(prev => ({
          ...prev,
          availableExams: data.data?.stats?.availableExams ?? prev.availableExams
        }));
      } else {
        console.error('Failed to fetch exams:', response.status, response.statusText);
        const errorData = await response.json();
        console.error('Error details:', errorData);
      }
    } catch (error) {
      console.error('Error fetching exams:', error);
    } finally {
      setLoading(false);
    }
  };

  // Avoid hydration mismatches for dynamic UI (e.g., remaining time)
  useEffect(() => {
    setHasMounted(true);
  }, []);

  const fetchAttempts = async () => {
    try {
      const response = await fetch('/api/student/exam-attempts', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setAttempts(data.data?.attempts || []);
      }
    } catch (error) {
      console.error('Error fetching attempts:', error);
    }
  };

  // Periodically refresh attempts to keep remaining time current
  useEffect(() => {
    const id = setInterval(() => {
      fetchAttempts();
    }, 30000); // 30s
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    fetchExams();
    fetchAttempts();
  }, [pagination.page, search, filter]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handleFilterChange = (newFilter: 'all' | 'available' | 'completed' | 'in_progress') => {
    setFilter(newFilter);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const getExamStatus = (exam: Exam) => {
    const now = new Date();
    const startDate = exam.startDate ? new Date(exam.startDate) : null;
    const endDate = exam.endDate ? new Date(exam.endDate) : null;

    if (!exam.isPublished) return 'draft';
    if (!exam.isActive) return 'inactive';
    // Only check dates if they are provided (dates are now optional)
    if (startDate && now < startDate) return 'scheduled';
    if (endDate && now > endDate) return 'expired';
    return 'available';
  };

  const getExamAttempt = (examId: string) => {
    return attempts.find(attempt => attempt.exam === examId);
  };

  const getRemainingAttempts = (exam: Exam, attempt: ExamAttempt | undefined) => {
    if (!attempt) return exam.attempts;
    return Math.max(0, exam.attempts - (attempt.status === 'completed' ? 1 : 0));
  };

  const canTakeExam = (exam: Exam) => {
    const status = getExamStatus(exam);
    const attempt = getExamAttempt(exam._id);
    
    // If student has completed the exam, they cannot take it again
    if (attempt?.status === 'completed') {
      return false;
    }
    
    const remainingAttempts = getRemainingAttempts(exam, attempt);
    
    return status === 'available' && remainingAttempts > 0;
  };

  // Filter exams based on current filter state
  const getFilteredExams = () => {
    let filtered = exams;

    // Apply search filter
    if (search) {
      filtered = filtered.filter(exam => 
        exam.title.toLowerCase().includes(search.toLowerCase()) ||
        htmlToPlainText(exam.description).toLowerCase().includes(search.toLowerCase()) ||
        exam.course?.title?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply status filter
    switch (filter) {
      case 'available':
        filtered = filtered.filter(exam => {
          const status = getExamStatus(exam);
          return status === 'available' && canTakeExam(exam);
        });
        break;
      case 'in_progress':
        filtered = filtered.filter(exam => {
          const attempt = getExamAttempt(exam._id);
          return attempt?.status === 'in_progress';
        });
        break;
      case 'completed':
        filtered = filtered.filter(exam => {
          const attempt = getExamAttempt(exam._id);
          return attempt?.status === 'completed';
        });
        break;
      case 'all':
      default:
        // No additional filtering
        break;
    }

    return filtered;
  };

  const getStatusBadge = (exam: Exam) => {
    const status = getExamStatus(exam);
    const attempt = getExamAttempt(exam._id);
    
    if (attempt?.status === 'completed') {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 border-blue-300 hover:border-blue-400">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Completed
        </Badge>
      );
    }
    
    if (attempt?.status === 'in_progress') {
      return (
        <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-300 hover:border-blue-400">
          <Timer className="w-3 h-3 mr-1" />
          In Progress
        </Badge>
      );
    }

    switch (status) {
      case 'available':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            <PlayCircle className="w-3 h-3 mr-1" />
            Available
          </Badge>
        );
      case 'scheduled':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            <Calendar className="w-3 h-3 mr-1" />
            Scheduled
          </Badge>
        );
      case 'expired':
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Expired
          </Badge>
        );
      case 'inactive':
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            Inactive
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            Draft
          </Badge>
        );
    }
  };

  // Format seconds to mm:ss for remaining time badges
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Define table columns
  const columns: Column<Exam>[] = [
    {
      key: 'exam',
      label: 'Exam',
      width: 'w-2/5',
      render: (exam) => (
        <div className="space-y-2">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2">
                {exam.title}
              </h3>
              <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                {htmlToPlainText(exam.description)}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  {exam.course?.title || 'General Exam'}
                </Badge>
                <div className="flex items-center gap-1 text-xs text-blue-600">
                  <Clock className="h-3 w-3" />
                  <span>{exam.duration} min</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'details',
      label: 'Details',
      width: 'w-1/5',
      render: (exam) => (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Marks</span>
            <span className="font-medium">{exam.totalMarks}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Questions</span>
            <span className="font-medium">{exam.questionCount}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Passing</span>
            <span className="font-medium">{exam.passingMarks}</span>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      width: 'w-1/6',
      render: (exam) => {
        const attempt = getExamAttempt(exam._id);
        const status = getExamStatus(exam);
        
        if (attempt?.status === 'completed') {
          return (
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Completed
            </Badge>
          );
        }
        
    if (attempt?.status === 'in_progress') {
      return (
        <div className="flex flex-col items-start gap-1">
          <Badge className="bg-blue-100 text-blue-800">
            <Timer className="w-3 h-3 mr-1" />
            In Progress
          </Badge>
          {hasMounted && typeof attempt.remainingSeconds === 'number' && (
            <span className="text-[11px] text-blue-700" suppressHydrationWarning>
              Remaining: {formatTime(attempt.remainingSeconds)}
            </span>
          )}
        </div>
      );
    }

        switch (status) {
          case 'available':
            return (
              <Badge className="bg-green-100 text-green-800">
                <PlayCircle className="w-3 h-3 mr-1" />
                Available
              </Badge>
            );
          case 'scheduled':
            return (
              <Badge className="bg-yellow-100 text-yellow-800">
                <Calendar className="w-3 h-3 mr-1" />
                Scheduled
              </Badge>
            );
          case 'expired':
            return (
              <Badge className="bg-red-100 text-red-800">
                <XCircle className="w-3 h-3 mr-1" />
                Expired
              </Badge>
            );
          default:
            return (
              <Badge className="bg-gray-100 text-gray-800">
                <AlertCircle className="w-3 h-3 mr-1" />
                Inactive
              </Badge>
            );
        }
      }
    },
    {
      key: 'attempts',
      label: 'Attempts',
      width: 'w-1/6',
      render: (exam) => {
        const attempt = getExamAttempt(exam._id);
        const remainingAttempts = getRemainingAttempts(exam, attempt);
        
        return (
          <div className="text-center">
            <div className="text-sm font-medium text-gray-900">
              {remainingAttempts} / {exam.attempts}
            </div>
            <div className="text-xs text-gray-600">remaining</div>
          </div>
        );
      }
    },
    {
      key: 'score',
      label: 'Score',
      width: 'w-1/6',
      render: (exam) => {
        const attempt = getExamAttempt(exam._id);
        
        if (attempt?.status === 'completed') {
          return (
            <div className="text-center">
              <div className={`text-lg font-bold ${attempt.passed ? 'text-green-600' : 'text-red-600'}`}>
                {attempt.percentage.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-600">
                {attempt.passed ? 'Passed' : 'Failed'}
              </div>
            </div>
          );
        }
        
        return (
          <div className="text-center text-gray-400">
            <div className="text-sm">Not taken</div>
          </div>
        );
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      width: 'w-1/6',
      render: (exam) => {
        const attempt = getExamAttempt(exam._id);
        const canTake = canTakeExam(exam);
        
        return (
          <div className="flex flex-col gap-2">
            {/* Start Exam Button */}
            {canTake && (
              <Button
                type="button"
                onClick={() => handleStartExam(exam)}
                size="sm"
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                <PlayCircle className="w-4 h-4 mr-2" />
                Start Exam
              </Button>
            )}
            
            {/* Continue Button */}
            {attempt?.status === 'in_progress' && (
              <Button
                type="button"
                onClick={() => handleContinueExam(exam)}
                size="sm"
                variant="secondary"
                className="w-full"
              >
                <PlayCircle className="w-4 h-4 mr-2" />
                Continue
              </Button>
            )}
            
            {/* View Results Button */}
            {attempt?.status === 'completed' && (
              <Button
                type="button"
                onClick={() => handleViewResults(exam)}
                size="sm"
                variant="outline"
                className="w-full"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Results
              </Button>
            )}
            
            {/* Not Available Message */}
            {!canTake && !attempt && (
              <div className="text-center text-gray-500 text-sm">
                Not Available
              </div>
            )}
          </div>
        );
      }
    }
  ];


  const handleStartExam = (exam: Exam) => {
    if (canTakeExam(exam)) {
      router.push(`/student/exams/${exam._id}/take`);
    } else {
      console.warn('Cannot start exam:', exam.title);
    }
  };

  const handleViewResults = (exam: Exam) => {
    const attempt = getExamAttempt(exam._id);
    if (attempt?.status === 'completed') {
      router.push(`/student/exams/${exam._id}/results`);
    } else {
      console.warn('No completed attempt found for exam:', exam.title);
    }
  };

  const handleContinueExam = (exam: Exam) => {
    const attempt = getExamAttempt(exam._id);
    if (attempt?.status === 'in_progress') {
      router.push(`/student/exams/${exam._id}/take`);
    } else {
      console.warn('No in-progress attempt found for exam:', exam.title);
    }
  };

  // Note: do not gate the whole page on loading; let the table handle its own loading state

  return (
    <StudentRoleShell>
      <main className="relative z-10 p-2 sm:p-4">
        {/* Welcome Section */}
        <WelcomeSection 
          title="Exams 📝"
          description="Take exams and track your progress"
        />

        {/* Exam Statistics */}
        <PageSection 
          title="Exam Statistics"
          className="mb-2 sm:mb-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500 rounded-full">
                    <GraduationCap className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-900">{stats.availableExams}</p>
                    <p className="text-blue-700">Available Exams</p>
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
                      {attempts.filter(a => a.status === 'completed').length}
                    </p>
                    <p className="text-green-700">Completed Exams</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-500 rounded-full">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-900">
                      {attempts.length > 0 
                        ? Math.round(attempts.reduce((acc, a) => acc + (a.percentage || 0), 0) / attempts.length)
                        : 0}%
                    </p>
                    <p className="text-purple-700">Average Score</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </PageSection>

        {/* Exams Table */}
        <PageSection 
          title="Available Exams"
          description="Take exams and track your progress"
          className="mb-2 sm:mb-4"
          actions={
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search exams..."
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10 pr-10 w-full sm:w-64 border-2 border-blue-300 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:shadow-lg focus:shadow-blue-500/10"
                  disabled={loading}
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => handleSearchChange('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={filter === 'all' ? 'default' : 'outline'}
                  onClick={() => handleFilterChange('all')}
                  className={`text-sm border-2 border-blue-300 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:shadow-lg focus:shadow-blue-500/10 ${filter === 'all' ? 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600' : ''}`}
                >
                  All ({exams.length})
                </Button>
                <Button
                  type="button"
                  variant={filter === 'available' ? 'default' : 'outline'}
                  onClick={() => handleFilterChange('available')}
                  className={`text-sm border-2 border-blue-300 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:shadow-lg focus:shadow-blue-500/10 ${filter === 'available' ? 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600' : ''}`}
                >
                  Available ({exams.filter(exam => getExamStatus(exam) === 'available' && canTakeExam(exam)).length})
                </Button>
                <Button
                  type="button"
                  variant={filter === 'in_progress' ? 'default' : 'outline'}
                  onClick={() => handleFilterChange('in_progress')}
                  className={`text-sm border-2 border-blue-300 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:shadow-lg focus:shadow-blue-500/10 ${filter === 'in_progress' ? 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600' : ''}`}
                >
                  In Progress ({attempts.filter(attempt => attempt.status === 'in_progress').length})
                </Button>
                <Button
                  type="button"
                  variant={filter === 'completed' ? 'default' : 'outline'}
                  onClick={() => handleFilterChange('completed')}
                  className={`text-sm border-2 border-blue-300 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:shadow-lg focus:shadow-blue-500/10 ${filter === 'completed' ? 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600' : ''}`}
                >
                  Completed ({attempts.filter(attempt => attempt.status === 'completed').length})
                </Button>
              </div>
            </div>
          }
        >
          <DataTable
            data={getFilteredExams()}
            columns={columns}
            loading={loading}
            variant="table"
            pagination={{
              page: pagination.page,
              limit: pagination.limit,
              total: getFilteredExams().length,
              pages: Math.ceil(getFilteredExams().length / pagination.limit),
              onPageChange: handlePageChange
            }}
            emptyState={{
              title: search ? 'No exams found' : 'No exams available',
              description: search 
                ? 'Try adjusting your search terms.' 
                : 'No exams are currently available. Check back later!',
              icon: <GraduationCap className="h-12 w-12 text-gray-400" />
            }}
            className="mt-4"
          />
        </PageSection>

      </main>
    </StudentRoleShell>
  );
}

export default function StudentExamsPage() {
  return <StudentExamsPageContent />;
}
