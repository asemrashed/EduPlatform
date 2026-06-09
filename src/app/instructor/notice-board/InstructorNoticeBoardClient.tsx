'use client';

import { useEffect, useState } from 'react';
import { InstructorRoleShell } from '@/components/role-area/InstructorRoleShell';
import { NoticeBoardPageClient } from '@/components/academic-hub/NoticeBoardPageClient';
import type { UpcomingClassItem } from '@/components/academic-hub/UpcomingClassesSection';
import { apiFetch } from '@/lib/api/httpClient';

export default function InstructorNoticeBoardClient() {
  const [upcomingClasses, setUpcomingClasses] = useState<UpcomingClassItem[]>([]);

  useEffect(() => {
    void (async () => {
      const dashRes = await apiFetch('/api/instructor/dashboard');
      const dash = await dashRes.json();
      const rows = dash?.data?.batchSummary?.upcomingClasses ?? [];
      setUpcomingClasses(
        rows.map((c: Record<string, unknown>) => ({
          _id: String(c._id ?? ''),
          batchId: String(c.batchId ?? ''),
          batchName: String(c.batchName ?? ''),
          title: String(c.title ?? ''),
          scheduledAt: String(c.scheduledAt ?? ''),
          durationMinutes: 0,
          type: c.type === 'recorded' ? 'recorded' : 'live',
        })),
      );
    })();
  }, []);

  return (
    <NoticeBoardPageClient
      role="instructor"
      upcomingClasses={upcomingClasses}
      batchesHref="/instructor/batches"
      shell={(content) => <InstructorRoleShell>{content}</InstructorRoleShell>}
    />
  );
}
