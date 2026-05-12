'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AdminRoleShell } from '@/components/role-area/AdminRoleShell';
import { InstructorRoleShell } from '@/components/role-area/InstructorRoleShell';
import PageSection from '@/components/PageSection';
import WelcomeSection from '@/components/WelcomeSection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ConfirmModal from '@/components/ui/confirm-modal';
import {
  LuArrowLeft as ArrowLeft,
  LuUser as User,
  LuCalendar as Calendar,
  LuTarget as Target,
  LuDownload as Download,
  LuTrash2 as Trash2,
  LuSave as Save,
} from 'react-icons/lu';

type Variant = 'admin' | 'instructor';

type QuestionItem = {
  questionId: string;
  question: string;
  type: string;
  marks: number;
  options: Array<{ index: string; text: string; isCorrect: boolean }>;
  studentSelected: string[];
  studentWritten: string;
  marksObtained: number;
  isCorrect?: boolean;
  gradingStatus?: string;
};

function isManualQuestionType(type: string) {
  return type === 'written' || type === 'essay' || type === 'fill_blank';
}

function isAutoQuestionType(type: string) {
  return type === 'mcq' || type === 'true_false';
}

function clampMarks(value: number, max: number) {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(max, value));
}

export default function ExamAttemptGradeView({ variant }: { variant: Variant }) {
  const params = useParams();
  const router = useRouter();
  const examId = params.id as string;
  const attemptId = params.attemptId as string;

  const apiBase = variant === 'admin' ? '/api/exams' : '/api/instructor/exams';
  const attemptsListPath = variant === 'admin' ? `/admin/exams/${examId}/attempts` : `/instructor/exams/${examId}/attempts`;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [examTitle, setExamTitle] = useState('');
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [attempt, setAttempt] = useState<{
    status: string;
    student: { name: string; email: string };
    percentage?: number;
    marksObtained?: number;
    totalMarks?: number;
    isPassed?: boolean;
    submittedAt?: string;
    attemptNumber?: number;
  } | null>(null);
  const [manualMarks, setManualMarks] = useState<Record<string, string>>({});
  const [confirmDelete, setConfirmDelete] = useState(false);

  const hasManualQuestions = useMemo(
    () => questions.some((q) => isManualQuestionType(q.type)),
    [questions],
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/${examId}/attempts/${attemptId}`, { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) {
        setQuestions([]);
        setAttempt(null);
        return;
      }
      const payload = data.data;
      setExamTitle(payload?.exam?.title || '');
      setAttempt(payload?.attempt || null);
      const qs: QuestionItem[] = Array.isArray(payload?.questions) ? payload.questions : [];
      setQuestions(qs);
      const init: Record<string, string> = {};
      for (const q of qs) {
        if (isManualQuestionType(q.type)) {
          init[q.questionId] = String(typeof q.marksObtained === 'number' ? q.marksObtained : '');
        }
      }
      setManualMarks(init);
    } finally {
      setLoading(false);
    }
  }, [apiBase, examId, attemptId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDownloadJson = () => {
    const blob = new Blob(
      [JSON.stringify({ examId, attemptId, attempt, questions }, null, 2)],
      { type: 'application/json' },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `exam-attempt-${attemptId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const attemptGradable = Boolean(
    attempt && (attempt.status === 'completed' || attempt.status === 'pending_review'),
  );

  const handleSaveGrades = async () => {
    if (!attemptGradable || questions.length === 0) return;
    const answerGrades = questions.map((q) => {
      const max = Number(q.marks || 0);
      if (isManualQuestionType(q.type)) {
        const raw = parseFloat(manualMarks[q.questionId] ?? '');
        return { questionId: q.questionId, marksObtained: clampMarks(raw, max) };
      }
      return { questionId: q.questionId, marksObtained: clampMarks(Number(q.marksObtained) || 0, max) };
    });

    setSaving(true);
    try {
      const res = await fetch(`${apiBase}/${examId}/attempts/${attemptId}/grade`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answerGrades }),
      });
      const data = await res.json();
      if (res.ok && data.data?.attempt) {
        setAttempt((prev) =>
          prev
            ? {
                ...prev,
                marksObtained: data.data.attempt.marksObtained,
                percentage: data.data.attempt.percentage,
                isPassed: data.data.attempt.isPassed,
              }
            : prev,
        );
        await load();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (variant !== 'admin') return;
    setDeleting(true);
    try {
      const res = await fetch(`${apiBase}/${examId}/attempts/${attemptId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        router.push(attemptsListPath);
      }
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const main = (
    <main className="relative z-10 p-2 sm:p-4">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Button variant="ghost" onClick={() => router.push(attemptsListPath)} className="text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to attempts
        </Button>
        <Button variant="outline" size="sm" onClick={handleDownloadJson} type="button">
          <Download className="w-4 h-4 mr-2" />
          Download JSON
        </Button>
        {variant === 'admin' && (
          <Button variant="destructive" size="sm" type="button" onClick={() => setConfirmDelete(true)}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete attempt
          </Button>
        )}
      </div>

      <WelcomeSection title={examTitle ? `Grade — ${examTitle}` : 'Exam attempt'} description="Review answers and adjust manual marks." />

      <PageSection title="Overview" className="mb-4">
        <Card className="border-2 border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="w-5 h-5 text-blue-600" />
              {attempt?.student?.name || 'Student'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-700">
            <div className="flex flex-wrap gap-4">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-gray-500" />
                Submitted: {attempt?.submittedAt ? new Date(attempt.submittedAt).toLocaleString() : '—'}
              </span>
              <span className="flex items-center gap-1">
                <Target className="w-4 h-4 text-gray-500" />
                Attempt #{attempt?.attemptNumber ?? '—'}
              </span>
              <Badge variant="outline">{attempt?.status || '—'}</Badge>
            </div>
            <div>
              Score:{' '}
              {attemptGradable && attempt ? (
                <>
                  {Number(attempt.marksObtained ?? 0).toFixed(1)} / {Number(attempt.totalMarks ?? 0)} (
                  {Number(attempt.percentage ?? 0).toFixed(1)}%)
                  <span className="ml-2">
                    {attempt.isPassed ? (
                      <Badge className="bg-green-100 text-green-800">Passed</Badge>
                    ) : (
                      <Badge variant="secondary">Not passed</Badge>
                    )}
                  </span>
                </>
              ) : (
                '—'
              )}
            </div>
            {attempt?.status === 'in_progress' && (
              <p className="text-amber-700">This attempt is still in progress and cannot be graded yet.</p>
            )}
          </CardContent>
        </Card>
      </PageSection>

      <PageSection title="Questions" className="mb-4">
        {loading ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : (
          <div className="space-y-4">
            {questions.map((q) => {
              const selected = new Set((q.studentSelected || []).map(String));
              return (
                <Card key={q.questionId} className="border border-gray-200">
                  <CardHeader className="pb-2">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <CardTitle className="text-sm font-medium text-gray-900 leading-snug">{q.question}</CardTitle>
                      <div className="flex gap-2 shrink-0">
                        <Badge variant="outline" className="capitalize">
                          {q.type.replace('_', ' ')}
                        </Badge>
                        <Badge variant="secondary">Max {q.marks} marks</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    {isAutoQuestionType(q.type) && (
                      <>
                        <div className="flex flex-wrap gap-2">
                          {typeof q.isCorrect === 'boolean' &&
                            (q.isCorrect ? (
                              <Badge className="bg-green-100 text-green-800">Correct</Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-800">Incorrect</Badge>
                            ))}
                          <Badge variant="outline">Awarded: {Number(q.marksObtained ?? 0).toFixed(1)}</Badge>
                        </div>
                        <div className="space-y-1">
                          {q.options?.map((opt) => {
                            const sel = selected.has(String(opt.index));
                            return (
                              <div
                                key={opt.index}
                                className={`rounded-md border px-2 py-1.5 ${sel ? 'border-blue-400 bg-blue-50' : 'border-gray-100 bg-gray-50'} ${opt.isCorrect ? 'ring-1 ring-green-200' : ''}`}
                              >
                                <span className="text-gray-800">{opt.text}</span>
                                {opt.isCorrect && <span className="ml-2 text-xs text-green-700">(correct)</span>}
                                {sel && <span className="ml-2 text-xs text-blue-700">(selected)</span>}
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}

                    {isManualQuestionType(q.type) && (
                      <div className="space-y-2">
                        <div className="rounded-md border border-gray-100 bg-gray-50 p-3 whitespace-pre-wrap text-gray-900">
                          {q.studentWritten?.trim() ? q.studentWritten : <span className="text-gray-400 italic">No written answer</span>}
                        </div>
                        <div className="flex flex-wrap items-end gap-2">
                          <label className="text-xs font-medium text-gray-600 block">
                            Marks obtained
                            <Input
                              type="number"
                              min={0}
                              max={q.marks}
                              step={0.5}
                              className="mt-1 w-32"
                              disabled={!attemptGradable}
                              value={manualMarks[q.questionId] ?? ''}
                              onChange={(e) => setManualMarks((prev) => ({ ...prev, [q.questionId]: e.target.value }))}
                            />
                          </label>
                          <span className="text-xs text-gray-500 pb-2">of {q.marks}</span>
                        </div>
                      </div>
                    )}

                    {!isAutoQuestionType(q.type) && !isManualQuestionType(q.type) && (
                      <p className="text-gray-500">Unsupported question type for this view.</p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </PageSection>

      {attemptGradable && questions.length > 0 && (
        <PageSection title="Save grades" className="mb-8">
          <p className="text-sm text-gray-600 mb-3">
            {hasManualQuestions
              ? 'Adjust marks for written-style questions, then save. Auto-scored questions are included as-is.'
              : 'All questions are auto-scored. Saving re-syncs totals with the server.'}
          </p>
          <Button onClick={handleSaveGrades} disabled={saving} type="button">
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving…' : 'Save grades'}
          </Button>
        </PageSection>
      )}

      <ConfirmModal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Delete attempt"
        description="This permanently removes the student attempt. Continue?"
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={deleting}
      />
    </main>
  );

  if (variant === 'admin') {
    return <AdminRoleShell>{main}</AdminRoleShell>;
  }
  return <InstructorRoleShell>{main}</InstructorRoleShell>;
}
