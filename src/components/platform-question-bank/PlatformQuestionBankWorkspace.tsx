'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PageSection from '@/components/PageSection';
import WelcomeSection from '@/components/WelcomeSection';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleHeader,
} from '@/components/ui/collapsible';
import PlatformQuestionModal, {
  type PlatformQuestionRow,
} from '@/components/platform-question-bank/PlatformQuestionModal';
import PlatformAccessRequestsPanel from '@/components/platform-question-bank/PlatformAccessRequestsPanel';
import PlatformInstructorAccessBanner from '@/components/platform-question-bank/PlatformInstructorAccessBanner';
import GenerateQuestionsModal from '@/components/platform-question-bank/GenerateQuestionsModal';
import { platformQuestionsService } from '@/services/platformQuestionsService';
import {
  LuPlus,
  LuSparkles,
  LuSearch,
  LuPencil,
  LuTrash2,
  LuLayers,
  LuUsers,
  LuExternalLink,
  LuClipboardCheck,
} from 'react-icons/lu';

type BankRole = 'admin' | 'instructor';

type SubjectNode = {
  subject: string;
  topics: { topic: string; count: number; testYourselfCount?: number }[];
};

const DIFFICULTY_LABEL: Record<number, string> = {
  1: 'Easy',
  2: 'Medium',
  3: 'Hard',
};

interface Props {
  role: BankRole;
  title?: string;
  description?: string;
}

export default function PlatformQuestionBankWorkspace({
  role,
  title = 'Platform Question Bank',
  description = 'Subject and topic organized questions for batches and resources',
}: Props) {
  const [subjectTree, setSubjectTree] = useState<SubjectNode[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedLessonTopic, setSelectedLessonTopic] = useState('');

  const [questions, setQuestions] = useState<PlatformQuestionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, pages: 0 });

  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [accessFilter, setAccessFilter] = useState('all');
  const [testYourselfFilter, setTestYourselfFilter] = useState('all');
  const [testYourselfTotal, setTestYourselfTotal] = useState(0);
  const [testYourselfTopics, setTestYourselfTopics] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<PlatformQuestionRow | null>(null);
  const [busy, setBusy] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [adminTab, setAdminTab] = useState<'questions' | 'access'>('questions');

  const canEditQuestion = (q: PlatformQuestionRow) =>
    role === 'admin' || q.ownerType !== 'admin';

  const filterQuery = useMemo(() => {
    const params = new URLSearchParams({
      page: String(pagination.page),
      limit: String(pagination.limit),
    });
    if (search.trim()) params.set('search', search.trim());
    if (difficultyFilter !== 'all') params.set('difficulty', difficultyFilter);
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (accessFilter !== 'all' && role === 'admin') params.set('accessPolicy', accessFilter);
    if (testYourselfFilter === 'published') params.set('testYourself', '1');
    if (selectedSubject) params.set('subject', selectedSubject);
    if (selectedLessonTopic) params.set('topic', selectedLessonTopic);
    return params.toString();
  }, [
    pagination.page,
    pagination.limit,
    search,
    difficultyFilter,
    statusFilter,
    accessFilter,
    testYourselfFilter,
    selectedSubject,
    selectedLessonTopic,
    role,
  ]);

  const loadSubjects = useCallback(async () => {
    const res = await platformQuestionsService.subjects();
    if (!res.ok) return;
    const json = await res.json();
    setSubjectTree(json.data?.subjects || []);
  }, []);

  const loadTestYourselfSummary = useCallback(async () => {
    const res = await platformQuestionsService.testYourselfSummary();
    if (!res.ok) return;
    const json = await res.json();
    setTestYourselfTotal(json.data?.total ?? 0);
    setTestYourselfTopics(json.data?.topicCount ?? 0);
  }, []);

  const loadQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await platformQuestionsService.list(filterQuery);
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.data?.questions || []);
        setPagination((p) => ({ ...p, ...(data.data?.pagination || {}) }));
      } else {
        setQuestions([]);
      }
    } finally {
      setLoading(false);
    }
  }, [filterQuery]);

  useEffect(() => {
    loadSubjects();
    void loadTestYourselfSummary();
  }, [loadSubjects, loadTestYourselfSummary]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const scopeLabel = useMemo(() => {
    if (!selectedSubject) return 'All subjects';
    return selectedSubject;
  }, [selectedSubject]);

  const lessonOptions = useMemo(() => {
    if (!selectedSubject) return [];
    const node = subjectTree.find((n) => n.subject === selectedSubject);
    return (node?.topics ?? [])
      .map((t) => t.topic)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
  }, [selectedSubject, subjectTree]);

  const selectSubject = (subject: string | null, closeMobile = false) => {
    setSelectedSubject(subject);
    setSelectedLessonTopic('');
    setPagination((p) => ({ ...p, page: 1 }));
    if (closeMobile) setMobileNavOpen(false);
  };

  const deleteOne = async (id: string) => {
    setBusy(true);
    try {
      const res = await platformQuestionsService.remove(id);
      if (res.ok) {
        await loadQuestions();
        await loadSubjects();
        await loadTestYourselfSummary();
      }
    } finally {
      setBusy(false);
    }
  };

  const renderSubjectTree = (closeOnSelect: boolean) => (
    <>
      <button
        type="button"
        className={`mb-1 w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted ${!selectedSubject ? 'bg-primary/10 font-medium' : ''}`}
        onClick={() => selectSubject(null, closeOnSelect)}
      >
        All subjects
      </button>
      <div
        className={
          closeOnSelect
            ? 'scrollbar-hide max-h-[50vh] space-y-0.5 overflow-y-auto overscroll-contain'
            : 'space-y-0.5'
        }
      >
        {subjectTree.map((node) => (
          <button
            key={node.subject}
            type="button"
            className={`mb-0.5 w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted ${selectedSubject === node.subject ? 'bg-primary/10 font-medium' : ''}`}
            onClick={() => selectSubject(node.subject, closeOnSelect)}
          >
            {node.subject}
          </button>
        ))}
        {!subjectTree.length && (
          <p className="px-2 py-2 text-xs text-muted-foreground">No subjects yet — add a question</p>
        )}
      </div>
    </>
  );

  const activeCount = questions.filter((q) => q.isActive !== false).length;

  return (
    <main className="relative z-10 flex h-full min-h-0 flex-col overflow-hidden p-2 sm:p-4">
      <div className="shrink-0">
        <WelcomeSection title={title} description={description} />
      </div>

      {role === 'instructor' && (
        <div className="shrink-0">
          <PlatformInstructorAccessBanner
            onAccessChanged={() => {
              void loadQuestions();
              void loadSubjects();
              void loadTestYourselfSummary();
            }}
          />
        </div>
      )}

      {role === 'admin' && (
        <div className="mb-2 flex shrink-0 gap-2">
          <Button
            size="sm"
            variant={adminTab === 'questions' ? 'default' : 'outline'}
            onClick={() => setAdminTab('questions')}
          >
            Questions
          </Button>
          <Button
            size="sm"
            variant={adminTab === 'access' ? 'default' : 'outline'}
            onClick={() => setAdminTab('access')}
          >
            <LuUsers className="mr-1" size={14} />
            Access requests
          </Button>
        </div>
      )}

      {role === 'admin' && adminTab === 'access' ? (
        <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto overscroll-contain pb-4">
          <PlatformAccessRequestsPanel />
        </div>
      ) : (
        <>
      <Collapsible
        open={mobileNavOpen}
        onOpenChange={setMobileNavOpen}
        className="mb-4 shrink-0 lg:hidden"
      >
        <Card className="overflow-hidden p-0">
          <CollapsibleHeader className="rounded-none border-0 px-3 py-3 hover:bg-muted/50">
            <div className="min-w-0 flex-1 text-left">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Subject
              </p>
              <p className="truncate text-sm font-medium">{scopeLabel}</p>
            </div>
          </CollapsibleHeader>
          <CollapsibleContent>
            <div className="border-t px-3 pb-3 pt-2">{renderSubjectTree(true)}</div>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden lg:flex-row lg:gap-6">
        <aside className="hidden min-h-0 w-[260px] shrink-0 flex-col lg:flex">
          <Card className="flex min-h-0 flex-1 flex-col overflow-hidden p-3">
            <p className="mb-2 shrink-0 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Subjects & topics
            </p>
            <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto overscroll-contain">
              {renderSubjectTree(false)}
            </div>
          </Card>
        </aside>

        <div className="scrollbar-hide min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain lg:min-h-0">
          <div className="space-y-4 pb-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Card className="p-3 text-center">
                <p className="text-2xl font-bold">{pagination.total}</p>
                <p className="text-xs text-muted-foreground">In scope</p>
              </Card>
              <Card className="p-3 text-center">
                <p className="text-2xl font-bold">{activeCount}</p>
                <p className="text-xs text-muted-foreground">Active (page)</p>
              </Card>
              <Card className="p-3 text-center">
                <p className="text-2xl font-bold">{subjectTree.length}</p>
                <p className="text-xs text-muted-foreground">Subjects</p>
              </Card>
              <Card className="p-3 text-center">
                <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                  {testYourselfTotal}
                </p>
                <p className="text-xs text-muted-foreground">
                  Test Yourself ({testYourselfTopics} topics)
                </p>
              </Card>
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
              <Select
                value={difficultyFilter}
                onValueChange={(v) => {
                  setDifficultyFilter(v);
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All levels</SelectItem>
                  <SelectItem value="1">Easy (1)</SelectItem>
                  <SelectItem value="2">Medium (2)</SelectItem>
                  <SelectItem value="3">Hard (3)</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={statusFilter}
                onValueChange={(v) => {
                  setStatusFilter(v);
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={selectedLessonTopic || 'all'}
                onValueChange={(v) => {
                  setSelectedLessonTopic(v === 'all' ? '' : v);
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
                disabled={!selectedSubject}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Lesson / topic" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All lessons / topics</SelectItem>
                  {lessonOptions.map((topic) => (
                    <SelectItem key={topic} value={topic}>
                      {topic}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {role === 'admin' && (
                <Select
                  value={accessFilter}
                  onValueChange={(v) => {
                    setAccessFilter(v);
                    setPagination((p) => ({ ...p, page: 1 }));
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Access" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All access</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="shared_with_instructors">Shared</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                  </SelectContent>
                </Select>
              )}
              <Select
                value={testYourselfFilter}
                onValueChange={(v) => {
                  setTestYourselfFilter(v);
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
              >
                <SelectTrigger className="w-[170px]">
                  <SelectValue placeholder="Test Yourself" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All questions</SelectItem>
                  <SelectItem value="published">In Test Yourself</SelectItem>
                </SelectContent>
              </Select>
              <Button asChild size="sm" variant="outline">
                <Link href="/resources/test-yourself" target="_blank" rel="noopener noreferrer">
                  <LuExternalLink className="mr-1" size={16} /> Preview
                </Link>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowGenerateModal(true)}
              >
                <LuSparkles className="mr-1" size={16} /> Generate via AI
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setEditingQuestion(null);
                  setShowModal(true);
                }}
              >
                <LuPlus className="mr-1" size={16} /> Add question
              </Button>
            </Card>

            <PageSection>
              {loading ? (
                <p className="py-12 text-center text-muted-foreground">Loading questions...</p>
              ) : questions.length === 0 ? (
                <p className="py-12 text-center text-muted-foreground">No questions in this scope.</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {questions.map((q) => (
                    <Card key={q._id} className="flex flex-col gap-2 p-4">
                      <p className="line-clamp-3 text-sm">{q.questionText}</p>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="secondary" className="text-xs">
                          <LuLayers className="mr-0.5 inline" size={10} />
                          {q.subject}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {q.topic}
                        </Badge>
                        {q.subtopic && (
                          <Badge variant="outline" className="text-xs">
                            {q.subtopic}
                          </Badge>
                        )}
                        {role === 'instructor' && q.ownerType === 'admin' && (
                          <Badge className="text-xs">Admin QB</Badge>
                        )}
                        {q.hasDiagram && (
                          <Badge variant="outline" className="text-xs">
                            diagram
                          </Badge>
                        )}
                        {q.inTestYourself && (
                          <Badge className="bg-emerald-600 text-xs hover:bg-emerald-600">
                            <LuClipboardCheck className="mr-0.5 inline" size={10} />
                            Test Yourself
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1 text-xs text-muted-foreground">
                        <span>{DIFFICULTY_LABEL[q.difficulty] || q.difficulty}</span>
                        <span>·</span>
                        <span>{q.options?.length || 0} options</span>
                        {q.isActive === false && (
                          <>
                            <span>·</span>
                            <span className="text-amber-600">Inactive</span>
                          </>
                        )}
                      </div>
                      <div className="mt-auto flex gap-1">
                        {canEditQuestion(q) ? (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingQuestion(q);
                                setShowModal(true);
                              }}
                            >
                              <LuPencil size={16} />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={busy}
                              onClick={() => deleteOne(q._id)}
                            >
                              <LuTrash2 size={16} />
                            </Button>
                          </>
                        ) : (
                          <span className="px-2 text-xs text-muted-foreground">Read-only</span>
                        )}
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

      <PlatformQuestionModal
        open={showModal}
        question={editingQuestion}
        role={role}
        defaultSubject={selectedSubject}
        defaultTopic={selectedLessonTopic || null}
        onClose={() => {
          setShowModal(false);
          setEditingQuestion(null);
        }}
        onSuccess={() => {
          setShowModal(false);
          setEditingQuestion(null);
          void loadQuestions();
          void loadSubjects();
          void loadTestYourselfSummary();
        }}
      />
      <GenerateQuestionsModal
        open={showGenerateModal}
        role={role}
        defaultSubject={selectedSubject}
        defaultTopic={selectedLessonTopic || null}
        onClose={() => setShowGenerateModal(false)}
        onSuccess={() => {
          setShowGenerateModal(false);
          void loadQuestions();
          void loadSubjects();
          void loadTestYourselfSummary();
        }}
      />
        </>
      )}
    </main>
  );
}
