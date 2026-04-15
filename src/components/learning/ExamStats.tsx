'use client';

import { Exam, ExamStats as ExamStatsType } from '@/types/exam';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LuBookOpen as BookOpen, LuUsers as Users, LuTarget as Target, LuTrendingUp as TrendingUp, LuClock as Clock, LuAward as Award, LuCheck as CheckCircle, LuX as XCircle, LuCalendar as Calendar, LuChartBar } from 'react-icons/lu';;

interface ExamStatsProps {
  exams: Exam[];
  loading: boolean;
  stats?: ExamStatsType | null;
}

export default function ExamStats({ exams, loading, stats }: ExamStatsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const totalExams = stats?.totalExams || 0;
  const publishedExams = stats?.publishedExams || 0;
  const draftExams = stats?.draftExams || 0;
  const activeExams = stats?.activeExams || 0;

  const totalQuestions = stats?.totalQuestions || 0;
  const totalAttempts = stats?.totalAttempts || 0;
  const averageScore = stats?.averageScore || 0;
  const passRate = stats?.passRate || 0;

  const examsByType = stats?.examsByType || {
    mcq: 0,
    written: 0,
    mixed: 0
  };

  const recentExams = stats?.recentExams || exams.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">
              Total Exams
            </CardTitle>
            <BookOpen className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{totalExams}</div>
            <p className="text-xs text-blue-700">
              {publishedExams} published, {draftExams} drafts
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">
              Active Exams
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{activeExams}</div>
            <p className="text-xs text-green-700">
              {Math.round((activeExams / totalExams) * 100)}% of total
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">
              Total Questions
            </CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{totalQuestions}</div>
            <p className="text-xs text-purple-700">
              {totalExams > 0 ? Math.round(totalQuestions / totalExams) : 0} avg per exam
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">
              Total Attempts
            </CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{totalAttempts}</div>
            <p className="text-xs text-orange-700">
              {totalExams > 0 ? Math.round(totalAttempts / totalExams) : 0} avg per exam
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-indigo-800">
              Average Score
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-900">{averageScore.toFixed(1)}%</div>
            <p className="text-xs text-indigo-700">
              Across all completed attempts
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-800">
              Pass Rate
            </CardTitle>
            <Award className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-900">{passRate.toFixed(1)}%</div>
            <p className="text-xs text-emerald-700">
              Students passing exams
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Exam Types */}
      <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <LuChartBar className="h-5 w-5" />
            Exam Types Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-900">{examsByType.mcq}</div>
              <div className="text-sm text-blue-700">MCQ Exams</div>
              <Badge variant="outline" className="mt-2 bg-blue-100 text-blue-800">
                Multiple Choice
              </Badge>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="text-2xl font-bold text-purple-900">{examsByType.written}</div>
              <div className="text-sm text-purple-700">Written Exams</div>
              <Badge variant="outline" className="mt-2 bg-purple-100 text-purple-800">
                Essay/Short Answer
              </Badge>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-900">{examsByType.mixed}</div>
              <div className="text-sm text-green-700">Mixed Exams</div>
              <Badge variant="outline" className="mt-2 bg-green-100 text-green-800">
                Combined Format
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      
    </div>
  );
}
