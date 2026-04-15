'use client';

import { useState, useEffect } from 'react';
import { useAppSelector } from '@/lib/hooks';
import { AdminRoleShell } from '@/components/role-area/AdminRoleShell';
import CourseDataTable from '@/components/CourseDataTable';
import CourseModal from '@/components/CourseModal';
import CourseStats from '@/components/CourseStats';
import PageSection from '@/components/PageSection';
import WelcomeSection from '@/components/WelcomeSection';
import ConfirmModal from '@/components/ui/confirm-modal';
import AdminPageWrapper from '@/components/AdminPageWrapper';
import { Course, CourseFilters as CourseFiltersType } from '@/types/course';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AttractiveInput } from '@/components/ui/attractive-input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { LuPlus as Plus, LuSearch as Search, LuX as X, LuBookOpen as BookOpen, LuFilter as Filter, LuTag as Tag, LuDollarSign as DollarSign, LuCalendar as Calendar, LuArrowUpDown as ArrowUpDown, LuSettings as Settings, LuUser as User } from 'react-icons/lu';;
import { useRouter } from 'next/navigation';

function CoursesPageContent() {
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [search, setSearch] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    page: 1,
    limit: 10,
    status: 'published' as 'published' | 'draft' | 'archived' | 'all',
    category: 'all',
    pricing: 'all' as 'all' | 'free' | 'paid',
    creator: 'all',
    sortBy: 'createdAt' as 'title' | 'price' | 'createdAt' | 'updatedAt',
    sortOrder: 'desc' as 'asc' | 'desc'
  });
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [categories, setCategories] = useState<Array<{_id: string, name: string, color?: string, icon?: string}>>([]);
  const [creators, setCreators] = useState<Array<{_id: string, name: string, email: string, role: string}>>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [stats, setStats] = useState(null);
  const [reorderMode, setReorderMode] = useState(true);
  const [reorderedCourses, setReorderedCourses] = useState<Course[] | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: (reorderMode ? 1 : filters.page).toString(),
        limit: (reorderMode ? 500 : filters.limit).toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.category !== 'all' && { category: filters.category }),
        ...(filters.pricing !== 'all' && { isPaid: filters.pricing === 'paid' ? 'true' : 'false' }),
        ...(filters.creator !== 'all' && { createdBy: filters.creator }),
        ...(reorderMode ? { sortBy: 'displayOrder', sortOrder: 'asc' } : {
          ...(filters.sortBy && { sortBy: filters.sortBy }),
          ...(filters.sortOrder && { sortOrder: filters.sortOrder }),
        }),
      });


      const response = await fetch(`/api/courses?${queryParams}`);
      const data = await response.json();

      if (response.ok) {
        setCourses(data.data.courses || []);
        setReorderedCourses(null);
        setPagination(data.data.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          pages: 0
        });
        setStats(data.data.stats);
      } else {
        console.error('Failed to fetch courses:', data.error);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      if (response.ok) {
        setCategories(data.data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchCreators = async () => {
    try {
      const response = await fetch('/api/users?role=instructor,teacher,admin');
      const data = await response.json();
      if (response.ok) {
        setCreators(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching creators:', error);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [
    filters.page,
    filters.limit,
    filters.search,
    filters.status,
    filters.category,
    filters.pricing,
    filters.creator,
    filters.sortBy,
    filters.sortOrder,
    reorderMode,
  ]);

  useEffect(() => {
    fetchCategories();
    fetchCreators();
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

  const handleAddCourse = async () => {
    try {
      // Create a new course with basic information
      const courseData = {
        title: 'New Course',
        description: 'Course description',
        isPaid: false,
        price: 0,
        status: 'draft',
        instructor: undefined, // No instructor assigned initially
      };
      
      console.log('Sending course data:', courseData);
      
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(courseData),
      });

      const data = await response.json();
      console.log('Course created:', data);

      if (response.ok) {
        // Redirect to course builder with the new course ID
        router.push(`/admin/courses/builder?id=${data.data._id}`);
      } else {
        console.error('Failed to create course:', data.error);
        // Fallback to modal if creation fails
        setEditingCourse(null);
        setShowForm(true);
      }
    } catch (error) {
      console.error('Error creating course:', error);
      // Fallback to modal if creation fails
      setEditingCourse(null);
      setShowForm(true);
    }
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setShowForm(true);
  };

  const handleDeleteCourse = (course: Course) => {
    setCourseToDelete(course);
    setShowDeleteModal(true);
  };

  const handleBuildCourse = (course: Course) => {
    router.push(`/admin/courses/builder?id=${course._id}`);
  };

  const handleToggleCourseVisibility = async (course: Course) => {
    try {
      const response = await fetch(`/api/courses/${course._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isHidden: !course.isHidden,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to update course visibility');
      }

      fetchCourses();
    } catch (error) {
      console.error('Error updating course visibility:', error);
      alert(error instanceof Error ? error.message : 'Failed to update course visibility');
    }
  };

  const confirmDeleteCourse = async () => {
    if (!courseToDelete) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/courses/${courseToDelete._id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Course deleted successfully');
        fetchCourses();
        setShowDeleteModal(false);
        setCourseToDelete(null);
      } else {
        console.error('Failed to delete course:', data.error);
      }
    } catch (error) {
      console.error('Error deleting course:', error);
    } finally {
      setDeleting(false);
    }
  };

  const cancelDeleteCourse = () => {
    setShowDeleteModal(false);
    setCourseToDelete(null);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingCourse(null);
    fetchCourses();
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingCourse(null);
  };

  const handleFilterChange = (key: string, value: any) => {
    if (reorderMode) return;
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  const clearFilters = () => {
    if (reorderMode) return;
    setFilters({
      search: '',
      page: 1,
      limit: 10,
      status: 'published',
      category: 'all',
      pricing: 'all',
      creator: 'all',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    setSearch('');
    setShowFilterDrawer(false);
  };

  const getActiveFiltersCount = () => {
    if (reorderMode) return 0;
    let count = 0;
    if (filters.search) count++;
    if (filters.status !== 'published') count++;
    if (filters.category !== 'all') count++;
    if (filters.pricing !== 'all') count++;
    if (filters.creator !== 'all') count++;
    if (filters.sortBy !== 'createdAt') count++;
    if (filters.sortOrder !== 'desc') count++;
    return count;
  };

  const handleReorderSave = async () => {
    if (!reorderedCourses || reorderedCourses.length === 0) return;
    setSavingOrder(true);
    try {
      const courseOrders = reorderedCourses.map((course, index) => ({
        courseId: course._id,
        displayOrder: index + 1,
      }));

      const response = await fetch('/api/courses/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseOrders }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to save course order');
      }

      await fetchCourses();
    } catch (error) {
      console.error('Error saving course order:', error);
      alert(error instanceof Error ? error.message : 'Failed to save course order');
    } finally {
      setSavingOrder(false);
    }
  };



  return (
    <AdminRoleShell>
      <main className="relative z-10 p-2 sm:p-4">
        {/* Welcome Section */}
        <WelcomeSection 
          title="Course Management"
          description="Create, manage courses and build their content with chapters and lessons"
        />

        {/* Course Statistics */}
        <PageSection 
          title="Course Statistics"
          className="mb-2 sm:mb-4"
        >
          <CourseStats courses={courses} loading={loading} stats={stats} />
        </PageSection>


        {/* Filter Actions */}
        <PageSection 
          title="Course Management"
          className="mb-2 sm:mb-4"
          actions={
            <div className="flex flex-col sm:flex-row gap-2 w-full">
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
                <Settings className="w-4 h-4" style={{ color: '#7B2CBF' }} />
                <span>Advanced Filters</span>
                {getActiveFiltersCount() > 0 && (
                  <span className="text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center font-bold animate-pulse" style={{
                    background: "linear-gradient(135deg, #EC4899 0%, #A855F7 100%)",
                  }}>
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
                onClick={() => {
                  setReorderMode((prev) => !prev);
                  setReorderedCourses(null);
                }}
                variant={reorderMode ? 'default' : 'outline'}
                className="flex items-center gap-2 border-2 transition-all duration-200 font-semibold"
              >
                <ArrowUpDown className="w-4 h-4" />
                {reorderMode ? 'Disable Drag & Drop' : 'Enable Drag & Drop'}
              </Button>
              {reorderMode && (
                <Button
                  onClick={handleReorderSave}
                  disabled={!reorderedCourses || savingOrder}
                  className="flex items-center gap-2 text-white transition-all duration-200"
                  style={{
                    background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                    boxShadow: "0 4px 15px rgba(16, 185, 129, 0.3)",
                  }}
                >
                  {savingOrder ? 'Saving...' : 'Save Order'}
                </Button>
              )}
              <Button 
                onClick={handleAddCourse}
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
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Create Course</span>
                <span className="sm:hidden">Create</span>
              </Button>
            </div>
          }
        >
          <div className="text-sm text-gray-600">
            Manage your courses, create new ones, and organize your educational content.
          </div>
        </PageSection>

        {/* Courses Table */}
        <PageSection 
          title="Courses"
          description={
            reorderMode
              ? 'Drag and drop to reorder published courses. Then click Save Order.'
              : getActiveFiltersCount() > 0 
              ? `Showing ${courses.length} courses with ${getActiveFiltersCount()} active filter${getActiveFiltersCount() > 1 ? 's' : ''}`
              : `Published courses in the system (${courses.length} total)`
          }
          className="mb-2 sm:mb-4"
        >
          <div className="w-full overflow-hidden">
            <CourseDataTable
              courses={courses}
              loading={loading}
              onEdit={handleEditCourse}
              onDelete={handleDeleteCourse}
              onBuild={handleBuildCourse}
              onToggleVisibility={handleToggleCourseVisibility}
              pagination={pagination}
              onPageChange={handlePageChange}
              variant="table"
              reorderEnabled={reorderMode}
              onReorder={(updated) => setReorderedCourses(updated)}
            />
          </div>
        </PageSection>

        {/* Floating Action Button for Mobile */}
        <div className="fixed bottom-6 right-6 z-40 sm:hidden">
          <Button
            onClick={handleAddCourse}
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
            <BookOpen className="w-6 h-6" />
          </Button>
        </div>

        {/* Course Modal */}
        <CourseModal
          open={showForm}
          course={editingCourse}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          open={showDeleteModal}
          onClose={cancelDeleteCourse}
          onConfirm={confirmDeleteCourse}
          title="Delete Course"
          description={`Are you sure you want to delete "${courseToDelete?.title}"? This action cannot be undone.`}
          confirmText="Delete Course"
          cancelText="Cancel"
          variant="danger"
          loading={deleting}
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
                    Filter and sort courses to find exactly what you're looking for
                  </p>
                </div>
              </div>
            </SheetHeader>
            
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {/* Search Input */}
              <div>
                <AttractiveInput
                  type="text"
                  label="Search Courses"
                  placeholder="Search by title, description, or category..."
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  icon="search"
                  variant="default"
                  colorScheme="primary"
                  size="md"
                  helperText="Find courses by typing keywords"
                />
              </div>
              
              {/* Status Filter */}
              <div className="bg-white rounded-lg p-3 shadow-md hover:shadow-lg transition-all duration-200" style={{
                border: '1px solid rgba(123, 44, 191, 0.2)',
              }}>
                <label className="flex text-sm font-semibold text-foreground mb-2 items-center gap-2">
                  <Tag className="w-4 h-4" style={{ color: '#7B2CBF' }} />
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
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
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              {/* Category Filter */}
              <div className="bg-white rounded-lg p-3 shadow-md hover:shadow-lg transition-all duration-200" style={{
                border: '1px solid rgba(168, 85, 247, 0.2)',
              }}>
                <label className="flex text-sm font-semibold text-foreground mb-2 items-center gap-2">
                  <Tag className="w-4 h-4" style={{ color: '#A855F7' }} />
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
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
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category.name}>
                      {category.icon && <span className="mr-2">{category.icon}</span>}
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Pricing Filter */}
              <div className="bg-white rounded-lg p-3 shadow-md hover:shadow-lg transition-all duration-200" style={{
                border: '1px solid rgba(236, 72, 153, 0.2)',
              }}>
                <label className="flex text-sm font-semibold text-foreground mb-2 items-center gap-2">
                  <DollarSign className="w-4 h-4" style={{ color: '#EC4899' }} />
                  Pricing
                </label>
                <select
                  value={filters.pricing}
                  onChange={(e) => handleFilterChange('pricing', e.target.value)}
                  className="w-full h-10 px-3 py-2 border-2 rounded-lg bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all duration-200 font-medium text-sm"
                  style={{
                    borderColor: '#EC4899',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#DB2777'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = '#EC4899'}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#DB2777';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(236, 72, 153, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#EC4899';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <option value="all">All Pricing</option>
                  <option value="free">Free Courses</option>
                  <option value="paid">Paid Courses</option>
                </select>
              </div>

              {/* Creator Filter */}
              <div className="bg-white rounded-lg p-3 shadow-md hover:shadow-lg transition-all duration-200" style={{
                border: '1px solid rgba(123, 44, 191, 0.2)',
              }}>
                <label className="flex text-sm font-semibold text-foreground mb-2 items-center gap-2">
                  <User className="w-4 h-4" style={{ color: '#7B2CBF' }} />
                  Creator
                </label>
                <select
                  value={filters.creator}
                  onChange={(e) => handleFilterChange('creator', e.target.value)}
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
                  <option value="all">All Creators</option>
                  {creators.map((creator) => (
                    <option key={creator._id} value={creator._id}>
                      {creator.name} ({creator.role})
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Options */}
              <div className="bg-white rounded-lg p-3 shadow-md hover:shadow-lg transition-all duration-200" style={{
                border: '1px solid rgba(255, 107, 53, 0.2)',
              }}>
                <label className="flex text-sm font-semibold text-foreground mb-2 items-center gap-2">
                  <ArrowUpDown className="w-4 h-4" style={{ color: '#FF6B35' }} />
                  Sort By
                </label>
                <div className="space-y-3">
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
                    <option value="createdAt">Date Created</option>
                    <option value="updatedAt">Last Updated</option>
                    <option value="title">Title</option>
                    <option value="price">Price</option>
                  </select>
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

export default function CoursesPage() {
  return (
    <AdminPageWrapper>
      <CoursesPageContent />
    </AdminPageWrapper>
  );
}
