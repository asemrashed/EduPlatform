'use client';

import PageSection from '@/components/dashboard/lp/PageSection';
import { UpcomingClassesSection } from '@/components/academic-hub/UpcomingClassesSection';
import type { UpcomingClassItem } from '@/components/academic-hub/UpcomingClassesSection';

/** @deprecated Use UpcomingClassesSection or BatchAcademicPreviewGrid */
export function UpcomingClassesWidget({
  classes,
  batchesHref = '/student/batches',
  compact = false,
}: {
  classes: UpcomingClassItem[];
  batchesHref?: string;
  compact?: boolean;
}) {
  return (
    <PageSection title="Upcoming classes" className="mt-4">
      <UpcomingClassesSection
        classes={classes}
        batchesHref={batchesHref}
        compact={compact}
      />
    </PageSection>
  );
}
