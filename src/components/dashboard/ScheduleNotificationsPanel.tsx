'use client';

import PageSection from '@/components/dashboard/lp/PageSection';
import { ScheduleUpdatesSection } from '@/components/academic-hub/ScheduleUpdatesSection';

/** @deprecated Use ScheduleUpdatesSection or BatchAcademicPreviewGrid */
export function ScheduleNotificationsPanel({
  batchesHref = '/student/batches',
}: {
  batchesHref?: string;
}) {
  return (
    <PageSection title="Schedule updates" className="mt-4">
      <ScheduleUpdatesSection batchesHref={batchesHref} />
    </PageSection>
  );
}
