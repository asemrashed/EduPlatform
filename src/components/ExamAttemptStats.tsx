'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LuUsers as Users, LuCheck as CheckCircle, LuClock as Clock, LuTarget as Target, LuChartBar } from 'react-icons/lu';
import type { ExamAttemptRow } from '@/components/ExamAttemptDataTable';

interface ExamAttemptStatsProps {
  attempts: ExamAttemptRow[];
  loading: boolean;
  stats: {
    totalAttempts?: number;
    completedAttempts?: number;
    inProgressAttempts?: number;
    averageScore?: number;
    passRate?: number;
  } | null;
}

export default function ExamAttemptStats({ attempts, loading, stats }: ExamAttemptStatsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse border-2 border-blue-200">
            <CardContent className="p-6">
              <div className="bg-gray-200 h-4 w-3/4 rounded mb-2" />
              <div className="bg-gray-200 h-8 w-1/2 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const total = stats?.totalAttempts ?? attempts.length;
  const completed = stats?.completedAttempts ?? attempts.filter((a) => a.status === 'completed').length;
  const inProg = stats?.inProgressAttempts ?? attempts.filter((a) => a.status === 'in_progress').length;
  const avg =
    stats?.averageScore ??
    (() => {
      const done = attempts.filter((a) => a.status === 'completed');
      if (!done.length) return 0;
      return done.reduce((s, a) => s + Number(a.percentage || 0), 0) / done.length;
    })();
  const pass = stats?.passRate ?? 0;

  const statusCounts = {
    completed: attempts.filter((a) => a.status === 'completed').length,
    pending_review: attempts.filter((a) => a.status === 'pending_review').length,
    in_progress: attempts.filter((a) => a.status === 'in_progress').length,
    abandoned: attempts.filter((a) => a.status === 'abandoned').length,
    timeout: attempts.filter((a) => a.status === 'timeout').length,
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg border-2 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total attempts</p>
                <p className="text-2xl font-bold text-blue-900">{total}</p>
              </div>
              <div className="p-3 bg-blue-200 rounded-full">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-2">
              <Badge variant="secondary" className="bg-blue-200 text-blue-800">
                {inProg} in progress
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 shadow-lg border-2 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Completed</p>
                <p className="text-2xl font-bold text-green-900">{completed}</p>
              </div>
              <div className="p-3 bg-green-200 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-2">
              <Badge variant="secondary" className="bg-green-200 text-green-800">
                {total > 0 ? ((completed / total) * 100).toFixed(1) : 0}% finished
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 shadow-lg border-2 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Average score</p>
                <p className="text-2xl font-bold text-purple-900">{Number(avg || 0).toFixed(1)}%</p>
              </div>
              <div className="p-3 bg-purple-200 rounded-full">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-2">
              <Badge variant="secondary" className="bg-purple-200 text-purple-800">
                Completed only
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 shadow-lg border-2 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Pass rate</p>
                <p className="text-2xl font-bold text-orange-900">{Number(pass || 0).toFixed(1)}%</p>
              </div>
              <div className="p-3 bg-orange-200 rounded-full">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-2">
              <Badge variant="secondary" className="bg-orange-200 text-orange-800">
                Of completed attempts
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg border-2 border-teal-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LuChartBar className="w-5 h-5" />
            Attempt status
          </CardTitle>
          <CardDescription>Current page snapshot</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(statusCounts).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <Badge variant="secondary" className="capitalize bg-gray-100 text-gray-800">
                  {status.replace('_', ' ')}
                </Badge>
                <div className="flex items-center gap-2 w-32">
                  <Progress value={attempts.length > 0 ? (count / attempts.length) * 100 : 0} className="flex-1" />
                  <span className="text-xs text-gray-500 w-10 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
