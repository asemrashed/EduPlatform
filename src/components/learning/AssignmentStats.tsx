'use client';

import { Assignment } from '@/types/assignment';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LuFileText as LuFileText, LuUsers as Users, LuTarget as Target, LuTrendingUp as TrendingUp, LuClock as Clock, LuCheck as CheckCircle, LuTriangleAlert as AlertCircle, LuChartBar, LuAward as Award, LuCalendar as Calendar, LuBookOpen as BookOpen } from 'react-icons/lu';;

interface AssignmentStatsProps {
  assignments: Assignment[];
  loading: boolean;
  stats: any;
}

export default function AssignmentStats({ assignments, loading, stats }: AssignmentStatsProps) {
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
          <Card className="animate-pulse border-2 border-indigo-200">
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
          <Card className="animate-pulse border-2 border-cyan-200">
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
        <Card className="animate-pulse border-2 border-emerald-200">
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

  const totalAssignments = stats?.totalAssignments || assignments.length;
  const publishedAssignments = stats?.publishedAssignments || 0;
  const draftAssignments = stats?.draftAssignments || 0;
  const activeAssignments = stats?.activeAssignments || 0;
  const totalSubmissions = stats?.totalSubmissions || 0;
  const gradedSubmissions = stats?.gradedSubmissions || 0;
  const averageScore = stats?.averageScore || 0;
  const passRate = stats?.passRate || 0;
  const lateSubmissions = stats?.lateSubmissions || 0;
  const assignmentsByType = stats?.assignmentsByType || {};

  const getTypeStats = () => {
    const types = ['essay', 'file_upload', 'quiz', 'project', 'presentation'];
    return types.map(type => ({
      type,
      count: assignmentsByType[type] || 0,
      percentage: totalAssignments > 0 ? ((assignmentsByType[type] || 0) / totalAssignments) * 100 : 0
    }));
  };

  const getStatusStats = () => {
    const now = new Date();
    const statusCounts = {
      draft: 0,
      scheduled: 0,
      active: 0,
      expired: 0,
      inactive: 0
    };

    assignments.forEach(assignment => {
      if (!assignment.isPublished) {
        statusCounts.draft++;
      } else if (!assignment.isActive) {
        statusCounts.inactive++;
      } else if (assignment.startDate && new Date(assignment.startDate) > now) {
        statusCounts.scheduled++;
      } else if (assignment.dueDate && new Date(assignment.dueDate) < now) {
        statusCounts.expired++;
      } else {
        statusCounts.active++;
      }
    });

    return statusCounts;
  };

  const statusStats = getStatusStats();
  const typeStats = getTypeStats();

  return (
    <div className="space-y-6">
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Assignments</p>
                <p className="text-2xl font-bold text-blue-900">{totalAssignments}</p>
              </div>
              <div className="p-3 bg-blue-200 rounded-full">
                <LuFileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="secondary" className="bg-blue-200 text-blue-800">
                {publishedAssignments} Published
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Active Assignments</p>
                <p className="text-2xl font-bold text-green-900">{activeAssignments}</p>
              </div>
              <div className="p-3 bg-green-200 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="secondary" className="bg-green-200 text-green-800">
                {draftAssignments} Draft
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Total Submissions</p>
                <p className="text-2xl font-bold text-purple-900">{totalSubmissions}</p>
              </div>
              <div className="p-3 bg-purple-200 rounded-full">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="secondary" className="bg-purple-200 text-purple-800">
                {gradedSubmissions} Graded
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Average Score</p>
                <p className="text-2xl font-bold text-orange-900">{averageScore.toFixed(1)}</p>
              </div>
              <div className="p-3 bg-orange-200 rounded-full">
                <Target className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="secondary" className="bg-orange-200 text-orange-800">
                {passRate.toFixed(1)}% Pass Rate
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assignment Types */}
        <Card className="shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-indigo-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LuChartBar className="w-5 h-5" />
              Assignment Types
            </CardTitle>
            <CardDescription>Distribution of assignments by type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {typeStats.map(({ type, count, percentage }) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="capitalize bg-gray-100 text-gray-800">
                      {type.replace('_', ' ')}
                    </Badge>
                    <span className="text-sm text-gray-600">{count}</span>
                  </div>
                  <div className="flex items-center gap-2 w-32">
                    <Progress value={percentage} className="flex-1" />
                    <span className="text-xs text-gray-500 w-12 text-right">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Assignment Status */}
        <Card className="shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-cyan-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Assignment Status
            </CardTitle>
            <CardDescription>Current status of all assignments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(statusStats).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="secondary" 
                      className={`capitalize ${
                        status === 'active' ? 'bg-green-100 text-green-800' :
                        status === 'draft' ? 'bg-gray-100 text-gray-800' :
                        status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                        status === 'expired' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {status}
                    </Badge>
                    <span className="text-sm text-gray-600">{count}</span>
                  </div>
                  <div className="flex items-center gap-2 w-32">
                    <Progress 
                      value={totalAssignments > 0 ? (count / totalAssignments) * 100 : 0} 
                      className="flex-1" 
                    />
                    <span className="text-xs text-gray-500 w-12 text-right">
                      {totalAssignments > 0 ? ((count / totalAssignments) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card className="shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-emerald-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Performance Metrics
          </CardTitle>
          <CardDescription>LuKey performance indicators for assignments</CardDescription>
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
