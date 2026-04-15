'use client';

import { useState, useEffect } from 'react';
import { useAppSelector } from '@/lib/hooks';
import { InstructorRoleShell } from '@/components/role-area/InstructorRoleShell';
import PageSection from '@/components/PageSection';
import WelcomeSection from '@/components/WelcomeSection';
import ConfirmModal from '@/components/ui/confirm-modal';
import InstructorPageWrapper from '@/components/InstructorPageWrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AttractiveInput } from '@/components/ui/attractive-input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { LuSearch as Search, LuX as X, LuStar as Star, LuFilter as Filter, LuEye as Eye, LuEyeOff as EyeOff, LuCheck as Check, LuX as XCircle, LuTrash2 as Trash2, LuThumbsUp as ThumbsUp, LuFlag as Flag, LuUser as User, LuBookOpen as BookOpen, LuCalendar as Calendar, LuArrowUpDown as ArrowUpDown, LuSettings as Settings } from 'react-icons/lu';
import { CourseReview, ReviewFilters as ReviewFiltersType } from '@/types/course-review';

function InstructorReviewsPageContent() {
  const { user } = useAppSelector((state) => state.auth);
  
  const [reviews, setReviews] = useState<CourseReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<CourseReview | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    page: 1,
    limit: 20,
    course: 'all',
    student: 'all',
    rating: 'all',
    isApproved: 'all',
    isPublic: 'all',
    reportedCount: 'all',
    sortBy: 'createdAt' as 'createdAt' | 'rating' | 'helpfulVotes',
    sortOrder: 'desc' as 'asc' | 'desc'
  });
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [courses, setCourses] = useState<Array<{_id: string, title: string}>>([]);
  const [students, setStudents] = useState<Array<{_id: string, firstName: string, lastName: string}>>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [stats, setStats] = useState({
    totalReviews: 0,
    approvedReviews: 0,
    pendingReviews: 0,
    reportedReviews: 0,
    averageRating: 0
  });

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: filters.page.toString(),
        limit: filters.limit.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.course !== 'all' && { course: filters.course }),
        ...(filters.student !== 'all' && { student: filters.student }),
        ...(filters.rating !== 'all' && { rating: filters.rating }),
        ...(filters.isApproved !== 'all' && { isApproved: filters.isApproved }),
        ...(filters.isPublic !== 'all' && { isPublic: filters.isPublic }),
        ...(filters.reportedCount !== 'all' && { reportedCount: filters.reportedCount }),
        ...(filters.sortBy && { sortBy: filters.sortBy }),
        ...(filters.sortOrder && { sortOrder: filters.sortOrder }),
      });

      // For instructors, we'll filter reviews for their courses only
      const response = await fetch(`/api/admin/course-reviews?${queryParams}`);
      const data = await response.json();

      if (response.ok) {
        // Filter reviews to only show those for instructor's courses
        const instructorCourses = courses.map(c => c._id);
        const filteredReviews = (data.data.reviews || []).filter((review: CourseReview) => {
          const courseId = typeof review.course === 'string' ? review.course : review.course._id;
          return instructorCourses.includes(courseId);
        });
        
        setReviews(filteredReviews);
        setPagination({
          ...data.data.pagination,
          total: filteredReviews.length
        });
      } else {
        console.error('Failed to fetch reviews:', data.error);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/instructor/courses?limit=100');
      const data = await response.json();
      if (response.ok) {
        setCourses(data.data.courses || []);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/users?role=student&limit=100');
      const data = await response.json();
      if (response.ok) {
        setStudents(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/course-reviews');
      const data = await response.json();
      if (response.ok) {
        const allReviews = data.data.reviews || [];
        const instructorCourses = courses.map(c => c._id);
        const instructorReviews = allReviews.filter((r: CourseReview) => {
          const courseId = typeof r.course === 'string' ? r.course : r.course._id;
          return instructorCourses.includes(courseId);
        });
        
        const total = instructorReviews.length;
        const approved = instructorReviews.filter((r: CourseReview) => r.isApproved).length;
        const pending = total - approved;
        const reported = instructorReviews.filter((r: CourseReview) => r.reportedCount > 0).length;
        const avgRating = instructorReviews.length > 0 
          ? instructorReviews.reduce((sum: number, r: CourseReview) => sum + r.rating, 0) / instructorReviews.length 
          : 0;

        setStats({
          totalReviews: total,
          approvedReviews: approved,
          pendingReviews: pending,
          reportedReviews: reported,
          averageRating: Math.round(avgRating * 10) / 10
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [filters, courses]);

  useEffect(() => {
    fetchCourses();
    fetchStudents();
  }, []);

  useEffect(() => {
    if (courses.length > 0) {
      fetchStats();
    }
  }, [courses]);

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

  const handleModerateReview = async (reviewId: string, action: string) => {
    try {
      const response = await fetch(`/api/admin/course-reviews/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log(`Review ${action} successfully`);
        fetchReviews();
        fetchStats();
      } else {
        console.error(`Failed to ${action} review:`, data.error);
      }
    } catch (error) {
      console.error(`Error ${action} review:`, error);
    }
  };

  const handleDeleteReview = (review: CourseReview) => {
    setReviewToDelete(review);
    setShowDeleteModal(true);
  };

  const confirmDeleteReview = async () => {
    if (!reviewToDelete) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/admin/course-reviews/${reviewToDelete._id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Review deleted successfully');
        fetchReviews();
        fetchStats();
        setShowDeleteModal(false);
        setReviewToDelete(null);
      } else {
        console.error('Failed to delete review:', data.error);
      }
    } catch (error) {
      console.error('Error deleting review:', error);
    } finally {
      setDeleting(false);
    }
  };

  const cancelDeleteReview = () => {
    setShowDeleteModal(false);
    setReviewToDelete(null);
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
      limit: 20,
      course: 'all',
      student: 'all',
      rating: 'all',
      isApproved: 'all',
      isPublic: 'all',
      reportedCount: 'all',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    setSearch('');
    setShowFilterDrawer(false);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.course !== 'all') count++;
    if (filters.student !== 'all') count++;
    if (filters.rating !== 'all') count++;
    if (filters.isApproved !== 'all') count++;
    if (filters.isPublic !== 'all') count++;
    if (filters.reportedCount !== 'all') count++;
    if (filters.sortBy !== 'createdAt') count++;
    if (filters.sortOrder !== 'desc') count++;
    return count;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <InstructorRoleShell>
      <main className="relative z-10 p-2 sm:p-4">
        {/* Welcome Section */}
        <WelcomeSection 
          title="Course Reviews"
          description="View and manage reviews for your courses"
        />

        {/* Review Statistics */}
        <PageSection 
          title="Review Statistics"
          className="mb-2 sm:mb-4"
        >
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Reviews</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalReviews}</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Star className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-green-600">{stats.approvedReviews}</p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pendingReviews}</p>
                </div>
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Eye className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Reported</p>
                  <p className="text-2xl font-bold text-red-600">{stats.reportedReviews}</p>
                </div>
                <div className="p-2 bg-red-100 rounded-lg">
                  <Flag className="w-5 h-5 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.averageRating}</p>
                </div>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Star className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        </PageSection>

        {/* Filter Actions */}
        <PageSection 
          title="Review Management"
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
            </div>
          }
        >
          <div className="text-sm text-gray-600">
            View and moderate reviews for your courses. You can approve, hide, or delete reviews as needed.
          </div>
        </PageSection>

        {/* Reviews Table */}
        <PageSection 
          title="Course Reviews"
          description={
            getActiveFiltersCount() > 0 
              ? `Showing ${reviews.length} reviews with ${getActiveFiltersCount()} active filter${getActiveFiltersCount() > 1 ? 's' : ''}`
              : `Reviews for your courses (${reviews.length} total)`
          }
          className="mb-2 sm:mb-4"
        >
          <div className="w-full overflow-hidden">
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 animate-pulse">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                      </div>
                      <div className="h-8 bg-gray-300 rounded w-20"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review._id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center">
                            {renderStars(review.rating)}
                          </div>
                          <span className="text-sm text-gray-500">({review.rating}/5)</span>
                          <div className="flex items-center gap-2">
                            {review.isApproved ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <Check className="w-3 h-3 mr-1" />
                                Approved
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                <Eye className="w-3 h-3 mr-1" />
                                Pending
                              </span>
                            )}
                            {review.isPublic ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                <Eye className="w-3 h-3 mr-1" />
                                Public
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                <EyeOff className="w-3 h-3 mr-1" />
                                Private
                              </span>
                            )}
                            {review.reportedCount > 0 && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                <Flag className="w-3 h-3 mr-1" />
                                Reported ({review.reportedCount})
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {review.title && (
                          <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
                        )}
                        
                        {review.comment && (
                          <p className="text-gray-700 mb-3">{review.comment}</p>
                        )}
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>{review.student.firstName} {review.student.lastName}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <BookOpen className="w-4 h-4" />
                            <span>{typeof review.course === 'string' ? 'Course' : review.course.title}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="w-4 h-4" />
                            <span>{review.helpfulVotes} helpful</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        {!review.isApproved && (
                          <Button
                            size="sm"
                            onClick={() => handleModerateReview(review._id, 'approve')}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                        )}
                        {review.isApproved && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleModerateReview(review._id, 'disapprove')}
                            className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Disapprove
                          </Button>
                        )}
                        {review.isPublic ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleModerateReview(review._id, 'make_private')}
                            className="border-gray-500 text-gray-600 hover:bg-gray-50"
                          >
                            <EyeOff className="w-4 h-4 mr-1" />
                            Hide
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleModerateReview(review._id, 'make_public')}
                            className="border-blue-500 text-blue-600 hover:bg-blue-50"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Show
                          </Button>
                        )}
                        {review.reportedCount > 0 && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleModerateReview(review._id, 'reset_reports')}
                            className="border-purple-500 text-purple-600 hover:bg-purple-50"
                          >
                            <Flag className="w-4 h-4 mr-1" />
                            Reset Reports
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteReview(review)}
                          className="border-red-500 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {reviews.length === 0 && !loading && (
                  <div className="text-center py-8">
                    <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews found</h3>
                    <p className="text-gray-500">No reviews match your current filters or you don't have any reviews yet.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </PageSection>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <PageSection className="mb-2 sm:mb-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} reviews
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-500">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.pages}
                >
                  Next
                </Button>
              </div>
            </div>
          </PageSection>
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          open={showDeleteModal}
          onClose={cancelDeleteReview}
          onConfirm={confirmDeleteReview}
          title="Delete Review"
          description={`Are you sure you want to delete this review? This action cannot be undone.`}
          confirmText="Delete Review"
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
                    Filter and sort reviews to find exactly what you're looking for
                  </p>
                </div>
              </div>
            </SheetHeader>
            
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {/* Search Input */}
              <div>
                <AttractiveInput
                  type="text"
                  label="Search Reviews"
                  placeholder="Search by title, comment, or student name..."
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  icon="search"
                  variant="default"
                  colorScheme="primary"
                  size="md"
                  helperText="Find reviews by typing keywords"
                />
              </div>
              
              {/* Course Filter */}
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-blue-200 shadow-md hover:shadow-lg transition-all duration-200">
                <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  Course
                </label>
                <select
                  value={filters.course}
                  onChange={(e) => handleFilterChange('course', e.target.value)}
                  className="w-full h-10 px-3 py-2 border-2 border-blue-300 hover:border-blue-400 focus:border-blue-500 focus:ring-blue-500/20 focus:shadow-lg focus:shadow-blue-500/10 rounded-lg bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all duration-200 font-medium text-sm"
                >
                  <option value="all">All Courses</option>
                  {courses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Student Filter */}
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-green-200 shadow-md hover:shadow-lg transition-all duration-200">
                <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <User className="w-4 h-4 text-green-600" />
                  Student
                </label>
                <select
                  value={filters.student}
                  onChange={(e) => handleFilterChange('student', e.target.value)}
                  className="w-full h-10 px-3 py-2 border-2 border-green-300 hover:border-green-400 focus:border-green-500 focus:ring-green-500/20 focus:shadow-lg focus:shadow-green-500/10 rounded-lg bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all duration-200 font-medium text-sm"
                >
                  <option value="all">All Students</option>
                  {students.map((student) => (
                    <option key={student._id} value={student._id}>
                      {student.firstName} {student.lastName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rating Filter */}
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-purple-200 shadow-md hover:shadow-lg transition-all duration-200">
                <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Star className="w-4 h-4 text-purple-600" />
                  Rating
                </label>
                <select
                  value={filters.rating}
                  onChange={(e) => handleFilterChange('rating', e.target.value)}
                  className="w-full h-10 px-3 py-2 border-2 border-purple-300 hover:border-purple-400 focus:border-purple-500 focus:ring-purple-500/20 focus:shadow-lg focus:shadow-purple-500/10 rounded-lg bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all duration-200 font-medium text-sm"
                >
                  <option value="all">All Ratings</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
              </div>

              {/* Approval Status Filter */}
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-orange-200 shadow-md hover:shadow-lg transition-all duration-200">
                <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Check className="w-4 h-4 text-orange-600" />
                  Approval Status
                </label>
                <select
                  value={filters.isApproved}
                  onChange={(e) => handleFilterChange('isApproved', e.target.value)}
                  className="w-full h-10 px-3 py-2 border-2 border-orange-300 hover:border-orange-400 focus:border-orange-500 focus:ring-orange-500/20 focus:shadow-lg focus:shadow-orange-500/10 rounded-lg bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all duration-200 font-medium text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="true">Approved</option>
                  <option value="false">Pending</option>
                </select>
              </div>

              {/* Visibility Filter */}
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-indigo-200 shadow-md hover:shadow-lg transition-all duration-200">
                <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-indigo-600" />
                  Visibility
                </label>
                <select
                  value={filters.isPublic}
                  onChange={(e) => handleFilterChange('isPublic', e.target.value)}
                  className="w-full h-10 px-3 py-2 border-2 border-indigo-300 hover:border-indigo-400 focus:border-indigo-500 focus:ring-indigo-500/20 focus:shadow-lg focus:shadow-indigo-500/10 rounded-lg bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all duration-200 font-medium text-sm"
                >
                  <option value="all">All Visibility</option>
                  <option value="true">Public</option>
                  <option value="false">Private</option>
                </select>
              </div>

              {/* Reported Filter */}
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-red-200 shadow-md hover:shadow-lg transition-all duration-200">
                <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Flag className="w-4 h-4 text-red-600" />
                  Reported
                </label>
                <select
                  value={filters.reportedCount}
                  onChange={(e) => handleFilterChange('reportedCount', e.target.value)}
                  className="w-full h-10 px-3 py-2 border-2 border-red-300 hover:border-red-400 focus:border-red-500 focus:ring-red-500/20 focus:shadow-lg focus:shadow-red-500/10 rounded-lg bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all duration-200 font-medium text-sm"
                >
                  <option value="all">All Reviews</option>
                  <option value="1">Reported (1+)</option>
                  <option value="3">Highly Reported (3+)</option>
                  <option value="5">Very Reported (5+)</option>
                </select>
              </div>

              {/* Sort Options */}
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-gray-200 shadow-md hover:shadow-lg transition-all duration-200">
                <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4 text-gray-600" />
                  Sort By
                </label>
                <div className="space-y-3">
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="w-full h-10 px-3 py-2 border-2 border-gray-300 hover:border-gray-400 focus:border-gray-500 focus:ring-gray-500/20 focus:shadow-lg focus:shadow-gray-500/10 rounded-lg bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all duration-200 font-medium text-sm"
                  >
                    <option value="createdAt">Date Created</option>
                    <option value="rating">Rating</option>
                    <option value="helpfulVotes">Helpful Votes</option>
                  </select>
                  <select
                    value={filters.sortOrder}
                    onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                    className="w-full h-10 px-3 py-2 border-2 border-gray-300 hover:border-gray-400 focus:border-gray-500 focus:ring-gray-500/20 focus:shadow-lg focus:shadow-gray-500/10 rounded-lg bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all duration-200 font-medium text-sm"
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

export default function InstructorReviewsPage() {
  return (
    <InstructorPageWrapper>
      <InstructorReviewsPageContent />
    </InstructorPageWrapper>
  );
}
