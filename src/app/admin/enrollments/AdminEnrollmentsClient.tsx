'use client';

import { useState, useEffect } from 'react';
import { useAppSelector } from '@/lib/hooks';
import { useEnrollments } from '@/hooks/useEnrollments';
import { AdminRoleShell } from '@/components/role-area/AdminRoleShell';
import EnrollmentDataTable from '@/components/EnrollmentDataTable';
import EnrollmentModal from '@/components/EnrollmentModal';
import EnrollmentStats from '@/components/EnrollmentStats';
import PageSection from '@/components/PageSection';
import PageGrid from '@/components/PageGrid';
import WelcomeSection from '@/components/WelcomeSection';
import ConfirmModal from '@/components/ui/confirm-modal';
import AdminPageWrapper from '@/components/AdminPageWrapper';
import { Enrollment, EnrollmentFilters as EnrollmentFiltersType } from '@/types/enrollment';
import { Button } from '@/components/ui/button';
import { AttractiveInput } from '@/components/ui/attractive-input';
import { LuPlus as Plus, LuSearch as Search, LuX as X } from 'react-icons/lu';;

function EnrollmentsPageContent() {
  const { user } = useAppSelector((state) => state.auth);
  
  // Use the enrollments hook
  const {
    enrollments,
    loading,
    error,
    pagination,
    stats,
    fetchEnrollments,
    createEnrollment,
    updateEnrollment,
    deleteEnrollment
  } = useEnrollments();
  
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

  useEffect(() => {
    fetchEnrollments(filters);
  }, [filters, fetchEnrollments]);


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

  const handleQuickSearch = () => {
    // Focus on the search input in the filters section
    const searchInput = document.querySelector('input[placeholder*="Search enrollments"]') as HTMLInputElement;
    if (searchInput) {
      searchInput.focus();
    }
  };

  const handleViewEnrollment = (enrollment: Enrollment) => {
    // For now, we'll just edit the enrollment when viewing
    // In the future, you might want to create a separate view modal
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
    // The hook will automatically refresh the data after create/update
  };

  const handleDeleteEnrollment = (enrollment: Enrollment) => {
    setEnrollmentToDelete(enrollment);
    setShowDeleteModal(true);
  };

  const confirmDeleteEnrollment = async () => {
    if (!enrollmentToDelete) return;

    setDeleting(true);
    try {
      const success = await deleteEnrollment(enrollmentToDelete._id);
      if (success) {
        console.log('Enrollment deleted successfully');
        setShowDeleteModal(false);
        setEnrollmentToDelete(null);
      } else {
        console.error('Failed to delete enrollment');
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


  return (
    <AdminRoleShell>
      <main className="relative z-10 p-2 sm:p-4">
        {/* Welcome Section */}
        <WelcomeSection 
          title="Enrollment Management"
          description="Manage student enrollments and track course progress"
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
          description="Complete list of all student enrollments in the system"
          className="mb-2 sm:mb-4"
          actions={
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <div className="flex-1 min-w-0">
                <AttractiveInput
                  placeholder="Search enrollments..."
                  value={search}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearchChange(e.target.value)}
                  icon={<Search className="w-5 h-5" />}
                  rightAddon={search ? (
                    <button
                      type="button"
                      onClick={() => handleSearchChange('')}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  ) : undefined}
                  variant="default"
                  colorScheme="primary"
                  size="lg"
                  disabled={loading}
                  className="w-full sm:w-64 h-12"
                />
              </div>
              <Button 
                onClick={handleAddEnrollment}
                size="lg"
                className="flex items-center gap-2 text-white w-full sm:w-auto h-12 px-6 transition-all duration-200"
                style={{
                  background: "linear-gradient(135deg, #EC4899 0%, #A855F7 100%)",
                  boxShadow: "0 4px 15px rgba(236, 72, 153, 0.3)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "linear-gradient(135deg, #DB2777 0%, #9333EA 100%)";
                  e.currentTarget.style.boxShadow = "0 6px 20px rgba(236, 72, 153, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "linear-gradient(135deg, #EC4899 0%, #A855F7 100%)";
                  e.currentTarget.style.boxShadow = "0 4px 15px rgba(236, 72, 153, 0.3)";
                }}
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline font-semibold">Add Enrollment</span>
                <span className="sm:hidden font-semibold">Add</span>
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
            className="rounded-full w-14 h-14 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            style={{
              background: "linear-gradient(135deg, #EC4899 0%, #A855F7 100%)",
              boxShadow: "0 4px 15px rgba(236, 72, 153, 0.3)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "linear-gradient(135deg, #DB2777 0%, #9333EA 100%)";
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(236, 72, 153, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "linear-gradient(135deg, #EC4899 0%, #A855F7 100%)";
              e.currentTarget.style.boxShadow = "0 4px 15px rgba(236, 72, 153, 0.3)";
            }}
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
    </AdminRoleShell>
  );
}

export default function EnrollmentsPage() {
  return (
    <AdminPageWrapper>
      <EnrollmentsPageContent />
    </AdminPageWrapper>
  );
}
