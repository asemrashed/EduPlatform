'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import WelcomeSection from '@/components/WelcomeSection';
import PageSection from '@/components/PageSection';
import PlatformQuestionModal, {
  type PlatformQuestionRow,
} from '@/components/platform-question-bank/PlatformQuestionModal';
import PlatformInstructorAccessBanner from '@/components/platform-question-bank/PlatformInstructorAccessBanner';
import { platformQuestionsService } from '@/services/platformQuestionsService';
type CurriculumModuleOption = {
  _id: string;
  title: string;
  batchId: string;
  batchClassId: string;
  lessons: { _id: string; title: string }[];
};
import {
  LuPlus,
  LuSearch,
  LuPencil,
  LuExternalLink,
  LuLayers,
  LuDatabase,
} from 'react-icons/lu';

type BankRole = 'admin' | 'instructor';

type SubjectNode = {
  subject: string;
  topics: { topic: string; count?: number; testYourselfCount?: number }[];
};

interface Props {
  role: BankRole;
}

export function TestYourselfStaffWorkspace({ role }: Props) {
  const [subjectTree, setSubjectTree] = useState<SubjectNode[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [selectedLessonId, setSelectedLessonId] = useState('');
  const [curriculumModules, setCurriculumModules] = useState<CurriculumModuleOption[]>([]);

  const [questions, setQuestions] = useState<PlatformQuestionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showPickModal, setShowPickModal] = useState(false);
  const [pickQuestions, setPickQuestions] = useState<PlatformQuestionRow[]>([]);
  const [pickLoading, setPickLoading] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<PlatformQuestionRow | null>(null);
  const [busy, setBusy] = useState(false);
  const [hasAdminQbAccess, setHasAdminQbAccess] = useState(role === 'admin');

  const lessonOptions = useMemo(() => {
    if (!selectedModuleId) return [];
    const mod = curriculumModules.find((m) => m._id === selectedModuleId);
    return mod?.lessons ?? [];
  }, [curriculumModules, selectedModuleId]);

  const selectedTopic = useMemo(() => {
    if (!selectedLessonId) return null;
    return lessonOptions.find((l) => l._id === selectedLessonId)?.title ?? null;
  }, [lessonOptions, selectedLessonId]);

  const loadSubjects = useCallback(async () => {
    const res = await platformQuestionsService.subjects();
    if (!res.ok) return;
    const json = await res.json();
    setSubjectTree(json.data?.subjects ?? []);
  }, []);

  const loadAccess = useCallback(async () => {
    if (role !== 'instructor') return;
    const res = await platformQuestionsService.listAccessRequests('limit=1');
    if (!res.ok) return;
    const json = await res.json();
    setHasAdminQbAccess(Boolean(json.data?.summary?.hasActiveGrant));
  }, [role]);

  const loadCurriculum = useCallback(async (subject: string) => {
    if (!subject) {
      setCurriculumModules([]);
      return;
    }
    const res = await platformQuestionsService.curriculumOptions(subject);
    if (!res.ok) {
      setCurriculumModules([]);
      return;
    }
    const json = await res.json();
    setCurriculumModules(json.data?.modules ?? []);
  }, []);

  const buildQuery = useCallback(
    (opts?: { unpublished?: boolean }) => {
      const params = new URLSearchParams({ limit: '50', page: '1' });
      if (search.trim()) params.set('search', search.trim());
      if (selectedSubject) params.set('subject', selectedSubject);
      if (selectedTopic) params.set('topic', selectedTopic);
      if (selectedModuleId) params.set('subjectModuleId', selectedModuleId);
      if (selectedLessonId) params.set('subjectLessonId', selectedLessonId);
      if (!opts?.unpublished) params.set('testYourself', '1');
      return params.toString();
    },
    [search, selectedSubject, selectedTopic, selectedModuleId, selectedLessonId],
  );

  const loadQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await platformQuestionsService.list(buildQuery());
      if (res.ok) {
        const json = await res.json();
        setQuestions(json.data?.questions ?? []);
      } else {
        setQuestions([]);
      }
    } finally {
      setLoading(false);
    }
  }, [buildQuery]);

  const loadPickQuestions = useCallback(async () => {
    setPickLoading(true);
    try {
      const res = await platformQuestionsService.list(buildQuery({ unpublished: true }));
      if (res.ok) {
        const json = await res.json();
        const rows: PlatformQuestionRow[] = json.data?.questions ?? [];
        setPickQuestions(rows.filter((q) => !q.inTestYourself));
      } else {
        setPickQuestions([]);
      }
    } finally {
      setPickLoading(false);
    }
  }, [buildQuery]);

  useEffect(() => {
    void loadSubjects();
    void loadAccess();
  }, [loadSubjects, loadAccess]);

  useEffect(() => {
    if (selectedSubject) void loadCurriculum(selectedSubject);
    else setCurriculumModules([]);
  }, [selectedSubject, loadCurriculum]);

  useEffect(() => {
    void loadQuestions();
  }, [loadQuestions]);

  const publishQuestion = async (q: PlatformQuestionRow) => {
    if (role === 'instructor' && q.ownerType === 'admin') return;
    setBusy(true);
    try {
      const res = await platformQuestionsService.update(q._id, {
        accessPolicy: 'public' as const,
        isActive: true,
      });
      if (res.ok) {
        await loadQuestions();
        await loadSubjects();
      }
    } finally {
      setBusy(false);
    }
  };

  const unpublishQuestion = async (q: PlatformQuestionRow) => {
    if (role === 'instructor' && q.ownerType === 'admin') return;
    setBusy(true);
    try {
      const res = await platformQuestionsService.update(q._id, {
        accessPolicy: 'private',
      });
      if (res.ok) await loadQuestions();
    } finally {
      setBusy(false);
    }
  };

  const canEdit = (q: PlatformQuestionRow) =>
    role === 'admin' || q.ownerType !== 'admin';

  return (
    <main className="relative z-10 flex h-full min-h-0 flex-col overflow-hidden p-2 sm:p-4">
      <div className="shrink-0">
        <WelcomeSection
          title="Test Yourself"
          description="Publish platform questions for student practice — pick from your question bank or create for a subject/lesson."
        />
      </div>

      {role === 'instructor' && (
        <div className="shrink-0">
          <PlatformInstructorAccessBanner
            onAccessChanged={() => {
              void loadAccess();
              void loadQuestions();
              void loadSubjects();
            }}
          />
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden lg:flex-row">
        <aside className="w-full shrink-0 lg:w-[240px]">
          <Card className="p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Subjects
            </p>
            <button
              type="button"
              className={`mb-1 w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted ${!selectedSubject ? 'bg-primary/10 font-medium' : ''}`}
              onClick={() => {
                setSelectedSubject(null);
                setSelectedModuleId('');
                setSelectedLessonId('');
              }}
            >
              All subjects
            </button>
            <div className="scrollbar-hide max-h-[50vh] space-y-0.5 overflow-y-auto">
              {subjectTree.map((node) => (
                <button
                  key={node.subject}
                  type="button"
                  className={`w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted ${selectedSubject === node.subject ? 'bg-primary/10 font-medium' : ''}`}
                  onClick={() => {
                    setSelectedSubject(node.subject);
                    setSelectedModuleId('');
                    setSelectedLessonId('');
                  }}
                >
                  {node.subject}
                </button>
              ))}
              {!subjectTree.length && (
                <p className="px-2 py-2 text-xs text-muted-foreground">
                  No subjects yet — add batch curriculum or platform questions.
                </p>
              )}
            </div>
          </Card>
        </aside>

        <div className="scrollbar-hide min-h-0 min-w-0 flex-1 overflow-y-auto pb-4">
          <Card className="mb-4 flex flex-wrap items-center gap-2 p-3">
            <div className="relative min-w-[160px] flex-1">
              <LuSearch className="absolute left-2 top-2.5 text-muted-foreground" size={16} />
              <Input
                className="pl-8"
                placeholder="Search questions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select
              value={selectedModuleId || 'all'}
              onValueChange={(v) => {
                setSelectedModuleId(v === 'all' ? '' : v);
                setSelectedLessonId('');
              }}
              disabled={!selectedSubject || !curriculumModules.length}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Module" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All modules</SelectItem>
                {curriculumModules.map((m) => (
                  <SelectItem key={m._id} value={m._id}>
                    {m.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={selectedLessonId || 'all'}
              onValueChange={(v) => setSelectedLessonId(v === 'all' ? '' : v)}
              disabled={!selectedModuleId || !lessonOptions.length}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Lesson / topic" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All lessons</SelectItem>
                {lessonOptions.map((l) => (
                  <SelectItem key={l._id} value={l._id}>
                    {l.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              onClick={() => {
                setEditingQuestion(null);
                setShowModal(true);
              }}
            >
              <LuPlus className="mr-1" size={16} /> Create question
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                void loadPickQuestions();
                setShowPickModal(true);
              }}
            >
              <LuDatabase className="mr-1" size={16} /> Add from QB
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/resources/test-yourself" target="_blank" rel="noopener noreferrer">
                <LuExternalLink className="mr-1" size={16} /> Preview
              </Link>
            </Button>
          </Card>

          <PageSection>
            {loading ? (
              <p className="py-12 text-center text-muted-foreground">Loading...</p>
            ) : questions.length === 0 ? (
              <p className="py-12 text-center text-muted-foreground">
                No published Test Yourself questions in this scope.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {questions.map((q) => (
                  <Card key={q._id} className="flex flex-col gap-2 p-4">
                    <p className="line-clamp-2 text-sm">{q.questionText}</p>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="secondary" className="text-xs">
                        <LuLayers className="mr-0.5 inline" size={10} />
                        {q.subject}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {q.topic}
                      </Badge>
                    </div>
                    <div className="mt-auto flex gap-1">
                      {canEdit(q) && (
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
                            variant="outline"
                            disabled={busy}
                            onClick={() => void unpublishQuestion(q)}
                          >
                            Unpublish
                          </Button>
                        </>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </PageSection>
        </div>
      </div>

      {showPickModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="max-h-[80vh] w-full max-w-2xl overflow-hidden p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold">Add from question bank</h3>
              <Button size="sm" variant="ghost" onClick={() => setShowPickModal(false)}>
                Close
              </Button>
            </div>
            {pickLoading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : pickQuestions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No unpublished questions in scope.
                {role === 'instructor' && !hasAdminQbAccess
                  ? ' Request admin QB access to import admin questions.'
                  : null}
              </p>
            ) : (
              <div className="scrollbar-hide max-h-[60vh] space-y-2 overflow-y-auto">
                {pickQuestions.map((q) => (
                  <div
                    key={q._id}
                    className="flex items-start justify-between gap-2 rounded-lg border p-3"
                  >
                    <div className="min-w-0">
                      <p className="line-clamp-2 text-sm">{q.questionText}</p>
                      <p className="text-xs text-muted-foreground">
                        {q.subject} · {q.topic}
                        {q.ownerType === 'admin' ? ' · Admin QB' : ''}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      disabled={
                        busy ||
                        (q.ownerType === 'admin' && role === 'instructor' && !hasAdminQbAccess)
                      }
                      onClick={() => void publishQuestion(q)}
                    >
                      Publish
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      <PlatformQuestionModal
        open={showModal}
        question={editingQuestion}
        role={role}
        defaultSubject={selectedSubject}
        defaultTopic={selectedTopic}
        curriculumContext={
          selectedModuleId && selectedLessonId
            ? {
                batchId: curriculumModules.find((m) => m._id === selectedModuleId)?.batchId,
                batchClassId: curriculumModules.find((m) => m._id === selectedModuleId)
                  ?.batchClassId,
                subjectModuleId: selectedModuleId,
                subjectLessonId: selectedLessonId,
              }
            : undefined
        }
        onClose={() => {
          setShowModal(false);
          setEditingQuestion(null);
        }}
        onSuccess={() => {
          setShowModal(false);
          setEditingQuestion(null);
          void loadQuestions();
          void loadSubjects();
        }}
      />
    </main>
  );
}
