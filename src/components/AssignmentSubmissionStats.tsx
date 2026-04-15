'use client';

import { AssignmentSubmission } from '@/types/assignment';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LuUsers as Users, LuCheck as CheckCircle, LuClock as Clock, LuTarget as Target, LuTrendingUp as TrendingUp, LuTriangleAlert as AlertCircle, LuChartBar, LuAward as Award, LuMessageSquare as MessageSquare, LuFileText as LuFileText } from 'react-icons/lu';;

interface AssignmentSubmissionStatsProps {
  submissions: AssignmentSubmission[];
  loading: boolean;
  stats: any;
}

export default function AssignmentSubmissionStats({ submissions, loading, stats }: AssignmentSubmissionStatsProps) {
  if (loading) {
    return (
      <div className="space-y-6">
        {/* Main Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="animate-pulse border-2 border-blue-200">
            <CardContent className="p-6">
              <div className="bg-gray-200 h-4 w-3/4 rounded mb-2"></div>
              <div className="bg-gray-200 h-8 w-1/2 rounded"></div>
            </CardContent>
          </Card>
          <Card className="animate-pulse border-2 border-green-200">
            <CardContent className="p-6">
              <div className="bg-gray-200 h-4 w-3/4 rounded mb-2"></div>
              <div className="bg-gray-200 h-8 w-1/2 rounded"></div>
            </CardContent>
          </Card>
          <Card className="animate-pulse border-2 border-purple-200">
            <CardContent className="p-6">
              <div className="bg-gray-200 h-4 w-3/4 rounded mb-2"></div>
              <div className="bg-gray-200 h-8 w-1/2 rounded"></div>
            </CardContent>
          </Card>
          <Card className="animate-pulse border-2 border-orange-200">
            <CardContent className="p-6">
              <div className="bg-gray-200 h-4 w-3/4 rounded mb-2"></div>
              <div className="bg-gray-200 h-8 w-1/2 rounded"></div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Stats Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="animate-pulse border-2 border-teal-200">
            <CardHeader>
              <div className="bg-gray-200 h-6 w-1/3 rounded mb-2"></div>
              <div className="bg-gray-200 h-4 w-1/2 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="bg-gray-200 h-4 w-1/4 rounded"></div>
                    <div className="bg-gray-200 h-4 w-1/6 rounded"></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="animate-pulse border-2 border-amber-200">
            <CardHeader>
              <div className="bg-gray-200 h-6 w-1/3 rounded mb-2"></div>
              <div className="bg-gray-200 h-4 w-1/2 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="bg-gray-200 h-4 w-1/4 rounded"></div>
                    <div className="bg-gray-200 h-4 w-1/6 rounded"></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics Skeleton */}
        <Card className="animate-pulse border-2 border-rose-200">
          <CardHeader>
            <div className="bg-gray-200 h-6 w-1/3 rounded mb-2"></div>
            <div className="bg-gray-200 h-4 w-1/2 rounded"></div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="text-center">
                  <div className="bg-gray-200 h-8 w-16 rounded mx-auto mb-2"></div>
                  <div className="bg-gray-200 h-4 w-20 rounded mx-auto mb-1"></div>
                  <div className="bg-gray-200 h-3 w-24 rounded mx-auto"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const clientSubmitted = submissions.filter(s => s.status === 'submitted').length;
  const clientGraded = submissions.filter(s => s.status === 'graded').length;
  const clientLate = submissions.filter(s => s.isLate).length;
  const clientAvg = (() => {
    if (clientGraded === 0) return 0;
    const sum = submissions.reduce((acc, s) => acc + (s.status === 'graded' && typeof s.score === 'number' ? s.score : 0), 0);
    return sum / clientGraded;
  })();
  const clientPassRate = (() => {
    if (clientGraded === 0) return 0;
    const passed = submissions.reduce((acc, s) => acc + (s.status === 'graded' && typeof s.score === 'number' ? (s.score >= (s.maxScore * 0.5) ? 1 : 0) : 0), 0);
    return (passed / clientGraded) * 100;
  })();

  const totalSubmissions = stats?.totalSubmissions ?? submissions.length;
  const submittedSubmissions = stats?.submittedSubmissions ?? clientSubmitted;
  const gradedSubmissions = stats?.gradedSubmissions ?? clientGraded;
  const averageScore = stats?.averageScore ?? clientAvg;
  const passRate = stats?.passRate ?? clientPassRate;
  const lateSubmissions = stats?.lateSubmissions ?? clientLate;

  const getStatusStats = () => {
    const statusCounts = {
      draft: 0,
      submitted: 0,
      graded: 0,
      returned: 0
    };

    submissions.forEach(submission => {
      statusCounts[submission.status as keyof typeof statusCounts]++;
    });

    return statusCounts;
  };

  const getGradeDistribution = () => {
    const distribution = {
      'A+ (90-100)': 0,
      'A (80-89)': 0,
      'B (70-79)': 0,
      'C (60-69)': 0,
      'F (0-59)': 0
    };

    submissions.forEach(submission => {
      if (submission.score !== undefined) {
        const percentage = (submission.score / submission.maxScore) * 100;
        if (percentage >= 90) distribution['A+ (90-100)']++;
        else if (percentage >= 80) distribution['A (80-89)']++;
        else if (percentage >= 70) distribution['B (70-79)']++;
        else if (percentage >= 60) distribution['C (60-69)']++;
        else distribution['F (0-59)']++;
      }
    });

    return distribution;
  };

  const statusStats = getStatusStats();
  const gradeDistribution = getGradeDistribution();

  return (
    <div className="space-y-6">
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Submissions</p>
                <p className="text-2xl font-bold text-blue-900">{totalSubmissions}</p>
              </div>
              <div className="p-3 bg-blue-200 rounded-full">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="secondary" className="bg-blue-200 text-blue-800">
                {submittedSubmissions} Submitted
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Graded</p>
                <p className="text-2xl font-bold text-green-900">{gradedSubmissions}</p>
              </div>
              <div className="p-3 bg-green-200 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="secondary" className="bg-green-200 text-green-800">
                {totalSubmissions > 0 ? ((gradedSubmissions / totalSubmissions) * 100).toFixed(1) : 0}% Complete
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Average Score</p>
                <p className="text-2xl font-bold text-purple-900">{averageScore.toFixed(1)}</p>
              </div>
              <div className="p-3 bg-purple-200 rounded-full">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="secondary" className="bg-purple-200 text-purple-800">
                {passRate.toFixed(1)}% Pass Rate
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Late Submissions</p>
                <p className="text-2xl font-bold text-orange-900">{lateSubmissions}</p>
              </div>
              <div className="p-3 bg-orange-200 rounded-full">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="secondary" className="bg-orange-200 text-orange-800">
                {totalSubmissions > 0 ? ((lateSubmissions / totalSubmissions) * 100).toFixed(1) : 0}% of total
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Submission Status */}
        <Card className="shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-teal-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LuChartBar className="w-5 h-5" />
              Submission Status
            </CardTitle>
            <CardDescription>Current status of all submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(statusStats).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="secondary" 
                      className={`capitalize ${
                        status === 'graded' ? 'bg-green-100 text-green-800' :
                        status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                        status === 'draft' ? 'bg-gray-100 text-gray-800' :
                        'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {status}
                    </Badge>
                    <span className="text-sm text-gray-600">{count}</span>
                  </div>
                  <div className="flex items-center gap-2 w-32">
                    <Progress 
                      value={totalSubmissions > 0 ? (count / totalSubmissions) * 100 : 0} 
                      className="flex-1" 
                    />
                    <span className="text-xs text-gray-500 w-12 text-right">
                      {totalSubmissions > 0 ? ((count / totalSubmissions) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Grade Distribution */}
        <Card className="shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-amber-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Grade Distribution
            </CardTitle>
            <CardDescription>Distribution of grades across all submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(gradeDistribution).map(([grade, count]) => (
                <div key={grade} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="secondary" 
                      className={`${
                        grade.includes('A+') ? 'bg-green-100 text-green-800' :
                        grade.includes('A') ? 'bg-green-100 text-green-800' :
                        grade.includes('B') ? 'bg-yellow-100 text-yellow-800' :
                        grade.includes('C') ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}
                    >
                      {grade}
                    </Badge>
                    <span className="text-sm text-gray-600">{count}</span>
                  </div>
                  <div className="flex items-center gap-2 w-32">
                    <Progress 
                      value={gradedSubmissions > 0 ? (count / gradedSubmissions) * 100 : 0} 
                      className="flex-1" 
                    />
                    <span className="text-xs text-gray-500 w-12 text-right">
                      {gradedSubmissions > 0 ? ((count / gradedSubmissions) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card className="shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-rose-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Performance Metrics
          </CardTitle>
          <CardDescription>LuKey performance indicators for this assignment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{passRate.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Pass Rate</div>
              <div className="text-xs text-gray-500 mt-1">
                {gradedSubmissions} graded submissions
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{averageScore.toFixed(1)}</div>
              <div className="text-sm text-gray-600">Average Score</div>
              <div className="text-xs text-gray-500 mt-1">
                Out of 100 points
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">{lateSubmissions}</div>
              <div className="text-sm text-gray-600">Late Submissions</div>
              <div className="text-xs text-gray-500 mt-1">
                {totalSubmissions > 0 ? ((lateSubmissions / totalSubmissions) * 100).toFixed(1) : 0}% of total
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
