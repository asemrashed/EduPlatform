'use client';

import { useState, useEffect } from 'react';
import { useAppSelector } from '@/lib/hooks';
import { AdminRoleShell } from '@/components/role-area/AdminRoleShell';
import ExamDataTable from '@/components/ExamDataTable';
import ExamModal from '@/components/ExamModal';
import ExamStats from '@/components/ExamStats';
import PageSection from '@/components/PageSection';
import WelcomeSection from '@/components/WelcomeSection';
import ConfirmModal from '@/components/ui/confirm-modal';
import InstructorPageWrapper from '@/components/InstructorPageWrapper';
import { Exam, ExamFilters as ExamFiltersType } from '@/types/exam';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AttractiveInput } from '@/components/ui/attractive-input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { LuPlus as Plus, LuSearch as Search, LuX as X, LuBookOpen as BookOpen, LuFilter as Filter, LuTag as Tag, LuClock as Clock, LuCalendar as Calendar, LuArrowUpDown as ArrowUpDown, LuSettings as Settings, LuUser as User, LuTarget as Target } from 'react-icons/lu';;
import { useRouter } from 'next/navigation';
import { InstructorRoleShell } from '@/components/role-area/InstructorRoleShell';

function InstructorExamsPageContent() {
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [search, setSearch] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [examToDelete, setExamToDelete] = useState<Exam | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    page: 1,
    limit: 10,
    type: 'all' as 'mcq' | 'written' | 'mixed' | 'all',
    status: 'all' as 'draft' | 'published' | 'scheduled' | 'active' | 'expired' | 'inactive' | 'all',
    difficulty: 'all' as 'easy' | 'medium' | 'hard' | 'all',
    course: 'all',
    isActive: 'all' as 'true' | 'false' | 'all',
    isPublished: 'all' as 'true' | 'false' | 'all',
    sortBy: 'createdAt' as 'title' | 'createdAt' | 'updatedAt' | 'totalMarks' | 'duration',
    sortOrder: 'desc' as 'asc' | 'desc'
  });
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [courses, setCourses] = useState<Array<{_id: string, title: string}>>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [stats, setStats] = useState(null);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: filters.page.toString(),
        limit: filters.limit.toString(),
        instructor: (user as any)?._id || '', // Filter by current instructor
        ...(filters.search && { search: filters.search }),
        ...(filters.type !== 'all' && { type: filters.type }),
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.difficulty !== 'all' && { difficulty: filters.difficulty }),
        ...(filters.course !== 'all' && { course: filters.course }),
        ...(filters.isActive !== 'all' && { isActive: filters.isActive }),
        ...(filters.isPublished !== 'all' && { isPublished: filters.isPublished }),
        ...(filters.sortBy && { sortBy: filters.sortBy }),
        ...(filters.sortOrder && { sortOrder: filters.sortOrder }),
      });

      const response = await fetch(`/api/instructor/exams?${queryParams}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      const data = await response.json();
      
      console.log('Instructor Exams API Response:', {
        status: response.status,
        ok: response.ok,
        data: data,
        url: `/api/instructor/exams?${queryParams}`
      });

      if (response.ok) {
        const exams = data.data?.exams || data.exams || [];
        const pagination = data.data?.pagination || data.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          pages: 0
        };
        const stats = data.data?.stats || data.stats || null;
        
        setExams(Array.isArray(exams) ? exams : []);
        setPagination(pagination);
        setStats(stats);
      } else {
        console.error('Failed to fetch exams:', data.error);
        setExams([]);
        setPagination({
          page: 1,
          limit: 10,
          total: 0,
          pages: 0
        });
        setStats(null);
      }
    } catch (error) {
      console.error('Error fetching exams:', error);
      setExams([]);
      setPagination({
        page: 1,
        limit: 10,
        total: 0,
        pages: 0
      });
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/instructor/courses');
      const data = await response.json();
      if (response.ok) {
        const courses = data.data?.courses || data.courses || data.data || [];
        setCourses(Array.isArray(courses) ? courses : []);
      } else {
        console.error('Failed to fetch courses:', data.error);
        setCourses([]);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses([]);
    }
  };

  useEffect(() => {
    fetchExams();
  }, [filters]);

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleSearchChange = (searchValue: string) => {
    setSearch(searchValue);
    setFilters(prev => ({ ...prev, search: searchValue, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({
      ...prev,
      page
    }));
  };

  const handleAddExam = () => {
    setEditingExam(null);
    setShowForm(true);
  };

  const handleEditExam = (exam: Exam) => {
    setEditingExam(exam);
    setShowForm(true);
  };

  const handleDeleteExam = (exam: Exam) => {
    setExamToDelete(exam);
    setShowDeleteModal(true);
  };

  const handleManageQuestions = (exam: Exam) => {
    router.push(`/instructor/exams/${exam._id}/questions`);
  };

  const confirmDeleteExam = async () => {
    if (!examToDelete) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/instructor/exams/${examToDelete._id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Exam deleted successfully');
        fetchExams();
        setShowDeleteModal(false);
        setExamToDelete(null);
      } else {
        console.error('Failed to delete exam:', data.error);
      }
    } catch (error) {
      console.error('Error deleting exam:', error);
    } finally {
      setDeleting(false);
    }
  };

  const cancelDeleteExam = () => {
    setShowDeleteModal(false);
    setExamToDelete(null);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingExam(null);
    fetchExams();
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingExam(null);
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      page: 1,
      limit: 10,
      type: 'all',
      status: 'all',
      difficulty: 'all',
      course: 'all',
      isActive: 'all',
      isPublished: 'all',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    setSearch('');
    setShowFilterDrawer(false);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.type !== 'all') count++;
    if (filters.status !== 'all') count++;
    if (filters.difficulty !== 'all') count++;
    if (filters.course !== 'all') count++;
    if (filters.isActive !== 'all') count++;
    if (filters.isPublished !== 'all') count++;
    if (filters.sortBy !== 'createdAt') count++;
    if (filters.sortOrder !== 'desc') count++;
    return count;
  };

  return (
    <InstructorRoleShell>
      <main className="relative z-10 p-2 sm:p-4">
        {/* Welcome Section */}
        <WelcomeSection 
          title="My Exams"
          description="Create and manage your exams for your courses"
        />

        {/* Exam Statistics */}
        <PageSection 
          title="Exam Statistics"
          className="mb-2 sm:mb-4"
        >
          <ExamStats exams={exams} loading={loading} stats={stats} />
        </PageSection>

        {/* Filter Actions */}
        <PageSection 
          title="Exam Management"
          className="mb-2 sm:mb-4"
          actions={
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <Button 
                onClick={() => setShowFilterDrawer(true)}
                variant="outline"
                className="flex items-center gap-2 border-2 border-blue-300 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 font-semibold"
              >
                <Settings className="w-4 h-4 text-blue-600" />
                <span>Advanced Filters</span>
                {getActiveFiltersCount() > 0 && (
                  <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center font-bold animate-pulse">
                    {getActiveFiltersCount()}
                  </span>
                )}
              </Button>
              {getActiveFiltersCount() > 0 && (
                <Button 
                  onClick={clearFilters}
                  variant="outline"
                  className="flex items-center gap-2 border-2 border-red-300 hover:border-red-400 hover:bg-red-50 transition-all duration-200 font-semibold"
                >
                  <X className="w-4 h-4 text-red-600" />
                  <span>Clear Filters</span>
                </Button>
              )}
              <Button 
                onClick={handleAddExam}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
              >
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Create Exam</span>
                <span className="sm:hidden">Create</span>
              </Button>
            </div>
          }
        >
          <div className="text-sm text-gray-600">
            Manage your exams, create new ones, and organize your assessment content.
          </div>
        </PageSection>

        {/* Exams Table */}
        <PageSection 
          title="My Exams"
          description={
            getActiveFiltersCount() > 0 
              ? `Showing ${exams.length} exams with ${getActiveFiltersCount()} active filter${getActiveFiltersCount() > 1 ? 's' : ''}`
              : `All your exams (${exams.length} total)`
          }
          className="mb-2 sm:mb-4"
        >
          <div className="w-full overflow-hidden">
            <ExamDataTable
              exams={exams}
              loading={loading}
              onEdit={handleEditExam}
              onDelete={handleDeleteExam}
              onManageQuestions={handleManageQuestions}
              pagination={pagination}
              onPageChange={handlePageChange}
              variant="table"
            />
          </div>
        </PageSection>

        {/* Floating Action Button for Mobile */}
        <div className="fixed bottom-6 right-6 z-40 sm:hidden">
          <Button
            onClick={handleAddExam}
            size="lg"
            className="rounded-full w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <BookOpen className="w-6 h-6" />
          </Button>
        </div>

        {/* Exam Modal */}
        <ExamModal
          open={showForm}
          exam={editingExam}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          open={showDeleteModal}
          onClose={cancelDeleteExam}
          onConfirm={confirmDeleteExam}
          title="Delete Exam"
          description={`Are you sure you want to delete "${examToDelete?.title}"? This action cannot be undone.`}
          confirmText="Delete Exam"
          cancelText="Cancel"
          variant="danger"
          loading={deleting}
        />

        {/* Advanced Filters Drawer */}
        <Sheet open={showFilterDrawer} onOpenChange={setShowFilterDrawer}>
          <SheetContent side="right" className="w-full sm:max-w-md bg-gradient-to-br from-blue-50 via-white to-purple-50 border-l-2 border-blue-200">
            <SheetHeader className="bg-white/80 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-blue-100 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-blue-600" />
                    Advanced Filters
                  </h3>
                  <p className="text-sm text-gray-600">
                    Filter and sort exams to find exactly what you're looking for
                  </p>
                </div>
              </div>
            </SheetHeader>
            
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {/* Search Input */}
              <div>
                <AttractiveInput
                  type="text"
                  label="Search Exams"
                  placeholder="Search by title, description..."
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  icon="search"
                  variant="default"
                  colorScheme="primary"
                  size="md"
                  helperText="Find exams by typing keywords"
                />
              </div>
              
              {/* Type Filter */}
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-blue-200 shadow-md hover:shadow-lg transition-all duration-200">
                <label className="flex text-sm font-semibold text-foreground mb-2 items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  Exam Type
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="w-full h-10 px-3 py-2 border-2 border-blue-300 hover:border-blue-400 focus:border-blue-500 focus:ring-blue-500/20 focus:shadow-lg focus:shadow-blue-500/10 rounded-lg bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all duration-200 font-medium text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="mcq">Multiple Choice</option>
                  <option value="written">Written/Essay</option>
                  <option value="mixed">Mixed Format</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-green-200 shadow-md hover:shadow-lg transition-all duration-200">
                <label className="flex text-sm font-semibold text-foreground mb-2 items-center gap-2">
                  <Tag className="w-4 h-4 text-green-600" />
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full h-10 px-3 py-2 border-2 border-green-300 hover:border-green-400 focus:border-green-500 focus:ring-green-500/20 focus:shadow-lg focus:shadow-green-500/10 rounded-lg bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all duration-200 font-medium text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Course Filter */}
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-purple-200 shadow-md hover:shadow-lg transition-all duration-200">
                <label className="flex text-sm font-semibold text-foreground mb-2 items-center gap-2">
                  <BookOpen className="w-4 h-4 text-purple-600" />
                  Course
                </label>
                <select
                  value={filters.course}
                  onChange={(e) => handleFilterChange('course', e.target.value)}
                  className="w-full h-10 px-3 py-2 border-2 border-purple-300 hover:border-purple-400 focus:border-purple-500 focus:ring-purple-500/20 focus:shadow-lg focus:shadow-purple-500/10 rounded-lg bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all duration-200 font-medium text-sm"
                >
                  <option value="all">All Courses</option>
                  {courses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Options */}
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-orange-200 shadow-md hover:shadow-lg transition-all duration-200">
                <label className="flex text-sm font-semibold text-foreground mb-2 items-center gap-2">
                  <ArrowUpDown className="w-4 h-4 text-orange-600" />
                  Sort By
                </label>
                <div className="space-y-3">
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="w-full h-10 px-3 py-2 border-2 border-orange-300 hover:border-orange-400 focus:border-orange-500 focus:ring-orange-500/20 focus:shadow-lg focus:shadow-orange-500/10 rounded-lg bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all duration-200 font-medium text-sm"
                  >
                    <option value="createdAt">Date Created</option>
                    <option value="updatedAt">Last Updated</option>
                    <option value="title">Title</option>
                    <option value="totalMarks">Total Marks</option>
                    <option value="duration">Duration</option>
                  </select>
                  <select
                    value={filters.sortOrder}
                    onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                    className="w-full h-10 px-3 py-2 border-2 border-orange-300 hover:border-orange-400 focus:border-orange-500 focus:ring-orange-500/20 focus:shadow-lg focus:shadow-orange-500/10 rounded-lg bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all duration-200 font-medium text-sm"
                  >
                    <option value="desc">Descending</option>
                    <option value="asc">Ascending</option>
                  </select>
                </div>
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
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Apply Filters
                </Button>
              </div>
              <p className="text-xs text-blue-600 text-center font-medium">
                {getActiveFiltersCount() > 0 
                  ? `${getActiveFiltersCount()} filter${getActiveFiltersCount() > 1 ? 's' : ''} active`
                  : 'No filters applied'
                }
              </p>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </main>
    </InstructorRoleShell>
  );
}

export default function InstructorExamsPage() {
  return (
    <InstructorPageWrapper>
      <InstructorExamsPageContent />
    </InstructorPageWrapper>
  );
}
