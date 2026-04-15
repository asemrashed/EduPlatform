'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminRoleShell } from '@/components/role-area/AdminRoleShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { AttractiveInput } from '@/components/ui/attractive-input';
import DataTable, { Column, Action } from '@/components/ui/data-table';
import QuestionModal from '@/components/QuestionModal';
import CSVUploadModal from '@/components/CSVUploadModal';
import QuestionViewModal from '@/components/QuestionViewModal';
import ConfirmModal from '@/components/ui/confirm-modal';
import PageSection from '@/components/PageSection';
import WelcomeSection from '@/components/WelcomeSection';
import AdminPageWrapper from '@/components/AdminPageWrapper';
import { LuPlus as Plus, LuSearch as Search, LuFilter as Filter, LuBookOpen as BookOpen, LuTag as Tag, LuClock as Clock, LuTarget as Target, LuPencil as Edit, LuTrash2 as Trash2, LuEye as Eye, LuUpload as Upload, LuDatabase, LuFileText as LuFileText, LuCheck as CheckCircle, LuX as XCircle, LuSettings as Settings, LuX as X } from 'react-icons/lu';;
import { format } from 'date-fns';
import { Question as QuestionType } from '@/types/exam';

type Question = QuestionType;

interface Exam {
  _id: string;
  title: string;
  course?: {
    title: string;
  };
}

function QuestionBankPageContent() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<Question | null>(null);
  const [deletingQuestion, setDeletingQuestion] = useState(false);
  const [showCSVUpload, setShowCSVUpload] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingQuestion, setViewingQuestion] = useState<Question | null>(null);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    page: 1,
    limit: 10,
    type: 'all' as 'mcq' | 'written' | 'true_false' | 'fill_blank' | 'essay' | 'all',
    difficulty: 'all' as 'easy' | 'medium' | 'hard' | 'all',
    status: 'all' as 'active' | 'inactive' | 'all',
    sortBy: 'createdAt' as 'question' | 'createdAt' | 'updatedAt' | 'marks' | 'type',
    sortOrder: 'desc' as 'asc' | 'desc'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [stats, setStats] = useState({
    totalQuestions: 0,
    activeQuestions: 0,
    mcqQuestions: 0,
    totalMarks: 0,
    byType: {},
    byDifficulty: {},
    byStatus: {}
  });

  // Fetch questions
  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: filters.page.toString(),
        limit: filters.limit.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.type !== 'all' && { type: filters.type }),
        ...(filters.difficulty !== 'all' && { difficulty: filters.difficulty }),
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.sortBy && { sortBy: filters.sortBy }),
        ...(filters.sortOrder && { sortOrder: filters.sortOrder }),
      });

      const response = await fetch(`/api/questions?${queryParams}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const questionsData = data.data?.questions || data.questions || [];
        const paginationData = data.data?.pagination || data.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          pages: 0
        };
        const statsData = data.data?.stats || data.stats || {
          totalQuestions: 0,
          activeQuestions: 0,
          mcqQuestions: 0,
          totalMarks: 0,
          byType: {},
          byDifficulty: {},
          byStatus: {}
        };

        setQuestions(questionsData);
        setPagination(paginationData);
        setStats(statsData);
      } else {
        console.error('Failed to fetch questions');
        setQuestions([]);
        setStats({
          totalQuestions: 0,
          activeQuestions: 0,
          mcqQuestions: 0,
          totalMarks: 0,
          byType: {},
          byDifficulty: {},
          byStatus: {}
        });
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      setQuestions([]);
      setStats({
        totalQuestions: 0,
        activeQuestions: 0,
        mcqQuestions: 0,
        totalMarks: 0,
        byType: {},
        byDifficulty: {},
        byStatus: {}
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch exams for CSV upload
  const fetchExams = async () => {
    try {
      const response = await fetch('/api/exams', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const examsData = data.data?.exams || data.exams || [];
        setExams(examsData);
      }
    } catch (error) {
      console.error('Error fetching exams:', error);
    }
  };

  useEffect(() => {
    fetchQuestions();
    fetchExams();
  }, [filters.page, filters.search, filters.type, filters.difficulty, filters.status, filters.sortBy, filters.sortOrder]);

  const handleCreateQuestion = () => {
    setEditingQuestion(null);
    setShowQuestionModal(true);
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setShowQuestionModal(true);
  };

  const handleViewQuestion = (question: Question) => {
    setViewingQuestion(question);
    setShowViewModal(true);
  };

  const handleDeleteQuestion = (question: Question) => {
    setQuestionToDelete(question);
    setShowDeleteConfirm(true);
  };

  const handleQuestionSuccess = () => {
    setShowQuestionModal(false);
    setEditingQuestion(null);
    fetchQuestions();
  };

  const handleCloseModal = () => {
    setShowQuestionModal(false);
    setEditingQuestion(null);
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setViewingQuestion(null);
  };

  const confirmDeleteQuestion = async () => {
    if (!questionToDelete) return;

    try {
      setDeletingQuestion(true);
      const response = await fetch(`/api/questions/${questionToDelete._id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setShowDeleteConfirm(false);
        setQuestionToDelete(null);
        fetchQuestions();
      } else {
        const errorData = await response.json();
        console.error('Error deleting question:', errorData.error);
      }
    } catch (error) {
      console.error('Error deleting question:', error);
    } finally {
      setDeletingQuestion(false);
    }
  };

  const cancelDeleteQuestion = () => {
    if (deletingQuestion) return; // Prevent closing while deleting
    setShowDeleteConfirm(false);
    setQuestionToDelete(null);
  };

  const handleCSVUpload = () => {
    setShowCSVUpload(true);
  };

  const handleCSVSuccess = () => {
    setShowCSVUpload(false);
    fetchQuestions();
  };

  const handleCloseCSVUpload = () => {
    setShowCSVUpload(false);
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, search: value, page: 1 }));
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      page: 1,
      limit: 10,
      type: 'all',
      difficulty: 'all',
      status: 'all',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.type !== 'all') count++;
    if (filters.difficulty !== 'all') count++;
    if (filters.status !== 'all') count++;
    if (filters.sortBy !== 'createdAt') count++;
    if (filters.sortOrder !== 'desc') count++;
    return count;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'mcq':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'written':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'true_false':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'fill_blank':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'essay':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (date: string) => {
    return format(new Date(date), 'MMM dd, yyyy');
  };

  const columns: Column<Question>[] = [
    {
      key: 'question',
      label: 'Question',
      width: 'w-2/5',
      render: (question) => (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-relaxed">
            {question.question}
          </p>
          <div className="flex items-center gap-2">
            <Badge className={getTypeColor(question.type)}>
              {question.type.replace('_', ' ').toUpperCase()}
            </Badge>
            <Badge className={getDifficultyColor(question.difficulty)}>
              {question.difficulty.toUpperCase()}
            </Badge>
          </div>
        </div>
      )
    },
    {
      key: 'marks',
      label: 'Marks',
      width: 'w-1/6',
      render: (question) => (
        <div className="text-center">
          <div className="text-sm font-medium text-gray-900">{question.marks}</div>
        </div>
      )
    },
    {
      key: 'timeLimit',
      label: 'Time Limit',
      width: 'w-1/6',
      render: (question) => (
        <div className="text-center">
          {question.timeLimit ? (
            <div className="text-sm text-gray-600">
              {question.timeLimit}m
            </div>
          ) : (
            <div className="text-sm text-gray-400">No limit</div>
          )}
        </div>
      )
    },
    {
      key: 'options',
      label: 'Options',
      width: 'w-1/6',
      render: (question) => (
        <div className="text-center">
          {question.type === 'mcq' && (
            <div className="text-sm text-gray-600">
              {question.options?.length || 0} options
            </div>
          )}
          {question.type === 'true_false' && (
            <div className="text-sm text-gray-600">
              {question.options?.length || 0} options
            </div>
          )}
          {(question.type === 'written' || question.type === 'essay') && (
            <div className="text-sm text-gray-600">Written</div>
          )}
          {question.type === 'fill_blank' && (
            <div className="text-sm text-gray-600">Fill Blank</div>
          )}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      width: 'w-1/6',
      render: (question) => (
        <div className="text-center">
          <Badge 
            variant={question.isActive ? 'default' : 'secondary'}
            className={question.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
          >
            {question.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      )
    },
    {
      key: 'created',
      label: 'Created',
      width: 'w-1/6',
      render: (question) => (
        <div className="text-sm text-gray-900">
          {formatDate(question.createdAt)}
        </div>
      )
    }
  ];

  const actions: Action<Question>[] = [
    {
      key: 'view',
      label: 'View Details',
      icon: <Eye className="w-4 h-4" />,
      onClick: handleViewQuestion,
      variant: 'secondary' as const
    },
    {
      key: 'edit',
      label: 'Edit Question',
      icon: <Edit className="w-4 h-4" />,
      onClick: handleEditQuestion,
      variant: 'secondary' as const
    },
    {
      key: 'delete',
      label: 'Delete Question',
      icon: <Trash2 className="w-4 h-4" />,
      onClick: handleDeleteQuestion,
      variant: 'destructive' as const
    }
  ];

  const emptyState = {
    title: 'No questions found',
    description: 'Get started by adding questions to your question bank.',
    icon: (
      <svg className="w-10 h-10" style={{ color: '#A855F7' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )
  };

  return (
    <AdminRoleShell>
      <main className="relative z-10 p-2 sm:p-4">
        {/* Welcome Section */}
        <WelcomeSection 
          title="Question Bank"
          description="Manage your question library and create comprehensive question banks"
        />

        {/* Question Statistics */}
        <PageSection 
          title="Question Statistics"
          className="mb-2 sm:mb-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6">
            <Card className="p-4 sm:p-6 rounded-lg border" style={{
              background: "linear-gradient(135deg, rgba(123, 44, 191, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)",
              borderColor: 'rgba(123, 44, 191, 0.2)',
            }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white" style={{
                  background: "linear-gradient(135deg, #EC4899 0%, #A855F7 100%)",
                }}>
                  <LuFileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.totalQuestions}</div>
                  <div className="text-sm text-gray-600">Total Questions</div>
                </div>
              </div>
            </Card>

            <Card className="p-4 sm:p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center text-white">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.activeQuestions}</div>
                  <div className="text-sm text-gray-600">Active Questions</div>
                </div>
              </div>
            </Card>

            <Card className="p-4 sm:p-6 rounded-lg border" style={{
              background: "linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)",
              borderColor: 'rgba(168, 85, 247, 0.2)',
            }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white" style={{
                  background: "linear-gradient(135deg, #7B2CBF 0%, #EC4899 100%)",
                }}>
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.mcqQuestions}</div>
                  <div className="text-sm text-gray-600">MCQ Questions</div>
                </div>
              </div>
            </Card>

            <Card className="p-4 sm:p-6 rounded-lg border" style={{
              background: "linear-gradient(135deg, rgba(255, 107, 53, 0.1) 0%, rgba(255, 140, 90, 0.1) 100%)",
              borderColor: 'rgba(255, 107, 53, 0.2)',
            }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white" style={{
                  backgroundColor: '#FF6B35',
                }}>
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.totalMarks}</div>
                  <div className="text-sm text-gray-600">Total Marks</div>
                </div>
              </div>
            </Card>
          </div>
        </PageSection>

        {/* Filter Actions */}
        <PageSection 
          title="Question Management"
          className="mb-2 sm:mb-4"
        >
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none sm:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search questions..."
                  value={filters.search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>
              <Button
                onClick={() => setShowFilterDrawer(true)}
                variant="outline"
                className="flex items-center gap-2 border-2 transition-all duration-200 font-semibold"
                style={{
                  borderColor: '#7B2CBF',
                  backgroundColor: 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#A855F7';
                  e.currentTarget.style.backgroundColor = 'rgba(123, 44, 191, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#7B2CBF';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <Filter className="w-4 h-4" style={{ color: '#7B2CBF' }} />
                Advanced Filters
                {getActiveFiltersCount() > 0 && (
                  <Badge variant="secondary" className="ml-1 text-white" style={{
                    background: "linear-gradient(135deg, #EC4899 0%, #A855F7 100%)",
                  }}>
                    {getActiveFiltersCount()}
                  </Badge>
                )}
              </Button>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                onClick={handleCSVUpload}
                variant="outline"
                className="flex items-center gap-2 border-2 border-green-300 hover:border-green-400 hover:bg-green-50 transition-all duration-200 font-semibold"
              >
                <Upload className="w-4 h-4 text-green-600" />
                Upload CSV
              </Button>
              <Button
                onClick={handleCreateQuestion}
                className="flex items-center gap-2 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
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
                Add Question
              </Button>
            </div>
          </div>
        </PageSection>

        {/* Questions Table */}
        <PageSection 
          title={
            questions.length === 0 
              ? 'Questions' 
              : `All questions in your question bank (${questions.length} total)`
          }
          className="mb-2 sm:mb-4"
        >
          <div className="w-full overflow-hidden">
            <DataTable
              data={questions}
              columns={columns}
              actions={actions}
              loading={loading}
              emptyState={emptyState}
              pagination={{
                ...pagination,
                onPageChange: handlePageChange
              }}
              variant="table"
            />
          </div>
        </PageSection>

        {/* Question Modal */}
        <QuestionModal
          open={showQuestionModal}
          onClose={handleCloseModal}
          onSuccess={handleQuestionSuccess}
          question={editingQuestion}
          examId="" // No specific exam for question bank
        />

        {/* CSV Upload Modal */}
        <CSVUploadModal
          open={showCSVUpload}
          onClose={handleCloseCSVUpload}
          onSuccess={handleCSVSuccess}
          examId="" // No specific exam for question bank
        />

        {/* Question View Modal */}
        <QuestionViewModal
          open={showViewModal}
          question={viewingQuestion}
          onClose={handleCloseViewModal}
        />

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          open={showDeleteConfirm}
          onClose={cancelDeleteQuestion}
          onConfirm={confirmDeleteQuestion}
          title="Delete Question"
          description="Are you sure you want to delete this question? This action cannot be undone and the question will be permanently removed from the question bank."
          confirmText={deletingQuestion ? "Deleting..." : "Delete Question"}
          cancelText="Cancel"
          loading={deletingQuestion}
        />

        {/* Advanced Filters Drawer */}
        <Sheet open={showFilterDrawer} onOpenChange={setShowFilterDrawer}>
          <SheetContent side="right" className="w-full sm:max-w-md border-l-2" style={{
            backgroundColor: '#FAFAFA',
            borderColor: 'rgba(123, 44, 191, 0.2)',
          }}>
            <SheetHeader className="bg-white rounded-lg p-4 sm:p-6 shadow-sm" style={{
              border: '1px solid rgba(123, 44, 191, 0.1)',
            }}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1 flex items-center gap-2">
                    <Settings className="w-5 h-5" style={{ color: '#7B2CBF' }} />
                    Advanced Filters
                  </h3>
                  <p className="text-sm text-gray-600">
                    Filter and sort questions to find exactly what you're looking for
                  </p>
                </div>
              </div>
            </SheetHeader>
            
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {/* Search Input */}
              <div>
                <AttractiveInput
                  type="text"
                  label="Search Questions"
                  placeholder="Search by question text..."
                  value={filters.search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  icon="search"
                  variant="default"
                  colorScheme="primary"
                  size="md"
                  helperText="Find questions by typing keywords"
                />
              </div>
              
              {/* Type Filter */}
              <div className="bg-white rounded-lg p-3 shadow-md hover:shadow-lg transition-all duration-200" style={{
                border: '1px solid rgba(123, 44, 191, 0.2)',
              }}>
                <label className="flex text-sm font-semibold text-foreground mb-2 items-center gap-2">
                  <BookOpen className="w-4 h-4" style={{ color: '#7B2CBF' }} />
                  Question Type
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="w-full h-10 px-3 py-2 border-2 rounded-lg bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all duration-200 font-medium text-sm"
                  style={{
                    borderColor: '#7B2CBF',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#A855F7'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = '#7B2CBF'}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#A855F7';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(123, 44, 191, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#7B2CBF';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <option value="all">All Types</option>
                  <option value="mcq">Multiple Choice</option>
                  <option value="written">Written/Essay</option>
                  <option value="true_false">True/False</option>
                  <option value="fill_blank">Fill in the Blank</option>
                  <option value="essay">Essay</option>
                </select>
              </div>

              {/* Difficulty Filter */}
              <div className="bg-white rounded-lg p-3 shadow-md hover:shadow-lg transition-all duration-200" style={{
                border: '1px solid rgba(16, 185, 129, 0.2)',
              }}>
                <label className="flex text-sm font-semibold text-foreground mb-2 items-center gap-2">
                  <Target className="w-4 h-4" style={{ color: '#10B981' }} />
                  Difficulty
                </label>
                <select
                  value={filters.difficulty}
                  onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                  className="w-full h-10 px-3 py-2 border-2 rounded-lg bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all duration-200 font-medium text-sm"
                  style={{
                    borderColor: '#10B981',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#14B8A6'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = '#10B981'}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#14B8A6';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#10B981';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <option value="all">All Levels</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="bg-white rounded-lg p-3 shadow-md hover:shadow-lg transition-all duration-200" style={{
                border: '1px solid rgba(168, 85, 247, 0.2)',
              }}>
                <label className="flex text-sm font-semibold text-foreground mb-2 items-center gap-2">
                  <Tag className="w-4 h-4" style={{ color: '#A855F7' }} />
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full h-10 px-3 py-2 border-2 rounded-lg bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all duration-200 font-medium text-sm"
                  style={{
                    borderColor: '#A855F7',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#9333EA'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = '#A855F7'}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#9333EA';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(168, 85, 247, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#A855F7';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Sort Options */}
              <div className="bg-white rounded-lg p-3 shadow-md hover:shadow-lg transition-all duration-200" style={{
                border: '1px solid rgba(255, 107, 53, 0.2)',
              }}>
                <label className="flex text-sm font-semibold text-foreground mb-2 items-center gap-2">
                  <Clock className="w-4 h-4" style={{ color: '#FF6B35' }} />
                  Sort By
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="w-full h-10 px-3 py-2 border-2 rounded-lg bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all duration-200 font-medium text-sm"
                  style={{
                    borderColor: '#FF6B35',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#FF8C5A'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = '#FF6B35'}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#FF8C5A';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255, 107, 53, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#FF6B35';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <option value="createdAt">Created Date</option>
                  <option value="question">Question Text</option>
                  <option value="marks">Marks</option>
                  <option value="type">Type</option>
                  <option value="updatedAt">Updated Date</option>
                </select>
              </div>

              <div className="bg-white rounded-lg p-3 shadow-md hover:shadow-lg transition-all duration-200" style={{
                border: '1px solid rgba(255, 107, 53, 0.2)',
              }}>
                <label className="flex text-sm font-semibold text-foreground mb-2 items-center gap-2">
                  <Clock className="w-4 h-4" style={{ color: '#FF6B35' }} />
                  Sort Order
                </label>
                <select
                  value={filters.sortOrder}
                  onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                  className="w-full h-10 px-3 py-2 border-2 rounded-lg bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all duration-200 font-medium text-sm"
                  style={{
                    borderColor: '#FF6B35',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#FF8C5A'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = '#FF6B35'}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#FF8C5A';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255, 107, 53, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#FF6B35';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
              </div>
            </div>

            <SheetFooter className="flex flex-col gap-2 bg-white rounded-lg p-4 sm:p-6 shadow-sm" style={{
              border: '1px solid rgba(123, 44, 191, 0.1)',
            }}>
              <div className="flex gap-2 w-full">
                <Button 
                  onClick={clearFilters}
                  variant="outline"
                  className="flex-1 border-2 transition-all duration-200 font-semibold"
                  style={{
                    borderColor: '#EF4444',
                    backgroundColor: 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#DC2626';
                    e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#EF4444';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <X className="w-4 h-4 mr-2" style={{ color: '#EF4444' }} />
                  Clear All
                </Button>
                <Button 
                  onClick={() => setShowFilterDrawer(false)}
                  className="flex-1 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
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
                  Apply Filters
                </Button>
              </div>
              <p className="text-xs text-center font-medium" style={{ color: '#7B2CBF' }}>
                {getActiveFiltersCount() > 0 
                  ? `${getActiveFiltersCount()} filter${getActiveFiltersCount() > 1 ? 's' : ''} active`
                  : 'No filters applied'
                }
              </p>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </main>
    </AdminRoleShell>
  );
}

export default function QuestionBankPage() {
  return (
    <AdminPageWrapper>
      <QuestionBankPageContent />
    </AdminPageWrapper>
  );
}
