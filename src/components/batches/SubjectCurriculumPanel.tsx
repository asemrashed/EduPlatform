'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  subjectCurriculumService,
  type SubjectLessonRecord,
  type SubjectModuleWithLessons,
} from '@/services/subjectCurriculumService';
import type { BatchClassRecord } from '@/services/batchesService';
import { confirmDelete, showError, showSuccess } from '@/lib/swal';
import {
  LuArrowLeft as ArrowLeft,
  LuChevronDown as ChevronDown,
  LuChevronRight as ChevronRight,
  LuPencil as Pencil,
  LuPlus as Plus,
  LuTrash2 as Trash2,
  LuVideo as Video,
  LuRadio as Radio,
  LuX as X,
} from 'react-icons/lu';

const emptyModuleForm = { title: '', description: '' };

type LessonFormState = {
  title: string;
  description: string;
  type: 'live' | 'recorded';
  scheduledAt: string;
  durationMinutes: string;
  meetLink: string;
  recordingUrl: string;
  videoUrl: string;
  isPublished: boolean;
};

const emptyLessonForm = (): LessonFormState => ({
  title: '',
  description: '',
  type: 'recorded',
  scheduledAt: '',
  durationMinutes: '60',
  meetLink: '',
  recordingUrl: '',
  videoUrl: '',
  isPublished: true,
});

function toDatetimeLocal(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function lessonToForm(lesson: SubjectLessonRecord): LessonFormState {
  return {
    title: lesson.title,
    description: lesson.description ?? '',
    type: lesson.type,
    scheduledAt: toDatetimeLocal(lesson.scheduledAt),
    durationMinutes: String(lesson.durationMinutes ?? 60),
    meetLink: lesson.meetLink ?? '',
    recordingUrl: lesson.recordingUrl ?? '',
    videoUrl: lesson.youtubeVideoId
      ? lesson.youtubeVideoId
      : (lesson.videoUrl ?? ''),
    isPublished: lesson.isPublished !== false,
  };
}

function LessonFormFields({
  form,
  onChange,
  idPrefix,
}: {
  form: LessonFormState;
  onChange: (patch: Partial<LessonFormState>) => void;
  idPrefix: string;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Label htmlFor={`${idPrefix}-title`}>Lesson title</Label>
        <Input
          id={`${idPrefix}-title`}
          value={form.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="e.g. Class 3 — Newton's Laws"
        />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor={`${idPrefix}-desc`}>Description (optional)</Label>
        <Input
          id={`${idPrefix}-desc`}
          value={form.description}
          onChange={(e) => onChange({ description: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor={`${idPrefix}-type`}>Type</Label>
        <select
          id={`${idPrefix}-type`}
          className="mt-1 flex h-9 w-full rounded-md border bg-background px-3 text-sm"
          value={form.type}
          onChange={(e) =>
            onChange({ type: e.target.value as 'live' | 'recorded' })
          }
        >
          <option value="recorded">Recorded</option>
          <option value="live">Live class</option>
        </select>
      </div>
      <div className="flex items-end gap-2 pb-1">
        <input
          id={`${idPrefix}-published`}
          type="checkbox"
          checked={form.isPublished}
          onChange={(e) => onChange({ isPublished: e.target.checked })}
        />
        <Label htmlFor={`${idPrefix}-published`}>Published</Label>
      </div>
      {form.type === 'live' ? (
        <>
          <div>
            <Label htmlFor={`${idPrefix}-at`}>Scheduled at</Label>
            <Input
              id={`${idPrefix}-at`}
              type="datetime-local"
              value={form.scheduledAt}
              onChange={(e) => onChange({ scheduledAt: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor={`${idPrefix}-dur`}>Duration (minutes)</Label>
            <Input
              id={`${idPrefix}-dur`}
              type="number"
              value={form.durationMinutes}
              onChange={(e) => onChange({ durationMinutes: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor={`${idPrefix}-meet`}>Meet / Zoom link</Label>
            <Input
              id={`${idPrefix}-meet`}
              value={form.meetLink}
              onChange={(e) => onChange({ meetLink: e.target.value })}
              placeholder="https://meet.google.com/..."
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor={`${idPrefix}-rec`}>Recording URL (after class)</Label>
            <Input
              id={`${idPrefix}-rec`}
              value={form.recordingUrl}
              onChange={(e) => onChange({ recordingUrl: e.target.value })}
            />
          </div>
        </>
      ) : (
        <>
          <div className="sm:col-span-2">
            <Label htmlFor={`${idPrefix}-video`}>YouTube URL or video ID</Label>
            <Input
              id={`${idPrefix}-video`}
              value={form.videoUrl}
              onChange={(e) => onChange({ videoUrl: e.target.value })}
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor={`${idPrefix}-rec-url`}>Recording URL (optional)</Label>
            <Input
              id={`${idPrefix}-rec-url`}
              value={form.recordingUrl}
              onChange={(e) => onChange({ recordingUrl: e.target.value })}
            />
          </div>
        </>
      )}
    </div>
  );
}

function buildLessonPayload(form: LessonFormState, moduleId?: string) {
  return {
    ...(moduleId ? { moduleId } : {}),
    title: form.title.trim(),
    description: form.description.trim() || undefined,
    type: form.type,
    isPublished: form.isPublished,
    scheduledAt: form.type === 'live' && form.scheduledAt ? form.scheduledAt : undefined,
    durationMinutes:
      form.type === 'live' ? Number(form.durationMinutes) || 60 : undefined,
    meetLink: form.type === 'live' ? form.meetLink.trim() || undefined : undefined,
    recordingUrl: form.recordingUrl.trim() || undefined,
    videoUrl: form.videoUrl.trim() || undefined,
  };
}

export function SubjectCurriculumPanel({
  batchId,
  subjectId,
  backHref,
}: {
  batchId: string;
  subjectId: string;
  backHref: string;
}) {
  const [subject, setSubject] = useState<BatchClassRecord | null>(null);
  const [modules, setModules] = useState<SubjectModuleWithLessons[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [moduleForm, setModuleForm] = useState(emptyModuleForm);
  const [savingModule, setSavingModule] = useState(false);
  const [lessonForms, setLessonForms] = useState<Record<string, LessonFormState>>({});
  const [savingLesson, setSavingLesson] = useState<string | null>(null);

  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [editModuleForm, setEditModuleForm] = useState({
    title: '',
    description: '',
    isPublished: true,
  });
  const [updatingModule, setUpdatingModule] = useState(false);

  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [editLessonForm, setEditLessonForm] = useState<LessonFormState>(emptyLessonForm());
  const [updatingLesson, setUpdatingLesson] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await subjectCurriculumService.getCurriculum(batchId, subjectId);
    if (res.success && res.data) {
      setSubject(res.data.subject);
      setModules(res.data.modules);
      setExpandedModules((prev) => {
        const next = new Set(prev);
        for (const mod of res.data!.modules) next.add(mod._id);
        return next;
      });
    } else {
      setError(res.error || 'Failed to load curriculum');
    }
    setLoading(false);
  }, [batchId, subjectId]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleModule = (id: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getLessonForm = (moduleId: string) =>
    lessonForms[moduleId] ?? emptyLessonForm();

  const setLessonForm = (moduleId: string, patch: Partial<LessonFormState>) => {
    setLessonForms((prev) => ({
      ...prev,
      [moduleId]: { ...getLessonForm(moduleId), ...patch },
    }));
  };

  const handleAddModule = async () => {
    if (!moduleForm.title.trim()) return;
    setSavingModule(true);
    const res = await subjectCurriculumService.createModule(batchId, subjectId, {
      title: moduleForm.title.trim(),
      description: moduleForm.description.trim() || undefined,
    });
    setSavingModule(false);
    if (res.success) {
      setModuleForm(emptyModuleForm);
      await showSuccess('Module added');
      load();
    } else {
      setError(res.error || 'Failed to add module');
    }
  };

  const startEditModule = (mod: SubjectModuleWithLessons) => {
    setEditingModuleId(mod._id);
    setEditModuleForm({
      title: mod.title,
      description: mod.description ?? '',
      isPublished: mod.isPublished !== false,
    });
    setEditingLessonId(null);
  };

  const handleUpdateModule = async (moduleId: string) => {
    if (!editModuleForm.title.trim()) return;
    setUpdatingModule(true);
    const res = await subjectCurriculumService.updateModule(batchId, subjectId, moduleId, {
      title: editModuleForm.title.trim(),
      description: editModuleForm.description.trim() || undefined,
      isPublished: editModuleForm.isPublished,
    });
    setUpdatingModule(false);
    if (res.success) {
      setEditingModuleId(null);
      await showSuccess('Module updated');
      load();
    } else {
      await showError(res.error || 'Failed to update module');
    }
  };

  const handleDeleteModule = async (moduleId: string, title: string) => {
    const ok = await confirmDelete(
      'Delete module?',
      `"${title}" and all its lessons will be permanently removed.`,
    );
    if (!ok) return;
    const res = await subjectCurriculumService.deleteModule(batchId, subjectId, moduleId);
    if (res.success) {
      if (editingModuleId === moduleId) setEditingModuleId(null);
      await showSuccess('Module deleted');
      load();
    } else {
      await showError(res.error || 'Failed to delete module');
    }
  };

  const handleAddLesson = async (moduleId: string) => {
    const form = getLessonForm(moduleId);
    if (!form.title.trim()) return;
    setSavingLesson(moduleId);
    const res = await subjectCurriculumService.createLesson(
      batchId,
      subjectId,
      buildLessonPayload(form, moduleId),
    );
    setSavingLesson(null);
    if (res.success) {
      setLessonForms((prev) => ({ ...prev, [moduleId]: emptyLessonForm() }));
      await showSuccess('Lesson added');
      load();
    } else {
      setError(res.error || 'Failed to add lesson');
    }
  };

  const startEditLesson = (lesson: SubjectLessonRecord) => {
    setEditingLessonId(lesson._id);
    setEditLessonForm(lessonToForm(lesson));
    setEditingModuleId(null);
  };

  const handleUpdateLesson = async (lessonId: string) => {
    if (!editLessonForm.title.trim()) return;
    setUpdatingLesson(true);
    const res = await subjectCurriculumService.updateLesson(
      batchId,
      subjectId,
      lessonId,
      buildLessonPayload(editLessonForm),
    );
    setUpdatingLesson(false);
    if (res.success) {
      setEditingLessonId(null);
      await showSuccess('Lesson updated');
      load();
    } else {
      await showError(res.error || 'Failed to update lesson');
    }
  };

  const handleDeleteLesson = async (lesson: SubjectLessonRecord) => {
    const ok = await confirmDelete(
      'Delete lesson?',
      `"${lesson.title}" will be permanently removed.`,
    );
    if (!ok) return;
    const res = await subjectCurriculumService.deleteLesson(
      batchId,
      subjectId,
      lesson._id,
    );
    if (res.success) {
      if (editingLessonId === lesson._id) setEditingLessonId(null);
      await showSuccess('Lesson deleted');
      load();
    } else {
      await showError(res.error || 'Failed to delete lesson');
    }
  };

  if (loading) {
    return <p className="text-muted-foreground">Loading curriculum…</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href={backHref}>
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to batch
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">{subject?.title ?? 'Subject'}</h1>
          <p className="text-sm text-muted-foreground">
            {subject?.categoryName} · {subject?.instructorName}
          </p>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add module</CardTitle>
          <p className="text-sm text-muted-foreground">
            Modules group related class sessions (e.g. &quot;Chapter 1 — Mechanics&quot;).
          </p>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Module title</Label>
            <Input
              value={moduleForm.title}
              onChange={(e) => setModuleForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Module 1 — Introduction"
            />
          </div>
          <div>
            <Label>Description (optional)</Label>
            <Input
              value={moduleForm.description}
              onChange={(e) =>
                setModuleForm((f) => ({ ...f, description: e.target.value }))
              }
            />
          </div>
          <div>
            <Button disabled={savingModule} onClick={handleAddModule}>
              {savingModule ? 'Adding…' : 'Add module'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {modules.length === 0 ? (
        <p className="text-sm text-muted-foreground">No modules yet. Add one above.</p>
      ) : (
        <div className="space-y-4">
          {modules.map((mod) => {
            const expanded = expandedModules.has(mod._id);
            const form = getLessonForm(mod._id);
            const isEditingModule = editingModuleId === mod._id;
            return (
              <Card key={mod._id}>
                <CardHeader className="pb-2">
                  {isEditingModule ? (
                    <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
                      <p className="text-sm font-medium">Edit module</p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <Label>Title</Label>
                          <Input
                            value={editModuleForm.title}
                            onChange={(e) =>
                              setEditModuleForm((f) => ({ ...f, title: e.target.value }))
                            }
                          />
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Input
                            value={editModuleForm.description}
                            onChange={(e) =>
                              setEditModuleForm((f) => ({
                                ...f,
                                description: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            id={`mod-pub-${mod._id}`}
                            type="checkbox"
                            checked={editModuleForm.isPublished}
                            onChange={(e) =>
                              setEditModuleForm((f) => ({
                                ...f,
                                isPublished: e.target.checked,
                              }))
                            }
                          />
                          <Label htmlFor={`mod-pub-${mod._id}`}>Published</Label>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          disabled={updatingModule}
                          onClick={() => handleUpdateModule(mod._id)}
                        >
                          {updatingModule ? 'Saving…' : 'Save changes'}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingModuleId(null)}
                        >
                          <X className="mr-1 h-4 w-4" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <button
                        type="button"
                        className="flex items-center gap-2 text-left font-semibold"
                        onClick={() => toggleModule(mod._id)}
                      >
                        {expanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                        {mod.title}
                        {!mod.isPublished && (
                          <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs font-normal text-amber-800">
                            Draft
                          </span>
                        )}
                        <span className="text-xs font-normal text-muted-foreground">
                          ({mod.lessons.length} lesson{mod.lessons.length === 1 ? '' : 's'})
                        </span>
                      </button>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditModule(mod)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() => handleDeleteModule(mod._id, mod.title)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                  {!isEditingModule && mod.description && (
                    <p className="text-sm text-muted-foreground">{mod.description}</p>
                  )}
                </CardHeader>
                {expanded && !isEditingModule && (
                  <CardContent className="space-y-4 border-t pt-4">
                    {mod.lessons.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No lessons in this module.</p>
                    ) : (
                      <ul className="space-y-2">
                        {mod.lessons.map((lesson) => {
                          const isEditingLesson = editingLessonId === lesson._id;
                          return (
                            <li key={lesson._id} className="rounded-lg border">
                              {isEditingLesson ? (
                                <div className="space-y-3 p-4">
                                  <p className="text-sm font-medium">Edit lesson</p>
                                  <LessonFormFields
                                    idPrefix={`edit-${lesson._id}`}
                                    form={editLessonForm}
                                    onChange={(patch) =>
                                      setEditLessonForm((f) => ({ ...f, ...patch }))
                                    }
                                  />
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      disabled={updatingLesson}
                                      onClick={() => handleUpdateLesson(lesson._id)}
                                    >
                                      {updatingLesson ? 'Saving…' : 'Save changes'}
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => setEditingLessonId(null)}
                                    >
                                      <X className="mr-1 h-4 w-4" />
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm">
                                  <div className="flex items-center gap-2">
                                    {lesson.type === 'live' ? (
                                      <Radio className="h-4 w-4 text-red-500" />
                                    ) : (
                                      <Video className="h-4 w-4 text-blue-500" />
                                    )}
                                    <div>
                                      <p className="font-medium">
                                        {lesson.title}
                                        {!lesson.isPublished && (
                                          <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-xs font-normal text-amber-800">
                                            Draft
                                          </span>
                                        )}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {lesson.type === 'live'
                                          ? lesson.scheduledAt
                                            ? new Date(lesson.scheduledAt).toLocaleString()
                                            : 'Live (no schedule)'
                                          : 'Recorded'}
                                        {lesson.type === 'live' && lesson.durationMinutes
                                          ? ` · ${lesson.durationMinutes} min`
                                          : ''}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => startEditLesson(lesson)}
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-destructive"
                                      onClick={() => handleDeleteLesson(lesson)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    )}

                    <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                      <p className="text-sm font-medium flex items-center gap-1">
                        <Plus className="h-4 w-4" /> Add lesson
                      </p>
                      <LessonFormFields
                        idPrefix={`add-${mod._id}`}
                        form={form}
                        onChange={(patch) => setLessonForm(mod._id, patch)}
                      />
                      <div>
                        <Button
                          disabled={savingLesson === mod._id}
                          onClick={() => handleAddLesson(mod._id)}
                        >
                          {savingLesson === mod._id ? 'Adding…' : 'Add lesson'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export { toDatetimeLocal };
