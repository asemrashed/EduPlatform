'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { InstructorRoleShell } from '@/components/role-area/InstructorRoleShell';
import AssignmentSubmissionStats from '@/components/AssignmentSubmissionStats';
import PageSection from '@/components/PageSection';
import WelcomeSection from '@/components/WelcomeSection';
import { htmlToPlainText } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { AttractiveInput } from '@/components/ui/attractive-input';
import { AttractiveTextarea } from '@/components/ui/attractive-textarea';
import { LuArrowLeft as ArrowLeft, LuUsers as Users, LuClock as Clock, LuCheck as CheckCircle, LuTriangleAlert as AlertCircle, LuFilter as Filter, LuDownload as Download, LuEye as Eye, LuMessageSquare as MessageSquare, LuStar as Star, LuCalendar as Calendar, LuFileText as LuFileText, LuUser as User, LuSettings as Settings, LuTarget as Target } from 'react-icons/lu';;
import { AssignmentSubmission } from '@/types/assignment';

interface Assignment {
  _id: string;
  title: string;
  description: string;
  type: string;
  dueDate: string;
  totalMarks: number;
  course: {
    _id: string;
    title: string;
  };
}

function InstructorAssignmentSubmissionsPageContent() {
  const params = useParams();
  const router = useRouter();
  const assignmentId = params.id as string;
  
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all' as 'all' | 'draft' | 'submitted' | 'graded' | 'returned',
    isLate: 'all' as 'all' | 'true' | 'false',
    sortBy: 'submittedAt' as 'submittedAt' | 'score' | 'studentName',
    sortOrder: 'desc' as 'asc' | 'desc'
  });
  const [stats, setStats] = useState(null);

  const getStudentName = (student: AssignmentSubmission['student'] | undefined) => {
    if (!student) return '';
    if (typeof student === 'object') return (student as any).name || '';
    return '';
  };

  const getStudentEmail = (student: AssignmentSubmission['student'] | undefined) => {
    if (!student) return '';
    if (typeof student === 'object') return (student as any).email || '';
    return '';
  };

  const fetchAssignment = async () => {
    try {
      const response = await fetch(`/api/assignments/${assignmentId}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      const data = await response.json();

      if (response.ok) {
        setAssignment(data.data?.assignment || data.assignment);
      } else {
        console.error('Failed to fetch assignment:', data.error);
      }
    } catch (error) {
      console.error('Error fetching assignment:', error);
    }
  };

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.isLate !== 'all' && { isLate: filters.isLate }),
        ...(filters.sortBy && { sortBy: filters.sortBy }),
        ...(filters.sortOrder && { sortOrder: filters.sortOrder }),
      });

      const response = await fetch(`/api/assignments/${assignmentId}/submissions?${queryParams}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      const data = await response.json();

      if (response.ok) {
        const submissions = data.data?.submissions || data.submissions || [];
        const stats = data.data?.stats || data.stats || null;
        
        setSubmissions(Array.isArray(submissions) ? submissions : []);
        setStats(stats);
      } else {
        console.error('Failed to fetch submissions:', data.error);
        setSubmissions([]);
        setStats(null);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
      setSubmissions([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignment();
  }, [assignmentId]);

  useEffect(() => {
    fetchSubmissions();
  }, [assignmentId, filters]);

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: 'all',
      isLate: 'all',
      sortBy: 'submittedAt',
      sortOrder: 'desc'
    });
    setShowFilterDrawer(false);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.status !== 'all') count++;
    if (filters.isLate !== 'all') count++;
    if (filters.sortBy !== 'submittedAt') count++;
    if (filters.sortOrder !== 'desc') count++;
    return count;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'Draft', className: 'bg-gray-100 text-gray-800' },
      submitted: { label: 'Submitted', className: 'bg-blue-100 text-blue-800' },
      graded: { label: 'Graded', className: 'bg-green-100 text-green-800' },
      returned: { label: 'Returned', className: 'bg-purple-100 text-purple-800' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return (
      <Badge variant="secondary" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not submitted';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const [showGradeDrawer, setShowGradeDrawer] = useState(false);
  const [gradingSubmission, setGradingSubmission] = useState<AssignmentSubmission | null>(null);
  const [gradeScore, setGradeScore] = useState<string>('');
  const [gradeFeedback, setGradeFeedback] = useState<string>('');
  const [grading, setGrading] = useState(false);
  const [gradeError, setGradeError] = useState<string | null>(null);

  const handleGradeSubmission = (submission: AssignmentSubmission) => {
    setShowFilterDrawer(false);
    setGradingSubmission(submission);
    setGradeScore(submission.score !== undefined ? String(submission.score) : '');
    setGradeFeedback(submission.feedback || '');
    setGradeError(null);
    setShowGradeDrawer(true);
  };

  const submitGrade = async () => {
    if (!gradingSubmission) return;
    setGradeError(null);
    const parsed = Number(gradeScore);
    if (Number.isNaN(parsed) || parsed < 0) {
      setGradeError('Please enter a valid non-negative score.');
      return;
    }
    try {
      setGrading(true);
      const res = await fetch(`/api/assignments/${assignmentId}/submissions/${gradingSubmission._id}/grade`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ score: parsed, feedback: gradeFeedback || undefined })
      });
      const data = await res.json();
      if (res.ok) {
        setShowGradeDrawer(false);
        setGradingSubmission(null);
        // Refresh list
        fetchSubmissions();
      } else {
        setGradeError(data?.error || 'Failed to grade submission.');
      }
    } finally {
      setGrading(false);
    }
  };

  const handleViewSubmission = (submission: AssignmentSubmission) => {
    // Open admin-like drawer inline instead of navigating away
    setViewSubmission(submission);
    setShowViewDrawer(true);
  };

  const [showViewDrawer, setShowViewDrawer] = useState(false);
  const [viewSubmission, setViewSubmission] = useState<AssignmentSubmission | null>(null);
  const handleDownloadAll = () => {
    if (!viewSubmission?.files?.length) return;
    for (const f of viewSubmission.files) {
      const a = document.createElement('a');
      a.href = f.url;
      a.download = f.name || 'submission-file';
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  if (loading && !assignment) {
    return (
      <InstructorRoleShell>
        <main className="relative z-10 p-2 sm:p-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </main>
      </InstructorRoleShell>
    );
  }

  return (
    <InstructorRoleShell>
      <main className="relative z-10 p-2 sm:p-4">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Assignments
          </Button>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {assignment?.title || 'Assignment Submissions'}
              </h1>
              <p className="text-gray-600">
                {assignment?.course?.title} • {assignment?.type?.replace('_', ' ')} • {assignment?.totalMarks} marks
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowFilterDrawer(true)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filters
                {getActiveFiltersCount() > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {getActiveFiltersCount()}
                  </Badge>
                )}
              </Button>
              <Button className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Assignment LuInfo */}
        {assignment && (
          <Card className="mb-6 border-2 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LuFileText className="w-5 h-5 text-blue-600" />
                Assignment Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Due Date</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatDate(assignment.dueDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Marks</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {assignment.totalMarks}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Type</p>
                  <p className="text-lg font-semibold text-gray-900 capitalize">
                    {assignment.type.replace('_', ' ')}
                  </p>
                </div>
              </div>
              {assignment.description && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-600 mb-2">Description</p>
                  <p className="text-gray-900">{htmlToPlainText(assignment.description)}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Submission Statistics */}
        <PageSection 
          title="Submission Statistics"
          className="mb-6"
        >
          <AssignmentSubmissionStats 
            submissions={submissions} 
            loading={loading} 
            stats={stats} 
          />
        </PageSection>

        {/* Submissions List */}
        <PageSection 
          title="Student Submissions"
          description={`${submissions.length} submissions found`}
        >
          <div className="space-y-4">
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-gray-200 h-16 rounded"></div>
                ))}
              </div>
            ) : submissions.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Submissions Yet</h3>
                  <p className="text-gray-600">Students haven't submitted this assignment yet.</p>
                </CardContent>
              </Card>
            ) : (
              submissions.map((submission) => (
                <Card key={submission._id} className="border-2 border-gray-200 hover:border-blue-300 transition-all duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-full">
                          <User className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {getStudentName(submission.student)}
                          </h3>
                          <p className="text-sm text-gray-600">{getStudentEmail(submission.student)}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {getStatusBadge(submission.status)}
                            {submission.isLate && (
                              <Badge variant="secondary" className="bg-red-100 text-red-800">
                                Late
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Submitted</p>
                          <p className="font-medium text-gray-900">
                            {formatDate(submission.submittedAt)}
                          </p>
                        </div>
                        {submission.score !== undefined && (
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Score</p>
                            <p className="font-medium text-gray-900">
                              {submission.score}/{submission.maxScore}
                            </p>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewSubmission(submission)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleGradeSubmission(submission)}
                          >
                            <Star className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </PageSection>

        {/* Filter Drawer */}
        <Sheet open={showFilterDrawer} onOpenChange={setShowFilterDrawer}>
          <SheetContent side="right" className="w-full sm:max-w-md bg-gradient-to-br from-blue-50 via-white to-purple-50 border-l-2 border-blue-200">
            <SheetHeader className="bg-white/80 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-blue-100 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-blue-600" />
                    Filter Submissions
                  </h3>
                  <p className="text-sm text-gray-600">
                    Filter and sort submissions to find what you're looking for
                  </p>
                </div>
              </div>
            </SheetHeader>
            
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {/* Status Filter */}
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-blue-200 shadow-md hover:shadow-lg transition-all duration-200">
                <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full h-10 px-3 py-2 border-2 border-blue-300 hover:border-blue-400 focus:border-blue-500 focus:ring-blue-500/20 focus:shadow-lg focus:shadow-blue-500/10 rounded-lg bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all duration-200 font-medium text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="submitted">Submitted</option>
                  <option value="graded">Graded</option>
                  <option value="returned">Returned</option>
                </select>
              </div>

              {/* Late Submission Filter */}
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-orange-200 shadow-md hover:shadow-lg transition-all duration-200">
                <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-600" />
                  Late Submissions
                </label>
                <select
                  value={filters.isLate}
                  onChange={(e) => handleFilterChange('isLate', e.target.value)}
                  className="w-full h-10 px-3 py-2 border-2 border-orange-300 hover:border-orange-400 focus:border-orange-500 focus:ring-orange-500/20 focus:shadow-lg focus:shadow-orange-500/10 rounded-lg bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all duration-200 font-medium text-sm"
                >
                  <option value="all">All Submissions</option>
                  <option value="true">Late Only</option>
                  <option value="false">On Time</option>
                </select>
              </div>

              {/* Sort Options */}
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-purple-200 shadow-md hover:shadow-lg transition-all duration-200">
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-purple-600" />
                      Sort By
                    </label>
                    <select
                      value={filters.sortBy}
                      onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                      className="w-full h-10 px-3 py-2 border-2 border-purple-300 hover:border-purple-400 focus:border-purple-500 focus:ring-purple-500/20 focus:shadow-lg focus:shadow-purple-500/10 rounded-lg bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all duration-200 font-medium text-sm"
                    >
                      <option value="submittedAt">Submission Date</option>
                      <option value="score">Score</option>
                      <option value="studentName">Student Name</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-purple-600" />
                      Sort Order
                    </label>
                    <select
                      value={filters.sortOrder}
                      onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                      className="w-full h-10 px-3 py-2 border-2 border-purple-300 hover:border-purple-400 focus:border-purple-500 focus:ring-purple-500/20 focus:shadow-lg focus:shadow-purple-500/10 rounded-lg bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all duration-200 font-medium text-sm"
                    >
                      <option value="desc">Descending</option>
                      <option value="asc">Ascending</option>
                    </select>
                  </div>
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
      {/* Grade Drawer */}
      <Sheet open={showGradeDrawer} onOpenChange={setShowGradeDrawer}>
        <SheetContent side="right" className="w-full sm:max-w-md z-[60] bg-gradient-to-br from-emerald-50 via-white to-blue-50 border-l-2 border-emerald-200">
          <SheetHeader>
            <SheetTitle>Grade Submission</SheetTitle>
          </SheetHeader>
          <div className="p-2 sm:p-4 space-y-4">
            <AttractiveInput
              type="number"
              label="Score"
              placeholder={`0 - ${assignment?.totalMarks ?? ''}`}
              value={gradeScore}
              onChange={(e) => setGradeScore(e.target.value)}
              icon="target"
              min={0}
              max={assignment?.totalMarks ?? undefined}
              step={1}
              helperText={`Enter a score between 0 and ${assignment?.totalMarks ?? 0}`}
              variant="default"
              colorScheme="primary"
              size="md"
              isInvalid={!!gradeError}
            />
            <AttractiveTextarea
              label="Feedback (optional)"
              placeholder="Write feedback for the student..."
              value={gradeFeedback}
              onChange={(e) => setGradeFeedback(e.target.value)}
              rows={5}
              variant="default"
              colorScheme="primary"
              size="md"
              helperText="You can leave this blank."
            />
            {gradeError && (
              <div className="text-sm text-red-600">{gradeError}</div>
            )}
          </div>
          <SheetFooter className="p-2 sm:p-4">
            <div className="flex gap-2 w-full">
              <Button 
                variant="outline" 
                className="flex-1 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                onClick={() => setShowGradeDrawer(false)}
                aria-label="Cancel grading"
              >
                Cancel
              </Button>
              <Button 
                className="flex-1 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white"
                onClick={submitGrade}
                disabled={grading || gradeScore === ''}
                aria-label="Save grade"
              >
                {grading ? 'Saving...' : 'Save Grade'}
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      {/* View Submission Drawer (aligned with admin view) */}
      <Sheet open={showViewDrawer} onOpenChange={setShowViewDrawer}>
        <SheetContent side="right" className="w-full sm:max-w-lg z-[58] bg-gradient-to-br from-blue-50 via-white to-purple-50 border-l-2 border-blue-200">
          <SheetHeader>
            <SheetTitle>Submission Details</SheetTitle>
          </SheetHeader>
          <div className="p-2 sm:p-4 space-y-4">
            {/* Student & Meta */}
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-gray-900 truncate">
                    {getStudentName(viewSubmission?.student as any)}
                  </div>
                  <div className="text-sm text-gray-500 truncate">
                    {getStudentEmail(viewSubmission?.student as any)}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span>{viewSubmission?.submittedAt ? new Date(viewSubmission.submittedAt as any).toLocaleString() : 'Not submitted'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-gray-500" />
                  <span>
                    {viewSubmission?.score !== undefined ? `${viewSubmission.score}/${viewSubmission?.maxScore}` : 'Not graded'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <LuFileText className="w-4 h-4 text-gray-500" />
                  <span>Attempt: {viewSubmission?.attemptNumber ?? '-'}</span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-gray-200">
              <div className="text-sm font-semibold text-gray-700 mb-2">Content</div>
              <div className="whitespace-pre-wrap text-gray-900 text-sm">
                {viewSubmission?.content || 'No content provided.'}
              </div>
            </div>

            {/* LuFiles */}
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-gray-200">
              <div className="text-sm font-semibold text-gray-700 mb-2">LuFiles</div>
              {viewSubmission?.files?.length ? (
                <div className="space-y-2">
                  {viewSubmission.files.map((f) => (
                    <div key={f.url} className="flex items-center justify-between border rounded-md p-2">
                      <div className="text-sm text-gray-800 truncate mr-2">{f.name}</div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { const a = document.createElement('a'); a.href = f.url; a.download = f.name || 'submission-file'; a.target = '_blank'; document.body.appendChild(a); a.click(); document.body.removeChild(a); }}
                      >
                        <Download className="w-4 h-4 mr-1" /> Download
                      </Button>
                    </div>
                  ))}
                  <Button
                    className="w-full"
                    onClick={handleDownloadAll}
                  >
                    <Download className="w-4 h-4 mr-2" /> Download All
                  </Button>
                </div>
              ) : (
                <div className="text-sm text-gray-500">No files uploaded.</div>
              )}
            </div>
          </div>
          <SheetFooter className="p-2 sm:p-4">
            <div className="flex gap-2 w-full">
              <Button variant="outline" className="flex-1" onClick={() => setShowViewDrawer(false)}>
                Close
              </Button>
              <Button className="flex-1" onClick={() => setShowViewDrawer(false)}>
                Done
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </InstructorRoleShell>
  );
}

export default function InstructorAssignmentSubmissionsPage() {
  return <InstructorAssignmentSubmissionsPageContent />;
}
