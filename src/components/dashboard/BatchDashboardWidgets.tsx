'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import PageSection from '@/components/dashboard/lp/PageSection';
import {
  DashboardBatchCard,
  type DashboardBatchCardData,
} from '@/components/batches/DashboardBatchCard';
import type { StaffBatchDashboardSummary } from '@/types/dashboard';
import type {
  StudentDashboardBatchSummary,
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

function BatchCardGrid({
  batches,
  manageBasePath,
}: {
  batches: DashboardBatchCardData[];
  manageBasePath: string;
}) {
  if (batches.length === 0) return null;
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {batches.map((b) => (
        <DashboardBatchCard
          key={b._id}
          batch={b}
          manageHref={`${manageBasePath}/${b._id}`}
        />
      ))}
    </div>
  );
}

export function StudentBatchDashboardSection({
  batches,
  upcomingClasses,
  weeklyRoutine,
  batchesHref = '/student/batches',
}: {
  batches: StudentDashboardBatchSummary[];
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

  const cardBatches: DashboardBatchCardData[] = batches.map((b) => ({
    _id: b._id,
    name: b.name,
    grade: b.grade,
    shortDescription: b.shortDescription,
    thumbnailUrl: b.thumbnailUrl,
    fee: b.fee,
    enrolledCount: b.enrolledCount,
    maxStudents: b.maxStudents,
  }));

  if (
    batches.length === 0 &&
    upcomingClasses.length === 0 &&
    todaySlots.length === 0 &&
    weeklyRoutine.length === 0
  ) {
    return (
      <PageSection
        title="My batches"
        description="Live classes and weekly routine from your enrolled batches"
        className="mt-2"
      >
        <p className="text-sm text-muted-foreground">
          No batch enrollments yet.{' '}
          <Link
            href="/enroll"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Browse open batches
          </Link>
        </p>
      </PageSection>
    );
  }

  return (
    <PageSection
      title="My batches"
      description="Your enrolled batches, upcoming classes, and weekly routine"
      className="mt-2"
    >
      {cardBatches.length > 0 && (
        <div className="mb-6">
          <BatchCardGrid batches={cardBatches} manageBasePath={batchesHref} />
        </div>
      )}

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
            <div className="mb-3 rounded-lg border px-3 py-2 text-sm">
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

  const cardBatches: DashboardBatchCardData[] = summary.batches.slice(0, 6).map((b) => ({
    _id: b._id,
    name: b.name,
    grade: b.grade,
    shortDescription: b.shortDescription,
    thumbnailUrl: b.thumbnailUrl,
    fee: b.fee,
    enrolledCount: b.enrolledCount,
    maxStudents: b.maxStudents,
  }));

  return (
    <PageSection
      title="Batch management"
      description="Live classes, routine, and attendance"
      className="mt-2"
    >
      <div className="mb-4 flex flex-wrap gap-2">
        <Button asChild variant="outline">
          <Link href={batchesBasePath}>
            <LuCalendar className="mr-2 h-4 w-4" />
            All batches ({summary.totalBatches})
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
        <div className="mb-6">
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
                  <Link href={`${batchesBasePath}/${cls.batchId}`}>Manage</Link>
                </Button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mb-6 text-sm text-muted-foreground">No upcoming live classes.</p>
      )}

      {cardBatches.length > 0 ? (
        <BatchCardGrid batches={cardBatches} manageBasePath={batchesBasePath} />
      ) : (
        <p className="text-sm text-muted-foreground">No active batches yet.</p>
      )}
    </PageSection>
  );
}
