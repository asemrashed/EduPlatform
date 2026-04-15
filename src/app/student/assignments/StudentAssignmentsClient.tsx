'use client';

import { useEffect, useState } from 'react';
import { StudentRoleShell } from '@/components/role-area/StudentRoleShell';
import PageSection from '@/components/PageSection';
import WelcomeSection from '@/components/WelcomeSection';
import AssignmentStats from '@/components/AssignmentStats';
import AssignmentDataTable from '@/components/AssignmentDataTable';
import { Assignment } from '@/types/assignment';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { LuSettings as Settings, LuTag as Tag, LuFileText as LuFileText, LuArrowUpDown as ArrowUpDown, LuX as X } from 'react-icons/lu';;
import { Sheet, SheetContent, SheetHeader, SheetFooter } from '@/components/ui/sheet';

export default function StudentAssignmentsPage() {
  const router = useRouter();

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: 'all' as 'all' | 'upcoming' | 'active' | 'overdue',
    type: 'all' as 'all' | 'essay' | 'file_upload' | 'quiz' | 'project' | 'presentation',
    sortBy: 'dueDate' as 'dueDate' | 'createdAt' | 'title',
    sortOrder: 'asc' as 'asc' | 'desc'
  });
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [stats, setStats] = useState(null);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: String(filters.page),
        limit: String(filters.limit),
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.type !== 'all' && { type: filters.type }),
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      });
      const res = await fetch(`/api/student/assignments?${queryParams.toString()}`, { credentials: 'include' });
      const data = await res.json();
      if (res.ok) {
        setAssignments(data.data?.assignments || data.assignments || []);
        setPagination(data.data?.pagination || { page: 1, limit: 10, total: 0, pages: 0 });
        setStats(data.data?.stats || null);
      } else {
        setAssignments([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [filters]);

  const getActiveFiltersCount = () => {
    let c = 0;
    if (filters.status !== 'all') c++;
    if (filters.type !== 'all') c++;
    if (filters.sortBy !== 'dueDate') c++;
    if (filters.sortOrder !== 'asc') c++;
    return c;
  };

  const handlePageChange = (page: number) => setFilters(prev => ({ ...prev, page }));

  const handleViewSubmissions = (assignment: Assignment) => {
    router.push(`/student/assignments/${assignment._id}`);
  };

  const handleSubmitAssignment = (assignment: Assignment) => {
    router.push(`/student/assignments/${assignment._id}`);
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      status: 'all',
      type: 'all',
      sortBy: 'dueDate',
      sortOrder: 'asc'
    });
    setShowFilterDrawer(false);
  };

  return (
    <StudentRoleShell>
      <main className="relative z-10 p-2 sm:p-4">
        <WelcomeSection title="Your Assignments" description="View and submit your course assignments" />

        <PageSection title="Assignment Overview" className="mb-4">
          <AssignmentStats assignments={assignments} loading={loading} stats={stats} />
        </PageSection>

        <PageSection 
          title="Assignments"
          className="mb-4"
          actions={
            <Button onClick={() => setShowFilterDrawer(true)} variant="outline" className="flex items-center gap-2 border-2">
              <Settings className="w-4 h-4" />
              Filters
              {getActiveFiltersCount() > 0 && (
                <Badge variant="secondary" className="ml-2">{getActiveFiltersCount()}</Badge>
              )}
            </Button>
          }
        >
          <AssignmentDataTable
            assignments={assignments}
            loading={loading}
            onViewSubmissions={handleViewSubmissions}
            onSubmit={handleSubmitAssignment}
            pagination={pagination}
            onPageChange={handlePageChange}
            variant="table"
          />
        </PageSection>

        <Sheet open={showFilterDrawer} onOpenChange={setShowFilterDrawer}>
          <SheetContent side="right" className="w-full sm:max-w-md bg-gradient-to-br from-blue-50 via-white to-purple-50 border-l-2 border-blue-200">
            <SheetHeader className="bg-white/80 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-blue-100 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-blue-600" />
                    Filters
                  </h3>
                  <p className="text-sm text-gray-600">
                    Filter and sort assignments to find exactly what you're looking for
                  </p>
                </div>
              </div>
            </SheetHeader>
            <div className="p-4 sm:p-6 space-y-4">
              {/* Status */}
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-blue-200 shadow-md hover:shadow-lg transition-all duration-200">
                <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-blue-600" />
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any, page: 1 }))}
                  className="w-full h-10 px-3 py-2 border-2 border-blue-300 hover:border-blue-400 focus:border-blue-500 focus:ring-blue-500/20 focus:shadow-lg focus:shadow-blue-500/10 rounded-lg bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all duration-200 font-medium text-sm"
                >
                  <option value="all">All</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="active">Active</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
              {/* Type */}
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-purple-200 shadow-md hover:shadow-lg transition-all duration-200">
                <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <LuFileText className="w-4 h-4 text-purple-600" />
                  Type
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as any, page: 1 }))}
                  className="w-full h-10 px-3 py-2 border-2 border-purple-300 hover:border-purple-400 focus:border-purple-500 focus:ring-purple-500/20 focus:shadow-lg focus:shadow-purple-500/10 rounded-lg bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all duration-200 font-medium text-sm"
                >
                  <option value="all">All</option>
                  <option value="essay">Essay</option>
                  <option value="file_upload">LuFile Upload</option>
                  <option value="quiz">Quiz</option>
                  <option value="project">Project</option>
                  <option value="presentation">Presentation</option>
                </select>
              </div>
              {/* Sort By */}
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-orange-200 shadow-md hover:shadow-lg transition-all duration-200">
                <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4 text-orange-600" />
                  Sort By
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any, page: 1 }))}
                  className="w-full h-10 px-3 py-2 border-2 border-orange-300 hover:border-orange-400 focus:border-orange-500 focus:ring-orange-500/20 focus:shadow-lg focus:shadow-orange-500/10 rounded-lg bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all duration-200 font-medium text-sm"
                >
                  <option value="dueDate">Due Date</option>
                  <option value="createdAt">Created</option>
                  <option value="title">Title</option>
                </select>
              </div>
              {/* Sort Order */}
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-orange-200 shadow-md hover:shadow-lg transition-all duration-200">
                <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4 text-orange-600" />
                  Sort Order
                </label>
                <select
                  value={filters.sortOrder}
                  onChange={(e) => setFilters(prev => ({ ...prev, sortOrder: e.target.value as any, page: 1 }))}
                  className="w-full h-10 px-3 py-2 border-2 border-orange-300 hover:border-orange-400 focus:border-orange-500 focus:ring-orange-500/20 focus:shadow-lg focus:shadow-orange-500/10 rounded-lg bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all duration-200 font-medium text-sm"
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>
            </div>
            <SheetFooter className="flex flex-col gap-2 bg-white/80 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-blue-100 shadow-sm">
              <div className="flex gap-2 w-full">
                <Button 
                  onClick={clearFilters}
                  variant="outline"
                  className="flex-1 border-2 border-red-300 hover:border-red-400 hover:bg-red-50 transition-all duration-200 font-semibold"
                >
                  <X className="w-4 h-4 text-red-600 mr-2" />
                  Clear All
                </Button>
                <Button 
                  onClick={() => setShowFilterDrawer(false)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                >
                  Apply Filters
                </Button>
              </div>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </main>
    </StudentRoleShell>
  );
}


