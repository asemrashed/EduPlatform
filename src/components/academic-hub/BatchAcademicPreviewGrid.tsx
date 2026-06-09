'use client';

import type { UpcomingClassItem } from '@/components/academic-hub/UpcomingClassesSection';
import { UpcomingClassesSection } from '@/components/academic-hub/UpcomingClassesSection';
import {
  ScheduleUpdatesSection,
  useScheduleUnreadCount,
} from '@/components/academic-hub/ScheduleUpdatesSection';
import { NoticeBoardSection } from '@/components/academic-hub/NoticeBoardSection';
import { AcademicListCard } from '@/components/academic-hub/AcademicListCard';

export function BatchAcademicPreviewGrid({
  noticeBoardHref,
  upcomingClasses = [],
  batchesHref = '/student/batches',
}: {
  noticeBoardHref: string;
  upcomingClasses?: UpcomingClassItem[];
  batchesHref?: string;
}) {
  const unreadSchedule = useScheduleUnreadCount();
  const previewClasses = upcomingClasses.slice(0, 3);

  return (
    <div className="mt-6 grid gap-4 md:grid-cols-3">
      <AcademicListCard
        title="Upcoming classes"
        footerHref={noticeBoardHref}
        className="h-full"
      >
        <UpcomingClassesSection
          classes={previewClasses}
          maxItems={3}
          compact
          batchesHref={batchesHref}
        />
      </AcademicListCard>

      <AcademicListCard
        title="Schedule updates"
        badge={unreadSchedule}
        footerHref={noticeBoardHref}
        className="h-full"
      >
        <ScheduleUpdatesSection
          maxItems={3}
          compact
          showActions={false}
          batchesHref={batchesHref}
        />
      </AcademicListCard>

      <AcademicListCard title="Notice board" footerHref={noticeBoardHref} className="h-full">
        <NoticeBoardSection maxItems={3} compact />
      </AcademicListCard>
    </div>
  );
}

export function StaffAcademicPreviewGrid({
  noticeBoardHref,
  upcomingClasses,
  batchesHref,
}: {
  noticeBoardHref: string;
  upcomingClasses: Array<{
    _id: string;
    batchId: string;
    batchName: string;
    title: string;
    scheduledAt: string;
    type: 'live' | 'recorded';
  }>;
  batchesHref: string;
}) {
  const mapped: UpcomingClassItem[] = upcomingClasses.map((c) => ({
    ...c,
    durationMinutes: 0,
  }));

  return (
    <BatchAcademicPreviewGrid
      noticeBoardHref={noticeBoardHref}
      upcomingClasses={mapped}
      batchesHref={batchesHref}
    />
  );
}
