'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMockSession } from '@/lib/mockSession';
import { StudentRoleShell } from '@/components/role-area/StudentRoleShell';
import PageSection from '@/components/PageSection';
import WelcomeSection from '@/components/WelcomeSection';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import DataTable, { Column } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { LuGraduationCap as GraduationCap, LuCheck as CheckCircle2, LuX as XCircle, LuTimer as Timer, LuTarget as Target, LuTrendingUp as TrendingUp } from 'react-icons/lu';;

interface AttemptRow {
  _id: string;
  exam: {
    _id: string;
    title: string;
    duration: number;
    totalMarks: number;
  };
  status: 'in_progress' | 'completed' | 'abandoned';
  score: number;
  percentage: number;
  passed: boolean;
  timeSpent: number;
  createdAt: string;
  completedAt?: string;
}

export default function StudentProgressPage() {
  const { data: session } = useMockSession();

  const [attempts, setAttempts] = useState<AttemptRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAttempts = async () => {
    try {
      setLoading(true);
      const resp = await fetch('/api/student/exam-attempts', {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (resp.ok) {
        const data = await resp.json();
        setAttempts(data.data?.attempts || []);
      }
    } catch (e) {
      console.error('Error fetching attempts:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!session?.user?.id) return;
    fetchAttempts();
  }, [session?.user?.id]);

  const completed = useMemo(() => attempts.filter(a => a.status === 'completed'), [attempts]);
  const inProgress = useMemo(() => attempts.filter(a => a.status === 'in_progress'), [attempts]);
  const passRate = useMemo(() => {
    const total = completed.length;
    if (total === 0) return 0;
    const passed = completed.filter(a => a.passed).length;
    return Math.round((passed / total) * 100);
  }, [completed]);
  const averageScore = useMemo(() => {
    const total = completed.length;
    if (total === 0) return 0;
    const sum = completed.reduce((acc, a) => acc + a.percentage, 0);
    return Math.round((sum / total) * 10) / 10;
  }, [completed]);

  const columns: Column<AttemptRow>[] = [
    {
      key: 'exam',
      label: 'Exam',
      render: (row) => (
        <div className="space-y-1">
          <div className="font-semibold text-gray-900 text-sm">{row.exam?.title || 'Untitled Exam'}</div>
          <div className="text-xs text-gray-600">
            {row.exam?.totalMarks} marks • {row.exam?.duration} min
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        row.status === 'completed' ? (
          <Badge className="bg-green-100 text-green-800">Completed</Badge>
        ) : row.status === 'in_progress' ? (
          <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
        ) : (
          <Badge className="bg-gray-100 text-gray-800">Abandoned</Badge>
        )
      )
    },
    {
      key: 'score',
      label: 'Score',
      render: (row) => (
        row.status === 'completed' ? (
          <span className={`font-semibold ${row.passed ? 'text-green-600' : 'text-red-600'}`}>{row.percentage.toFixed(1)}%</span>
        ) : (
          <span className="text-gray-500 text-sm">—</span>
        )
      )
    },
    {
      key: 'time',
      label: 'Time Spent',
      render: (row) => (
        <span className="text-sm">{Math.floor((row.timeSpent || 0) / 60)}m</span>
      )
    }
  ];

  const recent = useMemo(() => {
    return [...attempts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
  }, [attempts]);

  return (
    <StudentRoleShell>
      <main className="relative z-10 p-2 sm:p-4">
        <WelcomeSection title="Progress" description="Track your overall exam performance" />

        {/* Stats Cards */}
        <PageSection title="Overview" className="mb-2 sm:mb-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-0 shadow-md">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-blue-500 rounded-full"><GraduationCap className="h-6 w-6 text-white"/></div>
                <div>
                  <p className="text-2xl font-bold text-blue-900">{attempts.length}</p>
                  <p className="text-blue-700">Total Attempts</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-0 shadow-md">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-green-500 rounded-full"><CheckCircle2 className="h-6 w-6 text-white"/></div>
                <div>
                  <p className="text-2xl font-bold text-green-900">{completed.length}</p>
                  <p className="text-green-700">Completed</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-0 shadow-md">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-orange-500 rounded-full"><Timer className="h-6 w-6 text-white"/></div>
                <div>
                  <p className="text-2xl font-bold text-orange-900">{inProgress.length}</p>
                  <p className="text-orange-700">In Progress</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-0 shadow-md">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-purple-500 rounded-full"><TrendingUp className="h-6 w-6 text-white"/></div>
                <div>
                  <p className="text-2xl font-bold text-purple-900">{averageScore}%</p>
                  <p className="text-purple-700">Average Score</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </PageSection>

        {/* Recent Attempts */}
        <PageSection title="Recent Attempts" className="mb-2 sm:mb-4">
          <DataTable
            data={recent}
            columns={columns}
            loading={loading}
            variant="table"
            emptyState={{
              title: 'No attempts yet',
              description: 'Your recent exam attempts will show here',
              icon: <GraduationCap className="h-12 w-12 text-gray-400" />
            }}
          />
        </PageSection>
      </main>
    </StudentRoleShell>
  );
}


