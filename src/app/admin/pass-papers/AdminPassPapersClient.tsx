'use client';

import { useState, useEffect } from 'react';
import { useMockSession } from '@/lib/mockSession';
import { AdminRoleShell } from '@/components/role-area/AdminRoleShell';
import PassPaperDataTable from '@/components/PassPaperDataTable';
import PassPaperStats from '@/components/PassPaperStats';
import PassPaperModal from '@/components/PassPaperModal';
import PageSection from '@/components/PageSection';
import PageGrid from '@/components/PageGrid';
import WelcomeSection from '@/components/WelcomeSection';
import ConfirmModal from '@/components/ui/confirm-modal';
import AdminPageWrapper from '@/components/AdminPageWrapper';
import { PassPaper, PassPaperFilters as PassPaperFiltersType } from '@/types/pass-paper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LuPlus as Plus, LuSearch as Search, LuX as X, LuFileText as LuFileText } from 'react-icons/lu';;

function PassPapersPageContent() {
  const { data: session } = useMockSession();
  
  const [passPapers, setPassPapers] = useState<PassPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPaper, setEditingPaper] = useState<PassPaper | null>(null);
  const [search, setSearch] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [paperToDelete, setPaperToDelete] = useState<PassPaper | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    page: 1,
    limit: 10
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    fetchPassPapers();
  }, [filters.page, filters.limit, filters.search]);

  const fetchPassPapers = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: filters.page.toString(),
        limit: filters.limit.toString(),
        ...(filters.search && { search: filters.search })
      });

      const response = await fetch(`/api/pass-papers?${queryParams}`);
      const data = await response.json();

      if (response.ok) {
        setPassPapers(data.passPapers);
        setPagination(data.pagination);
      } else {
        console.error('Failed to fetch pass papers:', data.error);
      }
    } catch (error) {
      console.error('Error fetching pass papers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (searchValue: string) => {
    setSearch(searchValue);
    setFilters(prev => ({ ...prev, search: searchValue, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleAddPassPaper = () => {
    setEditingPaper(null);
    setShowForm(true);
  };

  const handleQuickSearch = () => {
    // Focus on the search input in the filters section
    const searchInput = document.querySelector('input[placeholder*="Search pass papers"]') as HTMLInputElement;
    if (searchInput) {
      searchInput.focus();
    }
  };

  const handleEditPassPaper = (paper: PassPaper) => {
    setEditingPaper(paper);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingPaper(null);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingPaper(null);
    fetchPassPapers();
  };

  const handleDeletePassPaper = (paper: PassPaper) => {
    setPaperToDelete(paper);
    setShowDeleteModal(true);
  };

  const confirmDeletePassPaper = async () => {
    if (!paperToDelete) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/pass-papers/${paperToDelete._id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Pass paper deleted successfully');
        fetchPassPapers();
        setShowDeleteModal(false);
        setPaperToDelete(null);
      } else {
        console.error('Failed to delete pass paper:', data.error);
      }
    } catch (error) {
      console.error('Error deleting pass paper:', error);
    } finally {
      setDeleting(false);
    }
  };

  const cancelDeletePassPaper = () => {
    setShowDeleteModal(false);
    setPaperToDelete(null);
  };


  return (
    <AdminRoleShell>
      <main className="relative z-10 p-2 sm:p-4">
        {/* Welcome Section */}
        <WelcomeSection 
          title="Pass Papers Management"
          description="Manage question papers, marks PDFs, and work solutions"
        />

        {/* Pass Paper Statistics */}
        <PageSection 
          title="Pass Paper Statistics"
          className="mb-2 sm:mb-4"
        >
          <PassPaperStats passPapers={passPapers} loading={loading} />
        </PageSection>

        {/* Pass Papers Table */}
        <PageSection 
          title="Pass Papers"
          description="Complete list of all pass papers in the system"
          className="mb-2 sm:mb-4"
          actions={
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search pass papers..."
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10 pr-10 w-full sm:w-64"
                  disabled={loading}
                />
                {search && (
                  <button
                    onClick={() => handleSearchChange('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <Button 
                onClick={handleAddPassPaper}
                className="flex items-center gap-2 text-white w-full sm:w-auto transition-all duration-200"
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
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Pass Paper</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </div>
          }
        >
          <div className="w-full overflow-hidden">
            <PassPaperDataTable
              passPapers={passPapers}
              loading={loading}
              onEdit={handleEditPassPaper}
              onDelete={handleDeletePassPaper}
              pagination={pagination}
              onPageChange={handlePageChange}
              variant="table"
            />
          </div>
        </PageSection>

        {/* Floating Action Button for Mobile */}
        <div className="fixed bottom-6 right-6 z-40 sm:hidden">
          <Button
            onClick={handleAddPassPaper}
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

        {/* Pass Paper Modal */}
        <PassPaperModal
          open={showForm}
          passPaper={editingPaper}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          open={showDeleteModal}
          onClose={cancelDeletePassPaper}
          onConfirm={confirmDeletePassPaper}
          title="Delete Pass Paper"
          description={`Are you sure you want to delete "${paperToDelete?.sessionName} - ${paperToDelete?.subject}"? This action cannot be undone.`}
          confirmText="Delete Pass Paper"
          cancelText="Cancel"
          variant="danger"
          loading={deleting}
        />
      </main>
    </AdminRoleShell>
  );
}

export default function PassPapersPage() {
  return (
    <AdminPageWrapper>
      <PassPapersPageContent />
    </AdminPageWrapper>
  );
}
