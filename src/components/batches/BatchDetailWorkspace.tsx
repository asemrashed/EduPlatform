'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  batchesService,
  type BatchRecord,
  type LiveClassRecord,
} from '@/services/batchesService';
import { LuArrowLeft as ArrowLeft, LuExternalLink as ExternalLink, LuCalendar as Calendar } from 'react-icons/lu';

type TabId = 'routine' | 'classes' | 'attendance';

type WeeklyDay = {
  dayOfWeek: number;
  label: string;
  slots: { dayOfWeek: number; startTime: string; endTime: string; title?: string }[];
};

export function BatchDetailWorkspace({
  batchId,
  listHref,
  titlePrefix = 'Batch',
}: {
  batchId: string;
  listHref: string;
  titlePrefix?: string;
}) {
  const [tab, setTab] = useState<TabId>('routine');
  const [batch, setBatch] = useState<BatchRecord | null>(null);
  const [canManage, setCanManage] = useState(false);
  const [weekly, setWeekly] = useState<WeeklyDay[]>([]);
  const [liveClasses, setLiveClasses] = useState<LiveClassRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [lcForm, setLcForm] = useState({
    title: '',
    scheduledAt: '',
    durationMinutes: '60',
    meetLink: '',
    recordingUrl: '',
    type: 'live' as 'live' | 'recorded',
  });
  const [savingClass, setSavingClass] = useState(false);

  const [selectedClassId, setSelectedClassId] = useState('');
  const [roster, setRoster] = useState<
    { studentId: string; name: string; status: 'present' | 'absent' | null }[]
  >([]);
  const [savingAttendance, setSavingAttendance] = useState(false);

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

      if (routine.success && routine.data) {
        setWeekly(routine.data.weekly);
      }

      if (classes.success && classes.data) {
        setLiveClasses(classes.data.liveClasses);
        setSelectedClassId((prev) => {
          if (prev && classes.data!.liveClasses.some((lc) => lc._id === prev)) {
            return prev;
          }
          return classes.data!.liveClasses[0]?._id ?? '';
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

  const handleCreateClass = async () => {
    setSavingClass(true);
    const res = await batchesService.createLiveClass(batchId, {
      title: lcForm.title,
      scheduledAt: lcForm.scheduledAt,
      durationMinutes: Number(lcForm.durationMinutes),
      meetLink: lcForm.meetLink || undefined,
      recordingUrl: lcForm.recordingUrl || undefined,
      type: lcForm.type,
    });
    setSavingClass(false);
    if (res.success) {
      setLcForm({
        title: '',
        scheduledAt: '',
        durationMinutes: '60',
        meetLink: '',
        recordingUrl: '',
        type: 'live',
      });
      await loadCore();
    } else {
      setError(res.error || 'Failed to create class');
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
    { id: 'routine', label: 'Routine' },
    { id: 'classes', label: 'Live classes' },
    ...(canManage ? [{ id: 'attendance' as TabId, label: 'Attendance' }] : []),
  ];

  return (
    <div className="space-y-6 p-4 md:p-6">
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
            {batch?.subject} · {batch?.isActive ? 'Active' : 'Inactive'}
          </p>
        </div>
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

      {tab === 'routine' && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {weekly.map((day) => (
            <Card key={day.dayOfWeek}>
              <CardHeader className="py-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calendar className="h-4 w-4" />
                  {day.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pb-4 text-sm">
                {day.slots.length === 0 ? (
                  <p className="text-muted-foreground">No sessions</p>
                ) : (
                  day.slots.map((slot, i) => (
                    <div
                      key={`${day.dayOfWeek}-${slot.startTime}-${i}`}
                      className="rounded-md border px-2 py-1.5"
                    >
                      <p className="font-medium">
                        {slot.startTime} – {slot.endTime}
                      </p>
                      {slot.title && (
                        <p className="text-muted-foreground">{slot.title}</p>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {tab === 'classes' && (
        <div className="space-y-6">
          {canManage && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Schedule a class</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={lcForm.title}
                    onChange={(e) => setLcForm((f) => ({ ...f, title: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Scheduled at</Label>
                  <Input
                    type="datetime-local"
                    value={lcForm.scheduledAt}
                    onChange={(e) =>
                      setLcForm((f) => ({ ...f, scheduledAt: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label>Duration (minutes)</Label>
                  <Input
                    type="number"
                    value={lcForm.durationMinutes}
                    onChange={(e) =>
                      setLcForm((f) => ({ ...f, durationMinutes: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label>Type</Label>
                  <select
                    className="flex h-9 w-full rounded-md border px-3 text-sm"
                    value={lcForm.type}
                    onChange={(e) =>
                      setLcForm((f) => ({
                        ...f,
                        type: e.target.value as 'live' | 'recorded',
                      }))
                    }
                  >
                    <option value="live">Live</option>
                    <option value="recorded">Recorded</option>
                  </select>
                </div>
                <div>
                  <Label>Meet link</Label>
                  <Input
                    value={lcForm.meetLink}
                    onChange={(e) => setLcForm((f) => ({ ...f, meetLink: e.target.value }))}
                    placeholder="https://meet.google.com/..."
                  />
                </div>
                <div>
                  <Label>Recording URL</Label>
                  <Input
                    value={lcForm.recordingUrl}
                    onChange={(e) =>
                      setLcForm((f) => ({ ...f, recordingUrl: e.target.value }))
                    }
                  />
                </div>
                <div className="sm:col-span-2">
                  <Button disabled={savingClass} onClick={handleCreateClass}>
                    {savingClass ? 'Saving…' : 'Add live class'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-3">
            {liveClasses.length === 0 ? (
              <p className="text-muted-foreground">No live classes scheduled yet.</p>
            ) : (
              liveClasses.map((lc) => (
                <Card key={lc._id}>
                  <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
                    <div>
                      <p className="font-medium">{lc.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(lc.scheduledAt).toLocaleString()} · {lc.durationMinutes}{' '}
                        min · {lc.type}
                        {!lc.isActive && ' · inactive'}
                      </p>
                    </div>
                    {(lc.joinUrl || lc.meetLink || lc.recordingUrl) && (
                      <Button size="sm" onClick={() => handleJoin(lc)}>
                        <ExternalLink className="mr-1 h-4 w-4" />
                        {lc.type === 'recorded' ? 'Watch' : 'Join'}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {tab === 'attendance' && canManage && (
        <div className="space-y-4">
          <div>
            <Label>Live class</Label>
            <select
              className="mt-1 flex h-9 w-full max-w-md rounded-md border px-3 text-sm"
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
            >
              {liveClasses.map((lc) => (
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
                      <td className="p-3 space-x-2">
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
