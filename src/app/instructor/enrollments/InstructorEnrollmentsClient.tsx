'use client';

import { useState, useEffect } from 'react';
import { useAppSelector } from '@/lib/hooks';
import { AdminRoleShell } from '@/components/role-area/AdminRoleShell';
import EnrollmentDataTable from '@/components/EnrollmentDataTable';
import EnrollmentModal from '@/components/EnrollmentModal';
import EnrollmentStats from '@/components/EnrollmentStats';
import PageSection from '@/components/PageSection';
import WelcomeSection from '@/components/WelcomeSection';
import ConfirmModal from '@/components/ui/confirm-modal';
import InstructorPageWrapper from '@/components/InstructorPageWrapper';
import { Enrollment, EnrollmentFilters as EnrollmentFiltersType } from '@/types/enrollment';
import { Button } from '@/components/ui/button';
import { AttractiveInput } from '@/components/ui/attractive-input';
import { LuPlus as Plus, LuSearch as Search, LuX as X, LuUser as User, LuBookOpen as BookOpen, LuCalendar as Calendar, LuDollarSign as DollarSign, LuTrendingUp as TrendingUp } from 'react-icons/lu';;
import { InstructorRoleShell } from '@/components/role-area/InstructorRoleShell';

function InstructorEnrollmentsPageContent() {
  const { user } = useAppSelector((state) => state.auth);
  
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
    hasNext: false,
    hasPrev: false
  });
  const [stats, setStats] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingEnrollment, setEditingEnrollment] = useState<Enrollment | null>(null);
  const [search, setSearch] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [enrollmentToDelete, setEnrollmentToDelete] = useState<Enrollment | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    page: 1,
    limit: 10
  });

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        page: filters.page.toString(),
        limit: filters.limit.toString(),
        instructor: (user as any)?._id || '', // Filter by current instructor
        ...(filters.search && { search: filters.search }),
      });

      const response = await fetch(`/api/instructor/enrollments?${queryParams}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const enrollmentsData = data.data?.enrollments || data.enrollments || [];
        const paginationData = data.data?.pagination || data.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          pages: 0,
          hasNext: false,
          hasPrev: false
        };
        const statsData = data.data?.stats || data.stats || null;

        setEnrollments(enrollmentsData);
        setPagination(paginationData);
        setStats(statsData);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch enrollments');
        setEnrollments([]);
        setStats(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch enrollments');
      setEnrollments([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if ((user as any)?._id) {
      fetchEnrollments();
    }
  }, [filters, (user as any)?._id]);

  const handleSearchChange = (searchValue: string) => {
    setSearch(searchValue);
    setFilters(prev => ({ ...prev, search: searchValue, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleAddEnrollment = () => {
    setEditingEnrollment(null);
    setShowForm(true);
  };

  const handleViewEnrollment = (enrollment: Enrollment) => {
    setEditingEnrollment(enrollment);
    setShowForm(true);
  };

  const handleEditEnrollment = (enrollment: Enrollment) => {
    setEditingEnrollment(enrollment);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingEnrollment(null);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingEnrollment(null);
    fetchEnrollments();
  };

  const handleDeleteEnrollment = (enrollment: Enrollment) => {
    setEnrollmentToDelete(enrollment);
    setShowDeleteModal(true);
  };

  const confirmDeleteEnrollment = async () => {
    if (!enrollmentToDelete) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/instructor/enrollments/${enrollmentToDelete._id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        fetchEnrollments();
        setShowDeleteModal(false);
        setEnrollmentToDelete(null);
      } else {
        const errorData = await response.json();
        console.error('Failed to delete enrollment:', errorData.error);
      }
    } catch (error) {
      console.error('Error deleting enrollment:', error);
    } finally {
      setDeleting(false);
    }
  };

  const cancelDeleteEnrollment = () => {
    setShowDeleteModal(false);
    setEnrollmentToDelete(null);
  };

  const createEnrollment = async (enrollmentData: any): Promise<Enrollment | null> => {
    try {
      const response = await fetch('/api/instructor/enrollments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(enrollmentData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create enrollment');
      }

      return data.data;
    } catch (err) {
      console.error('Error creating enrollment:', err);
      return null;
    }
  };

  const updateEnrollment = async (id: string, enrollmentData: any): Promise<Enrollment | null> => {
    try {
      const response = await fetch(`/api/instructor/enrollments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(enrollmentData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update enrollment');
      }

      return data.data;
    } catch (err) {
      console.error('Error updating enrollment:', err);
      return null;
    }
  };

  return (
    <InstructorRoleShell>
      <main className="relative z-10 p-2 sm:p-4">
        {/* Welcome Section */}
        <WelcomeSection 
          title="Enrollment Management"
          description="Manage student enrollments for your courses"
        />

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <div className="text-red-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading enrollments</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Enrollment Statistics */}
        <PageSection 
          title="Enrollment Statistics"
          className="mb-2 sm:mb-4"
        >
          <EnrollmentStats enrollments={enrollments} loading={loading} stats={stats} />
        </PageSection>

        {/* Enrollments Table */}
        <PageSection 
          title="Enrollments"
          description="Manage student enrollments for your courses"
          className="mb-2 sm:mb-4"
          actions={
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <AttractiveInput
                    type="text"
                    placeholder="Search enrollments..."
                    value={search}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    icon="search"
                    variant="default"
                    colorScheme="primary"
                    size="md"
                    className="pl-10"
                  />
                </div>
              </div>
              <Button
                onClick={handleAddEnrollment}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Enrollment</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </div>
          }
        >
          <div className="w-full overflow-hidden">
            <EnrollmentDataTable
              enrollments={enrollments}
              loading={loading}
              onView={handleViewEnrollment}
              onEdit={handleEditEnrollment}
              onDelete={handleDeleteEnrollment}
              pagination={pagination}
              onPageChange={handlePageChange}
              variant="table"
            />
          </div>
        </PageSection>

        {/* Floating Action Button for Mobile */}
        <div className="fixed bottom-6 right-6 z-40 sm:hidden">
          <Button
            onClick={handleAddEnrollment}
            size="lg"
            className="rounded-full w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="w-6 h-6" />
          </Button>
        </div>

        {/* Enrollment Modal */}
        <EnrollmentModal
          open={showForm}
          enrollment={editingEnrollment}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
          createEnrollment={createEnrollment}
          updateEnrollment={updateEnrollment}
        />

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          open={showDeleteModal}
          onClose={cancelDeleteEnrollment}
          onConfirm={confirmDeleteEnrollment}
          title="Delete Enrollment"
          description={`Are you sure you want to delete this enrollment? This action cannot be undone.`}
          confirmText="Delete Enrollment"
          cancelText="Cancel"
          variant="danger"
          loading={deleting}
        />
      </main>
    </InstructorRoleShell>
  );
}

export default function InstructorEnrollmentsPage() {
  return (
    <InstructorPageWrapper>
      <InstructorEnrollmentsPageContent />
    </InstructorPageWrapper>
  );
}
