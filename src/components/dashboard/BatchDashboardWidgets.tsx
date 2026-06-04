'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PageSection from '@/components/dashboard/lp/PageSection';
import type { StaffBatchDashboardSummary } from '@/types/dashboard';
import type {
  StudentDashboardRoutineDay,
  StudentDashboardUpcomingClass,
} from '@/types/studentDashboard';
import {
  LuCalendar,
  LuClipboardList,
  LuExternalLink,
  LuVideo,
} from 'react-icons/lu';

function formatDateTime(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function StudentBatchDashboardSection({
  upcomingClasses,
  weeklyRoutine,
  batchesHref = '/student/batches',
}: {
  upcomingClasses: StudentDashboardUpcomingClass[];
  weeklyRoutine: StudentDashboardRoutineDay[];
  batchesHref?: string;
}) {
  const router = useRouter();
  const today = new Date().getDay();
  const todaySlots = weeklyRoutine.flatMap((batch) =>
    (batch.days.find((d) => d.dayOfWeek === today)?.slots ?? []).map((slot) => ({
      batchId: batch.batchId,
      batchName: batch.batchName,
      ...slot,
    })),
  );

  if (upcomingClasses.length === 0 && todaySlots.length === 0 && weeklyRoutine.length === 0) {
    return (
      <PageSection
        title="My batches"
        description="Live classes and weekly routine from your enrolled batches"
        className="mt-2"
      >
        <p className="text-sm text-muted-foreground">
          No batch enrollments yet.{' '}
          <Link href="/enroll" className="font-medium text-primary underline-offset-4 hover:underline">
            Browse open batches
          </Link>
        </p>
      </PageSection>
    );
  }

  return (
    <PageSection
      title="My batches"
      description="Upcoming live classes and weekly routine"
      className="mt-2"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <LuVideo className="h-4 w-4" />
            Upcoming classes
          </h3>
          {upcomingClasses.length === 0 ? (
            <p className="text-sm text-muted-foreground">No upcoming classes scheduled.</p>
          ) : (
            <ul className="space-y-2">
              {upcomingClasses.map((cls) => (
                <li
                  key={cls._id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm"
                >
                  <div>
                    <p className="font-medium">{cls.title}</p>
                    <p className="text-muted-foreground">
                      {cls.batchName} · {formatDateTime(cls.scheduledAt)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {cls.joinUrl ? (
                      <Button size="sm" variant="outline" asChild>
                        <a href={cls.joinUrl} target="_blank" rel="noopener noreferrer">
                          {cls.type === 'recorded' ? 'Watch' : 'Join'}
                          <LuExternalLink className="ml-1 h-3 w-3" />
                        </a>
                      </Button>
                    ) : null}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => router.push(`${batchesHref}/${cls.batchId}`)}
                    >
                      Batch
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <LuCalendar className="h-4 w-4" />
            Weekly routine
          </h3>
          {todaySlots.length > 0 ? (
            <div className="mb-3 rounded-lg bg-muted/50 px-3 py-2 text-sm">
              <p className="font-medium">Today</p>
              <ul className="mt-1 space-y-1 text-muted-foreground">
                {todaySlots.map((slot, i) => (
                  <li key={`${slot.batchId}-${i}`}>
                    {slot.startTime}–{slot.endTime}
                    {slot.title ? ` · ${slot.title}` : ''} ({slot.batchName})
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {weeklyRoutine.length === 0 ? (
            <p className="text-sm text-muted-foreground">No routine slots configured.</p>
          ) : (
            <ul className="max-h-64 space-y-3 overflow-y-auto text-sm">
              {weeklyRoutine.map((batch) => {
                const daysWithSlots = batch.days.filter((d) => d.slots.length > 0);
                if (daysWithSlots.length === 0) return null;
                return (
                  <li key={batch.batchId}>
                    <button
                      type="button"
                      className="font-medium text-primary hover:underline"
                      onClick={() => router.push(`${batchesHref}/${batch.batchId}`)}
                    >
                      {batch.batchName}
                    </button>
                    <ul className="ml-3 mt-1 list-disc text-muted-foreground">
                      {daysWithSlots.map((day) => (
                        <li key={day.dayOfWeek}>
                          {day.label}:{' '}
                          {day.slots
                            .map(
                              (s) =>
                                `${s.startTime}–${s.endTime}${s.title ? ` (${s.title})` : ''}`,
                            )
                            .join(', ')}
                        </li>
                      ))}
                    </ul>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
      <Button asChild variant="outline" size="sm" className="mt-4">
        <Link href={batchesHref}>View all my batches</Link>
      </Button>
    </PageSection>
  );
}

export function StaffBatchDashboardSection({
  summary,
  batchesBasePath,
  roleLabel,
}: {
  summary: StaffBatchDashboardSummary;
  batchesBasePath: '/instructor/batches' | '/admin/batches';
  roleLabel: 'instructor' | 'admin';
}) {
  const attendanceHint =
    roleLabel === 'instructor'
      ? 'Open a batch → Live classes → Attendance tab to mark present/absent.'
      : 'Open any batch → Attendance tab on a live class.';

  return (
    <PageSection
      title="Batch management"
      description="Live classes, routine, and attendance"
      className="mt-2"
    >
      <div className="mb-4 flex flex-wrap gap-2">
        <Button asChild>
          <Link href={batchesBasePath}>
            <LuCalendar className="mr-2 h-4 w-4" />
            Manage batches ({summary.totalBatches})
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/enroll">Public enroll page</Link>
        </Button>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">
        <LuClipboardList className="mr-1 inline h-4 w-4" />
        {attendanceHint}
      </p>

      {summary.upcomingClasses.length > 0 ? (
        <div className="mb-4">
          <h3 className="mb-2 text-sm font-semibold">Upcoming live classes</h3>
          <ul className="space-y-2">
            {summary.upcomingClasses.map((cls) => (
              <li
                key={cls._id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-medium">{cls.title}</p>
                  <p className="text-muted-foreground">
                    {cls.batchName} · {formatDateTime(cls.scheduledAt)}
                  </p>
                </div>
                <Button asChild size="sm" variant="outline">
                  <Link href={`${batchesBasePath}/${cls.batchId}`}>Open batch</Link>
                </Button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mb-4 text-sm text-muted-foreground">No upcoming live classes.</p>
      )}

      {summary.batches.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {summary.batches.slice(0, 6).map((b) => (
            <Link
              key={b._id}
              href={`${batchesBasePath}/${b._id}`}
              className="rounded-lg border p-3 transition-colors hover:bg-muted/40"
            >
              <p className="font-medium">{b.name}</p>
              <p className="text-xs text-muted-foreground">{b.subject}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant="secondary">{b.enrolledCount} students</Badge>
                {b.nextClassAt ? (
                  <Badge variant="outline">Next: {formatDateTime(b.nextClassAt)}</Badge>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No active batches yet.</p>
      )}
    </PageSection>
  );
}
