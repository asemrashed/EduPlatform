'use client';

import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  batchesService,
  type BatchRecord,
  type BatchScheduleSlot,
  type LiveClassRecord,
} from '@/services/batchesService';
import { BatchCalendar } from '@/components/batches/BatchCalendar';
import { BatchClassesPanel } from '@/components/batches/BatchClassesPanel';
import { BatchRoutineWorkspace } from '@/components/batches/BatchRoutineWorkspace';
import {
  BatchMarketingFormFields,
  type BatchMarketingFormState,
} from '@/components/batches/BatchMarketingFormFields';
import {
  WEEKDAY_LABELS,
  emptyLiveClassForm,
  liveClassToForm,
  newRoutineSlot,
  toDateInputValue,
} from '@/components/batches/batchFormUtils';
import {
  LuArrowLeft as ArrowLeft,
  LuExternalLink as ExternalLink,
  LuCalendar as Calendar,
  LuPencil as Pencil,
  LuTrash2 as Trash2,
} from 'react-icons/lu';

type TabId =
  | 'routine'
  | 'batchClasses'
  | 'sessions'
  | 'calendar'
  | 'attendance'
  | 'settings';

type WeeklyDay = {
  dayOfWeek: number;
  label: string;
  slots: BatchScheduleSlot[];
};

function recurrenceLabel(r?: string, monthDay?: number) {
  if (r === 'weekly') return 'Weekly';
  if (r === 'monthly') return monthDay ? `Monthly (${monthDay}th)` : 'Monthly';
  if (r === 'once') return 'One-time';
  return null;
}

function LiveClassFormFields({
  form,
  setForm,
  idPrefix,
}: {
  form: ReturnType<typeof emptyLiveClassForm>;
  setForm: Dispatch<SetStateAction<ReturnType<typeof emptyLiveClassForm>>>;
  idPrefix: string;
}) {
  return (
    <>
      <div>
        <Label htmlFor={`${idPrefix}-title`}>Title</Label>
        <Input
          id={`${idPrefix}-title`}
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
        />
      </div>
      <div>
        <Label htmlFor={`${idPrefix}-at`}>Scheduled at</Label>
        <Input
          id={`${idPrefix}-at`}
          type="datetime-local"
          value={form.scheduledAt}
          onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))}
        />
      </div>
      <div>
        <Label htmlFor={`${idPrefix}-dur`}>Duration (minutes)</Label>
        <Input
          id={`${idPrefix}-dur`}
          type="number"
          value={form.durationMinutes}
          onChange={(e) => setForm((f) => ({ ...f, durationMinutes: e.target.value }))}
        />
      </div>
      <div>
        <Label htmlFor={`${idPrefix}-type`}>Type</Label>
        <select
          id={`${idPrefix}-type`}
          className="flex h-9 w-full rounded-md border px-3 text-sm"
          value={form.type}
          onChange={(e) =>
            setForm((f) => ({ ...f, type: e.target.value as 'live' | 'recorded' }))
          }
        >
          <option value="live">Live</option>
          <option value="recorded">Recorded</option>
        </select>
      </div>
      <div>
        <Label htmlFor={`${idPrefix}-rec`}>Repeat</Label>
        <select
          id={`${idPrefix}-rec`}
          className="flex h-9 w-full rounded-md border px-3 text-sm"
          value={form.recurrence}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              recurrence: e.target.value as 'once' | 'weekly' | 'monthly',
            }))
          }
        >
          <option value="once">One-time only</option>
          <option value="weekly">Weekly (adds to routine)</option>
          <option value="monthly">Monthly (adds to routine)</option>
        </select>
      </div>
      <div>
        <Label htmlFor={`${idPrefix}-meet`}>Meet link</Label>
        <Input
          id={`${idPrefix}-meet`}
          value={form.meetLink}
          onChange={(e) => setForm((f) => ({ ...f, meetLink: e.target.value }))}
          placeholder="https://meet.google.com/..."
        />
      </div>
      <div>
        <Label htmlFor={`${idPrefix}-rec-url`}>Recording URL</Label>
        <Input
          id={`${idPrefix}-rec-url`}
          value={form.recordingUrl}
          onChange={(e) => setForm((f) => ({ ...f, recordingUrl: e.target.value }))}
        />
      </div>
    </>
  );
}

export function BatchDetailWorkspace({
  batchId,
  listHref,
  titlePrefix = 'Batch',
}: {
  batchId: string;
  listHref: string;
  titlePrefix?: string;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<TabId>('routine');
  const [batch, setBatch] = useState<BatchRecord | null>(null);
  const [canManage, setCanManage] = useState(false);
  const [weekly, setWeekly] = useState<WeeklyDay[]>([]);
  const [scheduleDraft, setScheduleDraft] = useState<BatchScheduleSlot[]>([]);
  const [liveClasses, setLiveClasses] = useState<LiveClassRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [instructorIdsDraft, setInstructorIdsDraft] = useState<string[]>([]);
  const [instructorOptions, setInstructorOptions] = useState<{ _id: string; label: string }[]>(
    [],
  );
  const [batchForm, setBatchForm] = useState<BatchMarketingFormState & { isActive: boolean }>({
    name: '',
    grade: 'O',
    shortDescription: '',
    description: '',
    thumbnailUrl: '',
    videoUrl: '',
    startDate: '',
    endDate: '',
    maxStudents: '30',
    fee: '0',
    isActive: true,
  });
  const [batchFeatures, setBatchFeatures] = useState<string[]>([]);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [savingBatch, setSavingBatch] = useState(false);
  const [savingRoutine, setSavingRoutine] = useState(false);

  const [lcForm, setLcForm] = useState(emptyLiveClassForm);
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [editLcForm, setEditLcForm] = useState(emptyLiveClassForm);
  const [savingClass, setSavingClass] = useState(false);

  const [selectedClassId, setSelectedClassId] = useState('');
  const [roster, setRoster] = useState<
    { studentId: string; name: string; status: 'present' | 'absent' | null }[]
  >([]);
  const [savingAttendance, setSavingAttendance] = useState(false);

  const syncBatchForm = (b: BatchRecord) => {
    setInstructorIdsDraft(Array.isArray(b.instructorIds) ? [...b.instructorIds] : []);
    setBatchForm({
      name: b.name,
      grade: b.grade || 'O',
      shortDescription: b.shortDescription ?? '',
      description: b.description ?? '',
      thumbnailUrl: b.thumbnailUrl ?? '',
      videoUrl: b.videoUrl ?? '',
      startDate: toDateInputValue(b.startDate),
      endDate: toDateInputValue(b.endDate),
      maxStudents: String(b.maxStudents),
      fee: String(b.fee),
      isActive: b.isActive,
    });
    setBatchFeatures(Array.isArray(b.features) ? [...b.features] : []);
    setScheduleDraft(Array.isArray(b.schedule) ? [...b.schedule] : []);
  };

  const handleCoverUpload = async (file: File | null) => {
    if (!file) return;
    setUploadingCover(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload/batch-cover', {
        method: 'POST',
        body: fd,
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Upload failed');
      const url = data.data?.imageUrl || data.data?.url;
      setBatchForm((f) => ({ ...f, thumbnailUrl: url }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploadingCover(false);
    }
  };

  const loadCore = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [detail, routine, classes] = await Promise.all([
        batchesService.getBatch(batchId),
        batchesService.getRoutine(batchId),
        batchesService.listLiveClasses(batchId),
      ]);

      if (!detail.success || !detail.data) {
        setError(detail.error || 'Failed to load batch');
        return;
      }

      setBatch(detail.data.batch);
      setCanManage(detail.data.canManage);
      syncBatchForm(detail.data.batch);

      if (routine.success && routine.data) {
        setWeekly(routine.data.weekly);
      }

      if (classes.success && classes.data) {
        setLiveClasses(classes.data.liveClasses);
        setSelectedClassId((prev) => {
          if (prev && classes.data!.liveClasses.some((lc) => lc._id === prev)) {
            return prev;
          }
          return classes.data!.liveClasses.find((lc) => lc.isActive)?._id ?? '';
        });
      }
    } catch {
      setError('Failed to load batch');
    } finally {
      setLoading(false);
    }
  }, [batchId]);

  useEffect(() => {
    loadCore();
  }, [loadCore]);

  useEffect(() => {
    if (!canManage) return;
    fetch('/api/teachers?limit=500', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        const rows = Array.isArray(data?.teachers) ? data.teachers : [];
        setInstructorOptions(
          rows.map((t: Record<string, unknown>) => {
            const name =
              String(t.fullName || '').trim() ||
              [t.firstName, t.lastName].filter(Boolean).join(' ').trim() ||
              String(t.email || 'Instructor');
            return { _id: String(t._id), label: name };
          }),
        );
      })
      .catch(() => setInstructorOptions([]));
  }, [canManage]);

  const loadAttendance = useCallback(async (liveClassId: string) => {
    if (!liveClassId) return;
    const res = await batchesService.getAttendance(batchId, liveClassId);
    if (res.success && res.data) {
      setRoster(
        res.data.roster.map((r) => ({
          studentId: r.studentId,
          name: r.name,
          status: r.status,
        })),
      );
    }
  }, [batchId]);

  useEffect(() => {
    if (tab === 'attendance' && selectedClassId && canManage) {
      loadAttendance(selectedClassId);
    }
  }, [tab, selectedClassId, canManage, loadAttendance]);

  const handleSaveBatch = async () => {
    setSavingBatch(true);
    setError(null);
    const res = await batchesService.updateBatch(batchId, {
      name: batchForm.name,
      grade: batchForm.grade,
      instructorIds: instructorIdsDraft,
      shortDescription: batchForm.shortDescription,
      description: batchForm.description,
      thumbnailUrl: batchForm.thumbnailUrl,
      videoUrl: batchForm.videoUrl,
      features: batchFeatures.map((f) => f.trim()).filter(Boolean),
      startDate: batchForm.startDate,
      endDate: batchForm.endDate,
      maxStudents: Number(batchForm.maxStudents),
      fee: Number(batchForm.fee),
      isActive: batchForm.isActive,
    });
    setSavingBatch(false);
    if (res.success) {
      await loadCore();
    } else {
      setError(res.error || 'Failed to update batch');
    }
  };

  const handleDeactivateBatch = async () => {
    if (!confirm('Deactivate this batch? It will be hidden from public enroll.')) return;
    setSavingBatch(true);
    const res = await batchesService.deleteBatch(batchId);
    setSavingBatch(false);
    if (res.success) {
      router.push(listHref);
    } else {
      setError(res.error || 'Failed to deactivate batch');
    }
  };

  const handleSaveRoutine = async () => {
    setSavingRoutine(true);
    setError(null);
    const cleaned = scheduleDraft
      .filter((s) => s.startTime && s.endTime)
      .map((s) => ({
        dayOfWeek: Number(s.dayOfWeek),
        startTime: s.startTime,
        endTime: s.endTime,
        title: s.title?.trim() || undefined,
        recurrence: s.recurrence,
        monthDay: s.monthDay,
        liveClassId: s.liveClassId,
      }));
    const res = await batchesService.updateBatch(batchId, { schedule: cleaned });
    setSavingRoutine(false);
    if (res.success) {
      await loadCore();
    } else {
      setError(res.error || 'Failed to save routine');
    }
  };

  const handleCreateClass = async () => {
    setSavingClass(true);
    setError(null);
    const res = await batchesService.createLiveClass(batchId, {
      title: lcForm.title,
      scheduledAt: lcForm.scheduledAt,
      durationMinutes: Number(lcForm.durationMinutes),
      meetLink: lcForm.meetLink || undefined,
      recordingUrl: lcForm.recordingUrl || undefined,
      type: lcForm.type,
      recurrence: lcForm.recurrence,
    });
    setSavingClass(false);
    if (res.success) {
      setLcForm(emptyLiveClassForm());
      await loadCore();
    } else {
      setError(res.error || 'Failed to create class');
    }
  };

  const startEditClass = (lc: LiveClassRecord) => {
    setEditingClassId(lc._id);
    setEditLcForm(liveClassToForm(lc));
  };

  const handleUpdateClass = async () => {
    if (!editingClassId) return;
    setSavingClass(true);
    setError(null);
    const res = await batchesService.updateLiveClass(batchId, editingClassId, {
      title: editLcForm.title,
      scheduledAt: editLcForm.scheduledAt,
      durationMinutes: Number(editLcForm.durationMinutes),
      meetLink: editLcForm.meetLink || undefined,
      recordingUrl: editLcForm.recordingUrl || undefined,
      type: editLcForm.type,
      recurrence: editLcForm.recurrence,
    });
    setSavingClass(false);
    if (res.success) {
      setEditingClassId(null);
      await loadCore();
    } else {
      setError(res.error || 'Failed to update class');
    }
  };

  const handleDeleteClass = async (liveClassId: string, title: string) => {
    if (!confirm(`Remove "${title}"? This deactivates the class and removes it from the routine.`)) {
      return;
    }
    setError(null);
    const res = await batchesService.deleteLiveClass(batchId, liveClassId);
    if (res.success) {
      if (editingClassId === liveClassId) setEditingClassId(null);
      await loadCore();
    } else {
      setError(res.error || 'Failed to remove class');
    }
  };

  const handleJoin = (lc: LiveClassRecord) => {
    const url = lc.joinUrl || (lc.type === 'recorded' ? lc.recordingUrl : lc.meetLink);
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  const setStudentStatus = (studentId: string, status: 'present' | 'absent') => {
    setRoster((prev) =>
      prev.map((r) => (r.studentId === studentId ? { ...r, status } : r)),
    );
  };

  const handleSaveAttendance = async () => {
    if (!selectedClassId) return;
    setSavingAttendance(true);
    const marks = roster
      .filter((r) => r.status === 'present' || r.status === 'absent')
      .map((r) => ({
        studentId: r.studentId,
        status: r.status as 'present' | 'absent',
      }));
    const res = await batchesService.saveAttendance(batchId, selectedClassId, marks);
    setSavingAttendance(false);
    if (!res.success) {
      setError(res.error || 'Failed to save attendance');
    }
  };

  const updateScheduleSlot = (index: number, patch: Partial<BatchScheduleSlot>) => {
    setScheduleDraft((prev) =>
      prev.map((s, i) => (i === index ? { ...s, ...patch } : s)),
    );
  };

  const removeScheduleSlot = (index: number) => {
    setScheduleDraft((prev) => prev.filter((_, i) => i !== index));
  };

  if (loading) {
    return <p className="p-6 text-muted-foreground">Loading batch…</p>;
  }

  if (error && !batch) {
    return (
      <div className="p-6">
        <p className="text-destructive">{error}</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href={listHref}>Back</Link>
        </Button>
      </div>
    );
  }

  const tabs: { id: TabId; label: string }[] = [
    { id: 'routine', label: 'Class routine' },
    { id: 'batchClasses', label: 'Classes' },
    { id: 'sessions', label: 'Live sessions' },
    { id: 'calendar', label: 'Calendar' },
    ...(canManage ? [{ id: 'attendance' as TabId, label: 'Attendance' }] : []),
    ...(canManage ? [{ id: 'settings' as TabId, label: 'Settings' }] : []),
  ];

  const activeClasses = liveClasses.filter((lc) => lc.isActive);
  const inactiveClasses = liveClasses.filter((lc) => !lc.isActive);

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link href={listHref}>
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">
              {titlePrefix}: {batch?.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              Grade {batch?.grade} · {batch?.isActive ? 'Active' : 'Inactive'}
            </p>
          </div>
        </div>
        {canManage && (
          <Button variant="outline" size="sm" onClick={() => setTab('settings')}>
            <Pencil className="mr-1 h-4 w-4" />
            Edit batch
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 border-b pb-2">
        {tabs.map((t) => (
          <Button
            key={t.id}
            variant={tab === t.id ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </Button>
        ))}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {tab === 'settings' && canManage && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Batch settings</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <BatchMarketingFormFields
              form={batchForm}
              setForm={(updater) =>
                setBatchForm((prev) => {
                  const next =
                    typeof updater === 'function' ? updater(prev) : updater;
                  return { ...prev, ...next };
                })
              }
              features={batchFeatures}
              onFeaturesChange={setBatchFeatures}
              onCoverUpload={handleCoverUpload}
              uploadingCover={uploadingCover}
              showScheduleFields
            />
            {canManage && instructorOptions.length > 0 && (
              <div className="sm:col-span-2">
                <Label>Batch instructors (optional)</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {instructorOptions.map((ins) => (
                    <label
                      key={ins._id}
                      className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={instructorIdsDraft.includes(ins._id)}
                        onChange={() =>
                          setInstructorIdsDraft((prev) =>
                            prev.includes(ins._id)
                              ? prev.filter((x) => x !== ins._id)
                              : [...prev, ins._id],
                          )
                        }
                      />
                      {ins.label}
                    </label>
                  ))}
                </div>
              </div>
            )}
            {batch?.isActive && (
              <div className="sm:col-span-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/enroll/${batchId}`} target="_blank" rel="noopener noreferrer">
                    View public page
                  </Link>
                </Button>
              </div>
            )}
            <div className="flex items-center gap-2 sm:col-span-2">
              <input
                id="batch-active"
                type="checkbox"
                checked={batchForm.isActive}
                onChange={(e) =>
                  setBatchForm((f) => ({ ...f, isActive: e.target.checked }))
                }
              />
              <Label htmlFor="batch-active">Active (visible on public enroll)</Label>
            </div>
            <div className="flex flex-wrap gap-2 sm:col-span-2">
              <Button disabled={savingBatch} onClick={handleSaveBatch}>
                {savingBatch ? 'Saving…' : 'Save batch'}
              </Button>
              <Button
                variant="destructive"
                disabled={savingBatch}
                onClick={handleDeactivateBatch}
              >
                <Trash2 className="mr-1 h-4 w-4" />
                Deactivate batch
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {tab === 'routine' && batch && (
        <BatchRoutineWorkspace
          batchId={batchId}
          batchStartDate={batch.startDate}
          batchEndDate={batch.endDate}
          canManage={canManage}
        />
      )}

      {tab === 'batchClasses' && (
        <BatchClassesPanel batchId={batchId} canManage={canManage} />
      )}

      {tab === 'sessions' && (
        <div className="space-y-6">
          {canManage && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Schedule a class</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                <LiveClassFormFields form={lcForm} setForm={setLcForm} idPrefix="new" />
                <div className="sm:col-span-2">
                  <Button disabled={savingClass} onClick={handleCreateClass}>
                    {savingClass ? 'Saving…' : 'Add live class'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {canManage && editingClassId && (
            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="text-base">Edit live class</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                <LiveClassFormFields form={editLcForm} setForm={setEditLcForm} idPrefix="edit" />
                <div className="flex flex-wrap gap-2 sm:col-span-2">
                  <Button disabled={savingClass} onClick={handleUpdateClass}>
                    {savingClass ? 'Saving…' : 'Save changes'}
                  </Button>
                  <Button variant="ghost" onClick={() => setEditingClassId(null)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-3">
            {activeClasses.length === 0 && inactiveClasses.length === 0 ? (
              <p className="text-muted-foreground">No live classes scheduled yet.</p>
            ) : (
              <>
                {activeClasses.map((lc) => (
                  <Card key={lc._id}>
                    <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
                      <div>
                        <p className="font-medium">{lc.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(lc.scheduledAt).toLocaleString()} · {lc.durationMinutes}{' '}
                          min · {lc.type}
                          {lc.recurrence && lc.recurrence !== 'once'
                            ? ` · ${lc.recurrence}`
                            : ''}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(lc.joinUrl || lc.meetLink || lc.recordingUrl) && (
                          <Button size="sm" onClick={() => handleJoin(lc)}>
                            <ExternalLink className="mr-1 h-4 w-4" />
                            {lc.type === 'recorded' ? 'Watch' : 'Join'}
                          </Button>
                        )}
                        {canManage && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => startEditClass(lc)}
                            >
                              <Pencil className="mr-1 h-4 w-4" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive"
                              onClick={() => handleDeleteClass(lc._id, lc.title)}
                            >
                              <Trash2 className="mr-1 h-4 w-4" />
                              Remove
                            </Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {inactiveClasses.length > 0 && (
                  <p className="text-sm text-muted-foreground">Removed classes</p>
                )}
                {inactiveClasses.map((lc) => (
                  <Card key={lc._id} className="opacity-60">
                    <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
                      <div>
                        <p className="font-medium">{lc.title} (removed)</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(lc.scheduledAt).toLocaleString()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </div>
        </div>
      )}

      {tab === 'calendar' && <BatchCalendar batchId={batchId} />}

      {tab === 'attendance' && canManage && (
        <div className="space-y-4">
          <div>
            <Label>Live class</Label>
            <select
              className="mt-1 flex h-9 w-full max-w-md rounded-md border px-3 text-sm"
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
            >
              {activeClasses.map((lc) => (
                <option key={lc._id} value={lc._id}>
                  {lc.title} — {new Date(lc.scheduledAt).toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          {roster.length === 0 ? (
            <p className="text-muted-foreground">No enrolled students for this batch.</p>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50 text-left">
                    <th className="p-3">Student</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {roster.map((row) => (
                    <tr key={row.studentId} className="border-b">
                      <td className="p-3">{row.name}</td>
                      <td className="space-x-2 p-3">
                        <Button
                          size="sm"
                          variant={row.status === 'present' ? 'default' : 'outline'}
                          onClick={() => setStudentStatus(row.studentId, 'present')}
                        >
                          Present
                        </Button>
                        <Button
                          size="sm"
                          variant={row.status === 'absent' ? 'default' : 'outline'}
                          onClick={() => setStudentStatus(row.studentId, 'absent')}
                        >
                          Absent
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <Button disabled={savingAttendance} onClick={handleSaveAttendance}>
            {savingAttendance ? 'Saving…' : 'Save attendance'}
          </Button>
        </div>
      )}
    </div>
  );
}
