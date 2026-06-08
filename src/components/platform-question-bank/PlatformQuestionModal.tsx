'use client';

import { useEffect, useState, type FormEvent } from 'react';
import FormModal from '@/components/ui/form-modal';
import { AttractiveInput } from '@/components/ui/attractive-input';
import { AttractiveTextarea } from '@/components/ui/attractive-textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LuPlus as Plus, LuX as X } from 'react-icons/lu';
import {
  platformQuestionsService,
  type PlatformQuestionPayload,
} from '@/services/platformQuestionsService';
import { PlatformSubjectTopicSelect } from '@/components/platform-question-bank/PlatformSubjectTopicSelect';

export type PlatformQuestionRow = {
  _id: string;
  subject: string;
  topic: string;
  subtopic?: string;
  difficulty: 1 | 2 | 3;
  questionText: string;
  options: { text: string; isCorrect: boolean }[];
  answerText?: string;
  explanation?: string;
  hasDiagram?: boolean;
  diagramUrl?: string;
  ownerType?: 'admin' | 'instructor';
  ownerId?: string;
  accessPolicy?: 'private' | 'shared_with_instructors' | 'public';
  tags?: string[];
  isActive?: boolean;
  inTestYourself?: boolean;
  readOnly?: boolean;
};

type CurriculumContext = {
  batchId?: string;
  batchClassId?: string;
  subjectModuleId?: string;
  subjectLessonId?: string;
  courseId?: string;
  chapterId?: string;
  lessonId?: string;
};

interface Props {
  open: boolean;
  question?: PlatformQuestionRow | null;
  role: 'admin' | 'instructor';
  defaultSubject?: string | null;
  defaultTopic?: string | null;
  curriculumContext?: CurriculumContext;
  onClose: () => void;
  onSuccess: () => void;
}

const emptyForm = (): PlatformQuestionPayload => ({
  subject: '',
  topic: '',
  subtopic: '',
  difficulty: 2,
  questionText: '',
  options: [
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
  ],
  answerText: '',
  explanation: '',
  hasDiagram: false,
  diagramUrl: '',
  accessPolicy: 'private',
  tags: [],
  isActive: true,
});

export default function PlatformQuestionModal({
  open,
  question,
  role,
  defaultSubject,
  defaultTopic,
  curriculumContext,
  onClose,
  onSuccess,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<PlatformQuestionPayload>(emptyForm());
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    if (question) {
      setForm({
        subject: question.subject,
        topic: question.topic,
        subtopic: question.subtopic || '',
        difficulty: question.difficulty,
        questionText: question.questionText,
        options: question.options?.length
          ? question.options.map((o) => ({ ...o }))
          : emptyForm().options,
        answerText: question.answerText || '',
        explanation: question.explanation || '',
        hasDiagram: question.hasDiagram || false,
        diagramUrl: question.diagramUrl || '',
        accessPolicy: question.accessPolicy || 'private',
        tags: question.tags || [],
        isActive: question.isActive !== false,
      });
    } else {
      setForm({
        ...emptyForm(),
        subject: defaultSubject || '',
        topic: defaultTopic || '',
      });
    }
    setError('');
  }, [open, question, defaultSubject, defaultTopic]);

  const updateOption = (index: number, patch: Partial<{ text: string; isCorrect: boolean }>) => {
    setForm((prev) => {
      const options = [...prev.options];
      options[index] = { ...options[index], ...patch };
      return { ...prev, options };
    });
  };

  const addOption = () => {
    if (form.options.length >= 6) return;
    setForm((prev) => ({
      ...prev,
      options: [...prev.options, { text: '', isCorrect: false }],
    }));
  };

  const removeOption = (index: number) => {
    if (form.options.length <= 2) return;
    setForm((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.subject.trim() || !form.topic.trim()) {
      setError('Select a subject and topic / lesson from the list');
      return;
    }
    setLoading(true);
    try {
      const payload: PlatformQuestionPayload & CurriculumContext = {
        ...form,
        subtopic: form.subtopic?.trim() || undefined,
        answerText: form.answerText?.trim() || undefined,
        explanation: form.explanation?.trim() || undefined,
        diagramUrl: form.diagramUrl?.trim() || undefined,
        ...(curriculumContext ?? {}),
      };
      const res = question
        ? await platformQuestionsService.update(question._id, payload)
        : await platformQuestionsService.create(payload);
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error || 'Failed to save question');
        return;
      }
      onSuccess();
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormModal
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      title={question ? 'Edit platform question' : 'Add platform question'}
      description="Subject/topic bank — separate from course questions"
      loading={loading}
      size="2xl"
    >
      {error && (
        <p className="mb-3 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <PlatformSubjectTopicSelect
          subject={form.subject}
          topic={form.topic}
          onSubjectChange={(subject) => setForm((p) => ({ ...p, subject }))}
          onTopicChange={(topic) => setForm((p) => ({ ...p, topic }))}
        />
        <div>
          <label className="mb-1 block text-sm font-medium">Subtopic (optional)</label>
          <AttractiveInput
            value={form.subtopic || ''}
            onChange={(e) => setForm((p) => ({ ...p, subtopic: e.target.value }))}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Difficulty</label>
          <Select
            value={String(form.difficulty)}
            onValueChange={(v) =>
              setForm((p) => ({ ...p, difficulty: Number.parseInt(v, 10) as 1 | 2 | 3 }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 — Easy</SelectItem>
              <SelectItem value="2">2 — Medium</SelectItem>
              <SelectItem value="3">3 — Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-4">
        <label className="mb-1 block text-sm font-medium">Question text</label>
        <AttractiveTextarea
          value={form.questionText}
          onChange={(e) => setForm((p) => ({ ...p, questionText: e.target.value }))}
          rows={4}
          required
        />
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Options</label>
          <Button type="button" size="sm" variant="outline" onClick={addOption}>
            <Plus size={14} className="mr-1" /> Add option
          </Button>
        </div>
        {form.options.map((opt, i) => (
          <div key={i} className="flex items-center gap-2">
            <Checkbox
              checked={opt.isCorrect}
              onCheckedChange={(c) => updateOption(i, { isCorrect: Boolean(c) })}
            />
            <AttractiveInput
              className="flex-1"
              value={opt.text}
              onChange={(e) => updateOption(i, { text: e.target.value })}
              placeholder={`Option ${i + 1}`}
            />
            {form.options.length > 2 && (
              <Button type="button" variant="ghost" size="sm" onClick={() => removeOption(i)}>
                <X size={16} />
              </Button>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Answer text (optional)</label>
          <AttractiveInput
            value={form.answerText || ''}
            onChange={(e) => setForm((p) => ({ ...p, answerText: e.target.value }))}
          />
        </div>
        {role === 'admin' && (
          <div>
            <label className="mb-1 block text-sm font-medium">Access policy</label>
            <Select
              value={form.accessPolicy || 'private'}
              onValueChange={(v) =>
                setForm((p) => ({
                  ...p,
                  accessPolicy: v as PlatformQuestionPayload['accessPolicy'],
                }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="shared_with_instructors">Shared with instructors</SelectItem>
                <SelectItem value="public">Public (Test Yourself)</SelectItem>
              </SelectContent>
            </Select>
            {form.accessPolicy === 'public' && form.isActive !== false ? (
              <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-400">
                Published to Test Yourself when saved as active.
              </p>
            ) : form.accessPolicy === 'public' ? (
              <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
                Public but inactive — will not appear in Test Yourself until active.
              </p>
            ) : null}
          </div>
        )}
      </div>

      <div className="mt-4">
        <label className="mb-1 block text-sm font-medium">Explanation (optional)</label>
        <AttractiveTextarea
          value={form.explanation || ''}
          onChange={(e) => setForm((p) => ({ ...p, explanation: e.target.value }))}
          rows={3}
        />
      </div>

      <div className="mt-4 flex items-center gap-2">
        <Checkbox
          checked={form.isActive !== false}
          onCheckedChange={(c) => setForm((p) => ({ ...p, isActive: Boolean(c) }))}
        />
        <span className="text-sm">Active</span>
      </div>
    </FormModal>
  );
}
