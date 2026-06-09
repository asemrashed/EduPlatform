'use client';

import { useCallback, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { AcademicListEmpty, AcademicListItem } from '@/components/academic-hub/AcademicListItem';
import { formatTimeAgo } from '@/components/academic-hub/academicHubUtils';
import { categoryLabel } from '@/components/notices/noticeUiUtils';
import { noticesService } from '@/services/noticesService';
import type { NoticeRow } from '@/types/notice';
import { LuMegaphone } from 'react-icons/lu';

function noticeIconClass(category: string) {
  switch (category) {
    case 'admin':
      return 'text-blue-600 bg-blue-100';
    case 'subject':
      return 'text-emerald-600 bg-emerald-100';
    case 'teacher':
      return 'text-violet-600 bg-violet-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}

export function NoticeBoardSection({
  maxItems,
  compact = false,
}: {
  maxItems?: number;
  compact?: boolean;
}) {
  const [notices, setNotices] = useState<NoticeRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const limit = maxItems ?? (compact ? 3 : 20);
      const { notices: rows } = await noticesService.list(
        `limit=${limit}&page=1&isActive=true`,
      );
      setNotices(rows);
    } finally {
      setLoading(false);
    }
  }, [compact, maxItems]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return <p className="text-sm text-gray-500">Loading…</p>;
  }

  const rows = maxItems ? notices.slice(0, maxItems) : notices;

  if (rows.length === 0) {
    return <AcademicListEmpty message="No announcements yet." icon={LuMegaphone} />;
  }

  return (
    <ul className="space-y-1">
      {rows.map((notice) => (
        <li key={notice._id}>
          <AcademicListItem
            icon={LuMegaphone}
            iconClassName={noticeIconClass(notice.category)}
            title={notice.title}
            subtitle={notice.body}
            meta={`${notice.postedBy.name}${notice.subject ? ` · ${notice.subject}` : ''} · ${formatTimeAgo(notice.createdAt)}`}
            unread={notice.isPinned}
            trailing={
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                {categoryLabel(notice.category)}
              </Badge>
            }
          />
        </li>
      ))}
    </ul>
  );
}
