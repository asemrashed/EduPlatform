'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/cn';
import { WEEKDAY_LABELS } from '@/components/batches/batchFormUtils';
import {
  batchesService,
  type BatchClassRecord,
  type GeneratedSessionPreview,
  type RoutineSlotRecord,
} from '@/services/batchesService';

const DAY_SHORT = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

type InstructorOption = { _id: string; label: string };

const emptySlotForm = {
  dayOfWeek: '1',
  startTime: '10:00',
  endTime: '11:30',
  topic: '',
  instructorId: '',
  batchClassId: '',
};

export function BatchRoutineWorkspace({
  batchId,
  batchStartDate,
  batchEndDate,
  canManage,
}: {
  batchId: string;
  batchStartDate: string;
  batchEndDate: string;
  canManage: boolean;
}) {
  const [slots, setSlots] = useState<RoutineSlotRecord[]>([]);
  const [batchClasses, setBatchClasses] = useState<BatchClassRecord[]>([]);
  const [instructors, setInstructors] = useState<InstructorOption[]>([]);
  const [slotForm, setSlotForm] = useState(emptySlotForm);
  const [dayFilter, setDayFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [genStart, setGenStart] = useState(batchStartDate.slice(0, 10));
  const [genEnd, setGenEnd] = useState(batchEndDate.slice(0, 10));
  const [previews, setPreviews] = useState<GeneratedSessionPreview[]>([]);
  const [previewSummary, setPreviewSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [slotRes, classRes] = await Promise.all([
      batchesService.listRoutineSlots(batchId),
      batchesService.listBatchClasses(batchId),
    ]);
    if (slotRes.success && slotRes.data) {
      setSlots(slotRes.data.slots);
    } else {
      setError(slotRes.error || 'Failed to load routine');
    }
    if (classRes.success && classRes.data) {
      setBatchClasses(classRes.data.classes.filter((c) => c.isActive));
    }
    setLoading(false);
  }, [batchId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!canManage) return;
    fetch('/api/teachers?limit=500', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        const rows = Array.isArray(data?.teachers) ? data.teachers : [];
        setInstructors(
          rows.map((t: Record<string, unknown>) => {
            const name =
              String(t.fullName || '').trim() ||
              [t.firstName, t.lastName].filter(Boolean).join(' ').trim() ||
              String(t.email || 'Instructor');
            return { _id: String(t._id), label: name };
          }),
        );
      })
      .catch(() => setInstructors([]));
  }, [canManage]);

  const filteredSlots = useMemo(() => {
    return slots.filter((s) => {
      if (dayFilter !== 'all' && String(s.dayOfWeek) !== dayFilter) return false;
      if (statusFilter !== 'all' && s.status !== statusFilter) return false;
      return true;
    });
  }, [slots, dayFilter, statusFilter]);

  const handleAddSlot = async () => {
    if (!slotForm.topic.trim() || !slotForm.instructorId) return;
    setSaving(true);
    setError(null);
    const res = await batchesService.createRoutineSlot(batchId, {
      dayOfWeek: Number(slotForm.dayOfWeek),
      startTime: slotForm.startTime,
      endTime: slotForm.endTime,
      topic: slotForm.topic.trim(),
      instructorId: slotForm.instructorId,
      batchClassId: slotForm.batchClassId || undefined,
    });
    setSaving(false);
    if (res.success) {
      setSlotForm((f) => ({ ...f, topic: '' }));
      load();
    } else {
      setError(res.error || 'Failed to add slot');
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    if (!confirm('Delete this weekly slot?')) return;
    const res = await batchesService.deleteRoutineSlot(batchId, slotId);
    if (res.success) load();
    else setError(res.error || 'Failed to delete slot');
  };

  const handleToggleStatus = async (slot: RoutineSlotRecord) => {
    const res = await batchesService.updateRoutineSlot(batchId, slot._id, {
      status: slot.status === 'active' ? 'inactive' : 'active',
    });
    if (res.success) load();
  };

  const handleGeneratePreview = async () => {
    setSaving(true);
    setError(null);
    const res = await batchesService.generateRoutinePreview(batchId, {
      startDate: genStart,
      endDate: genEnd,
    });
    setSaving(false);
    if (res.success && res.data) {
      setPreviews(res.data.previews);
      const s = res.data.summary;
      setPreviewSummary(
        `${s.sessionCount} classes across ${s.dayCount} days from ${s.startDate} to ${s.endDate}`,
      );
    } else {
      setError(res.error || 'Failed to generate preview');
      setPreviews([]);
      setPreviewSummary(null);
    }
  };

  const handlePublish = async () => {
    if (!confirm(`Publish ${previews.length || 'scheduled'} sessions to the calendar?`)) return;
    setSaving(true);
    const res = await batchesService.publishRoutineSessions(batchId, {
      startDate: genStart,
      endDate: genEnd,
    });
    setSaving(false);
    if (res.success && res.data) {
      alert(`Published ${res.data.publishedCount} session(s).`);
      setPreviews([]);
      setPreviewSummary(null);
    } else {
      setError(res.error || 'Failed to publish');
    }
  };

  const setMonthRange = (offset: number) => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth() + offset;
    const start = new Date(y, m, 1);
    const end = new Date(y, m + 1, 0);
    setGenStart(start.toISOString().slice(0, 10));
    setGenEnd(end.toISOString().slice(0, 10));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base">Weekly routine</CardTitle>
            <p className="text-sm text-muted-foreground">
              Recurring weekly slots — generate dated sessions for the calendar.
            </p>
          </div>
          {canManage && (
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              {slots.length} slot{slots.length === 1 ? '' : 's'}
            </span>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex flex-wrap gap-2">
            <select
              className="h-9 rounded-md border bg-background px-3 text-sm"
              value={dayFilter}
              onChange={(e) => setDayFilter(e.target.value)}
            >
              <option value="all">All days</option>
              {WEEKDAY_LABELS.map((label, i) => (
                <option key={label} value={String(i)}>
                  {label}
                </option>
              ))}
            </select>
            <select
              className="h-9 rounded-md border bg-background px-3 text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {loading ? (
            <p className="text-sm text-muted-foreground">Loading routine…</p>
          ) : filteredSlots.length === 0 ? (
            <p className="text-sm text-muted-foreground">No weekly slots yet.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="border-b bg-muted/50 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2">Day</th>
                    <th className="px-3 py-2">Time</th>
                    <th className="px-3 py-2">Topic</th>
                    <th className="px-3 py-2">Teacher</th>
                    <th className="px-3 py-2">Status</th>
                    {canManage && <th className="px-3 py-2">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredSlots.map((slot) => (
                    <tr key={slot._id} className="border-b last:border-0">
                      <td className="px-3 py-2">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                          {DAY_SHORT[slot.dayOfWeek]}
                        </span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        {slot.startTime}–{slot.endTime}
                      </td>
                      <td className="px-3 py-2">
                        {slot.topic}
                        {slot.batchClassTitle && (
                          <span className="ml-1 text-xs text-muted-foreground">
                            ({slot.batchClassTitle})
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2">{slot.instructorName || '—'}</td>
                      <td className="px-3 py-2">
                        <span
                          className={cn(
                            'rounded-full px-2 py-0.5 text-xs font-medium',
                            slot.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-muted text-muted-foreground',
                          )}
                        >
                          {slot.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      {canManage && (
                        <td className="px-3 py-2">
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleStatus(slot)}
                            >
                              {slot.status === 'active' ? 'Deactivate' : 'Activate'}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive"
                              onClick={() => handleDeleteSlot(slot._id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {canManage && (
            <div className="grid gap-3 rounded-lg border border-dashed p-4 sm:grid-cols-2">
              <div>
                <Label>Day</Label>
                <select
                  className="mt-1 flex h-9 w-full rounded-md border bg-background px-3 text-sm"
                  value={slotForm.dayOfWeek}
                  onChange={(e) => setSlotForm((f) => ({ ...f, dayOfWeek: e.target.value }))}
                >
                  {WEEKDAY_LABELS.map((label, i) => (
                    <option key={label} value={String(i)}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Linked class (optional)</Label>
                <select
                  className="mt-1 flex h-9 w-full rounded-md border bg-background px-3 text-sm"
                  value={slotForm.batchClassId}
                  onChange={(e) => {
                    const bc = batchClasses.find((c) => c._id === e.target.value);
                    setSlotForm((f) => ({
                      ...f,
                      batchClassId: e.target.value,
                      topic: bc ? bc.title : f.topic,
                      instructorId: bc?.instructorId || f.instructorId,
                    }));
                  }}
                >
                  <option value="">None</option>
                  {batchClasses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Start time</Label>
                <Input
                  type="time"
                  value={slotForm.startTime}
                  onChange={(e) => setSlotForm((f) => ({ ...f, startTime: e.target.value }))}
                />
              </div>
              <div>
                <Label>End time</Label>
                <Input
                  type="time"
                  value={slotForm.endTime}
                  onChange={(e) => setSlotForm((f) => ({ ...f, endTime: e.target.value }))}
                />
              </div>
              <div className="sm:col-span-2">
                <Label>Topic</Label>
                <Input
                  value={slotForm.topic}
                  onChange={(e) => setSlotForm((f) => ({ ...f, topic: e.target.value }))}
                />
              </div>
              <div className="sm:col-span-2">
                <Label>Teacher</Label>
                <select
                  className="mt-1 flex h-9 w-full rounded-md border bg-background px-3 text-sm"
                  value={slotForm.instructorId}
                  onChange={(e) => setSlotForm((f) => ({ ...f, instructorId: e.target.value }))}
                >
                  <option value="">Select instructor</option>
                  {instructors.map((ins) => (
                    <option key={ins._id} value={ins._id}>
                      {ins.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <Button
                  disabled={saving || !slotForm.topic || !slotForm.instructorId}
                  onClick={handleAddSlot}
                >
                  + Add slot
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {canManage && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Generate & publish sessions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <div>
                <Label>Start date</Label>
                <Input
                  type="date"
                  value={genStart}
                  onChange={(e) => setGenStart(e.target.value)}
                />
              </div>
              <div>
                <Label>End date</Label>
                <Input
                  type="date"
                  value={genEnd}
                  onChange={(e) => setGenEnd(e.target.value)}
                />
              </div>
              <div className="flex items-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setMonthRange(0)}>
                  This month
                </Button>
                <Button variant="outline" size="sm" onClick={() => setMonthRange(1)}>
                  Next month
                </Button>
              </div>
            </div>

            {previewSummary && (
              <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
                {previewSummary}
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              <Button disabled={saving} onClick={handleGeneratePreview}>
                Generate preview
              </Button>
              {previews.length > 0 && (
                <Button variant="default" disabled={saving} onClick={handlePublish}>
                  Publish sessions
                </Button>
              )}
            </div>

            {previews.length > 0 && (
              <div className="max-h-80 overflow-auto rounded-lg border">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 border-b bg-muted/80 text-xs uppercase">
                    <tr>
                      <th className="px-3 py-2">Date</th>
                      <th className="px-3 py-2">Day</th>
                      <th className="px-3 py-2">Time</th>
                      <th className="px-3 py-2">Topic</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previews.map((p) => (
                      <tr key={p.key} className="border-b">
                        <td className="px-3 py-1.5">{p.date}</td>
                        <td className="px-3 py-1.5">{p.dayLabel}</td>
                        <td className="px-3 py-1.5">
                          {p.startTime}–{p.endTime}
                        </td>
                        <td className="px-3 py-1.5">{p.topic}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
