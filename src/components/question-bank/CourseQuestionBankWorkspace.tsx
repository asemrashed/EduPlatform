'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import QuestionModal from '@/components/QuestionModal';
import CSVUploadModal from '@/components/CSVUploadModal';
import QuestionViewModal from '@/components/QuestionViewModal';
import ConfirmModal from '@/components/ui/confirm-modal';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleHeader,
} from '@/components/ui/collapsible';
import PageSection from '@/components/PageSection';
import WelcomeSection from '@/components/WelcomeSection';
import { apiFetch } from '@/lib/api/httpClient';
import { questionsStaffService } from '@/services/questionsStaffService';
import { Question as QuestionType } from '@/types/exam';
import {
  LuPlus,
  LuSearch,
  LuBookOpen,
  LuChevronRight,
  LuChevronDown,
  LuPencil,
  LuTrash2,
  LuEye,
  LuUpload,
} from 'react-icons/lu';

type BankRole = 'admin' | 'instructor';

type EnrichedQuestion = QuestionType & {
  course?: { _id: string; title: string };
  chapter?: { _id: string; title: string };
  examInfo?: { _id: string; title: string };
  lessonInfo?: { _id: string; title: string };
};

type CourseNode = { _id: string; title: string };
type ChapterNode = { _id: string; title: string; course: string };
type ExamNode = { _id: string; title: string; course?: string };

type Stats = {
  totalQuestions: number;
  activeQuestions: number;
  mcqQuestions: number;
  totalMarks: number;
};

interface Props {
  role: BankRole;
  title?: string;
  description?: string;
}

export default function CourseQuestionBankWorkspace({
  role,
  title = 'Question Bank',
  description = 'Browse questions by course and chapter',
}: Props) {
  const [courses, setCourses] = useState<CourseNode[]>([]);
  const [chaptersByCourse, setChaptersByCourse] = useState<Record<string, ChapterNode[]>>({});
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);

  const [questions, setQuestions] = useState<EnrichedQuestion[]>([]);
  const [exams, setExams] = useState<ExamNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalQuestions: 0,
    activeQuestions: 0,
    mcqQuestions: 0,
    totalMarks: 0,
  });
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, pages: 0 });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [examFilter, setExamFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<EnrichedQuestion | null>(null);
  const [showCSVUpload, setShowCSVUpload] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingQuestion, setViewingQuestion] = useState<EnrichedQuestion | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [bulkAction, setBulkAction] = useState<'delete' | 'activate' | 'deactivate' | null>(null);
  const [busy, setBusy] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const filterQuery = useMemo(() => {
    const params = new URLSearchParams({
      page: String(pagination.page),
      limit: String(pagination.limit),
    });
    if (search.trim()) params.set('search', search.trim());
    if (typeFilter !== 'all') params.set('type', typeFilter);
    if (difficultyFilter !== 'all') params.set('difficulty', difficultyFilter);
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (examFilter !== 'all') params.set('exam', examFilter);
    if (selectedCourseId) params.set('course', selectedCourseId);
    if (selectedChapterId) params.set('chapter', selectedChapterId);
    return params.toString();
  }, [
    pagination.page,
    pagination.limit,
    search,
    typeFilter,
    difficultyFilter,
    statusFilter,
    examFilter,
    selectedCourseId,
    selectedChapterId,
  ]);

  const statsQuery = useMemo(() => {
    const params = new URLSearchParams(filterQuery);
    params.delete('page');
    params.delete('limit');
    return params.toString();
  }, [filterQuery]);

  const loadCourses = useCallback(async () => {
    const res = await apiFetch('/api/courses?limit=200&sortBy=title&sortOrder=asc');
    if (!res.ok) return;
    const json = await res.json();
    const list = json.data?.courses || json.courses || [];
    setCourses(
      list.map((c: { _id: string; title?: string }) => ({
        _id: String(c._id),
        title: String(c.title || 'Untitled'),
      })),
    );
  }, []);

  const loadChapters = useCallback(async (courseId: string) => {
    if (chaptersByCourse[courseId]) return;
    const res = await apiFetch(`/api/chapters?course=${courseId}&limit=200&sortBy=order&sortOrder=asc`);
    if (!res.ok) return;
    const json = await res.json();
    const list = json.data?.chapters || json.chapters || [];
    setChaptersByCourse((prev) => ({
      ...prev,
      [courseId]: list.map((ch: { _id: string; title?: string }) => ({
        _id: String(ch._id),
        title: String(ch.title || 'Chapter'),
        course: courseId,
      })),
    }));
  }, [chaptersByCourse]);

  const loadExams = useCallback(async () => {
    const res = await apiFetch('/api/exams?limit=200');
    if (!res.ok) return;
    const json = await res.json();
    const list = json.data?.exams || json.exams || [];
    setExams(
      list.map((e: { _id: string; title?: string; course?: string }) => ({
        _id: String(e._id),
        title: String(e.title || 'Exam'),
        course: e.course ? String(e.course) : undefined,
      })),
    );
  }, []);

  const loadQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const [listRes, statsRes] = await Promise.all([
        questionsStaffService.listQuestionBank(role, filterQuery),
        questionsStaffService.questionBankStats(role, statsQuery),
      ]);
      if (listRes.ok) {
        const data = await listRes.json();
        setQuestions(data.data?.questions || []);
        setPagination((p) => ({ ...p, ...(data.data?.pagination || {}) }));
      } else {
        setQuestions([]);
      }
      if (statsRes.ok) {
        const data = await statsRes.json();
        const s = data.data?.stats || {};
        setStats({
          totalQuestions: s.totalQuestions ?? 0,
          activeQuestions: s.activeQuestions ?? 0,
          mcqQuestions: s.mcqQuestions ?? 0,
          totalMarks: s.totalMarks ?? 0,
        });
      }
    } finally {
      setLoading(false);
    }
  }, [role, filterQuery, statsQuery]);

  useEffect(() => {
    loadCourses();
    loadExams();
  }, [loadCourses, loadExams]);

  useEffect(() => {
    loadQuestions();
    setSelectedIds(new Set());
  }, [loadQuestions]);

  const filteredExams = useMemo(() => {
    if (!selectedCourseId) return exams;
    return exams.filter((e) => e.course === selectedCourseId || !e.course);
  }, [exams, selectedCourseId]);

  const toggleCourse = async (courseId: string) => {
    setExpandedCourses((prev) => {
      const next = new Set(prev);
      if (next.has(courseId)) next.delete(courseId);
      else next.add(courseId);
      return next;
    });
    await loadChapters(courseId);
  };

  const scopeLabel = useMemo(() => {
    if (!selectedCourseId) return 'All courses';
    const course = courses.find((c) => c._id === selectedCourseId);
    if (!selectedChapterId) return course?.title || 'Course';
    const chapters = chaptersByCourse[selectedCourseId] || [];
    const chapter = chapters.find((ch) => ch._id === selectedChapterId);
    return chapter ? `${course?.title} › ${chapter.title}` : course?.title || 'Course';
  }, [courses, chaptersByCourse, selectedCourseId, selectedChapterId]);

  const selectCourse = (courseId: string | null, closeMobileNav = false) => {
    setSelectedCourseId(courseId);
    setSelectedChapterId(null);
    setPagination((p) => ({ ...p, page: 1 }));
    setExamFilter('all');
    if (courseId) void loadChapters(courseId);
    if (closeMobileNav) setMobileNavOpen(false);
  };

  const selectChapter = (courseId: string, chapterId: string, closeMobileNav = false) => {
    setSelectedCourseId(courseId);
    setSelectedChapterId(chapterId);
    setPagination((p) => ({ ...p, page: 1 }));
    if (closeMobileNav) setMobileNavOpen(false);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const runBulk = async (action: 'delete' | 'activate' | 'deactivate') => {
    const ids = Array.from(selectedIds);
    if (!ids.length) return;
    setBusy(true);
    try {
      const res = await questionsStaffService.questionBankBulk(role, { ids, action });
      if (res.ok) {
        setSelectedIds(new Set());
        setShowDeleteConfirm(false);
        setBulkAction(null);
        await loadQuestions();
      }
    } finally {
      setBusy(false);
    }
  };

  const deleteOne = async (id: string) => {
    setBusy(true);
    try {
      const res =
        role === 'admin'
          ? await questionsStaffService.deleteAdminQuestion(id)
          : await apiFetch(`/api/questions/${id}`, { method: 'DELETE' });
      if (res.ok) await loadQuestions();
    } finally {
      setBusy(false);
    }
  };

  const renderCourseTree = (closeOnSelect: boolean) => (
    <>
      <button
        type="button"
        className={`mb-1 w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted ${!selectedCourseId ? 'bg-primary/10 font-medium' : ''}`}
        onClick={() => selectCourse(null, closeOnSelect)}
      >
        All courses
      </button>
      <div
        className={
          closeOnSelect
            ? 'scrollbar-hide max-h-[50vh] space-y-0.5 overflow-y-auto overscroll-contain'
            : 'space-y-0.5'
        }
      >
        {courses.map((course) => {
          const open = expandedCourses.has(course._id);
          const chapters = chaptersByCourse[course._id] || [];
          return (
            <div key={course._id}>
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  className="rounded p-1 hover:bg-muted"
                  onClick={() => toggleCourse(course._id)}
                  aria-label="Expand chapters"
                >
                  {open ? <LuChevronDown size={14} /> : <LuChevronRight size={14} />}
                </button>
                <button
                  type="button"
                  className={`flex-1 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted ${selectedCourseId === course._id && !selectedChapterId ? 'bg-primary/10 font-medium' : ''}`}
                  onClick={() => selectCourse(course._id, closeOnSelect)}
                >
                  {course.title}
                </button>
              </div>
              {open && (
                <div className="ml-5 border-l pl-2">
                  {chapters.map((ch) => (
                    <button
                      key={ch._id}
                      type="button"
                      className={`mb-0.5 w-full rounded-md px-2 py-1 text-left text-xs hover:bg-muted ${selectedChapterId === ch._id ? 'bg-primary/10 font-medium' : 'text-muted-foreground'}`}
                      onClick={() => selectChapter(course._id, ch._id, closeOnSelect)}
                    >
                      {ch.title}
                    </button>
                  ))}
                  {!chapters.length && (
                    <p className="px-2 py-1 text-xs text-muted-foreground">No chapters</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );

  return (
    <main className="relative z-10 flex h-full min-h-0 flex-col overflow-hidden p-2 sm:p-4">
      <div className="shrink-0">
        <WelcomeSection title={title} description={description} />
      </div>

      <Collapsible
        open={mobileNavOpen}
        onOpenChange={setMobileNavOpen}
        className="mb-4 shrink-0 lg:hidden"
      >
        <Card className="overflow-hidden p-0">
          <CollapsibleHeader className="rounded-none border-0 px-3 py-3 hover:bg-muted/50">
            <div className="min-w-0 flex-1 text-left">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Course
              </p>
              <p className="truncate text-sm font-medium">{scopeLabel}</p>
            </div>
          </CollapsibleHeader>
          <CollapsibleContent>
            <div className="border-t px-3 pb-3 pt-2">{renderCourseTree(true)}</div>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden lg:flex-row lg:gap-6">
        <aside className="hidden min-h-0 w-[260px] shrink-0 flex-col lg:flex">
          <Card className="flex min-h-0 flex-1 flex-col overflow-hidden p-3">
            <p className="mb-2 shrink-0 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Courses
            </p>
            <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto overscroll-contain">
              {renderCourseTree(false)}
            </div>
          </Card>
        </aside>

        <div className="scrollbar-hide min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain lg:min-h-0">
          <div className="space-y-4 pb-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Total', value: stats.totalQuestions },
              { label: 'Active', value: stats.activeQuestions },
              { label: 'MCQ', value: stats.mcqQuestions },
              { label: 'Marks', value: stats.totalMarks },
            ].map((item) => (
              <Card key={item.label} className="p-3 text-center">
                <p className="text-2xl font-bold">{item.value}</p>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </Card>
            ))}
          </div>

          <Card className="flex flex-wrap items-center gap-2 p-3">
            <div className="relative min-w-[180px] flex-1">
              <LuSearch className="absolute left-2 top-2.5 text-muted-foreground" size={16} />
              <Input
                className="pl-8"
                placeholder="Search questions..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
              />
            </div>
            <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPagination((p) => ({ ...p, page: 1 })); }}>
              <SelectTrigger className="w-[120px]"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="mcq">MCQ</SelectItem>
                <SelectItem value="written">Written</SelectItem>
                <SelectItem value="true_false">True/False</SelectItem>
              </SelectContent>
            </Select>
            <Select value={difficultyFilter} onValueChange={(v) => { setDifficultyFilter(v); setPagination((p) => ({ ...p, page: 1 })); }}>
              <SelectTrigger className="w-[130px]"><SelectValue placeholder="Difficulty" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All levels</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
            <Select value={examFilter} onValueChange={(v) => { setExamFilter(v); setPagination((p) => ({ ...p, page: 1 })); }}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Exam" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All exams</SelectItem>
                {filteredExams.map((ex) => (
                  <SelectItem key={ex._id} value={ex._id}>{ex.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPagination((p) => ({ ...p, page: 1 })); }}>
              <SelectTrigger className="w-[120px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" onClick={() => { setEditingQuestion(null); setShowQuestionModal(true); }}>
              <LuPlus className="mr-1" size={16} /> Add
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowCSVUpload(true)}>
              <LuUpload className="mr-1" size={16} /> CSV
            </Button>
          </Card>

          {selectedIds.size > 0 && (
            <Card className="flex flex-wrap items-center gap-2 p-3">
              <span className="text-sm font-medium">{selectedIds.size} selected</span>
              <Button size="sm" variant="outline" disabled={busy} onClick={() => runBulk('activate')}>
                Activate
              </Button>
              <Button size="sm" variant="outline" disabled={busy} onClick={() => runBulk('deactivate')}>
                Deactivate
              </Button>
              <Button
                size="sm"
                variant="destructive"
                disabled={busy}
                onClick={() => { setBulkAction('delete'); setShowDeleteConfirm(true); }}
              >
                Delete
              </Button>
            </Card>
          )}

          <PageSection>
            {loading ? (
              <p className="py-12 text-center text-muted-foreground">Loading questions...</p>
            ) : questions.length === 0 ? (
              <p className="py-12 text-center text-muted-foreground">No questions in this scope.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {questions.map((q) => (
                  <Card key={q._id} className="flex flex-col gap-2 p-4">
                    <div className="flex items-start gap-2">
                      <Checkbox
                        checked={selectedIds.has(q._id)}
                        onCheckedChange={() => toggleSelect(q._id)}
                      />
                      <p className="line-clamp-3 flex-1 text-sm">{q.question}</p>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {q.course?.title && (
                        <Badge variant="secondary" className="text-xs">
                          <LuBookOpen className="mr-0.5 inline" size={10} />
                          {q.course.title}
                        </Badge>
                      )}
                      {q.chapter?.title && (
                        <Badge variant="outline" className="text-xs">{q.chapter.title}</Badge>
                      )}
                      {q.examInfo?.title && (
                        <Badge className="text-xs">{q.examInfo.title}</Badge>
                      )}
                      {q.lessonInfo?.title && !q.examInfo && (
                        <Badge variant="outline" className="text-xs">Lesson: {q.lessonInfo.title}</Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1 text-xs text-muted-foreground">
                      <span>{q.type}</span>
                      <span>·</span>
                      <span>{q.difficulty}</span>
                      <span>·</span>
                      <span>{q.marks} marks</span>
                    </div>
                    <div className="mt-auto flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => { setViewingQuestion(q); setShowViewModal(true); }}>
                        <LuEye size={16} />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => { setEditingQuestion(q); setShowQuestionModal(true); }}>
                        <LuPencil size={16} />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => deleteOne(q._id)}>
                        <LuTrash2 size={16} />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {pagination.pages > 1 && (
              <div className="mt-4 flex items-center justify-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pagination.page <= 1}
                  onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                >
                  Next
                </Button>
              </div>
            )}
          </PageSection>
          </div>
        </div>
      </div>

      <QuestionModal
        open={showQuestionModal}
        question={editingQuestion}
        onClose={() => { setShowQuestionModal(false); setEditingQuestion(null); }}
        onSuccess={() => { setShowQuestionModal(false); loadQuestions(); }}
      />
      <CSVUploadModal
        open={showCSVUpload}
        examId={examFilter !== 'all' ? examFilter : undefined}
        onClose={() => setShowCSVUpload(false)}
        onSuccess={() => { setShowCSVUpload(false); loadQuestions(); }}
      />
      <QuestionViewModal
        open={showViewModal}
        question={viewingQuestion}
        onClose={() => { setShowViewModal(false); setViewingQuestion(null); }}
      />
      <ConfirmModal
        open={showDeleteConfirm}
        title="Delete questions?"
        description={`Delete ${selectedIds.size} selected question(s)? This cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        loading={busy}
        onConfirm={() => bulkAction === 'delete' && runBulk('delete')}
        onClose={() => { setShowDeleteConfirm(false); setBulkAction(null); }}
      />
    </main>
  );
}
