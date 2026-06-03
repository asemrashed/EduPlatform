'use client';

import { useEffect, useState, type ReactNode } from 'react';

/**
 * Fills the dashboard content slot with a fixed height and disables outer scroll
 * so the course sidebar and question list each get their own overflow-y region.
 */
export function QuestionBankPageLayout({ children }: { children: ReactNode }) {
  const [paneHeight, setPaneHeight] = useState<number | null>(null);

  useEffect(() => {
    const scrollHost = document.querySelector('[data-dashboard-scroll]');
    if (!(scrollHost instanceof HTMLElement)) return;

    const syncHeight = () => {
      setPaneHeight(scrollHost.clientHeight);
    };

    syncHeight();
    scrollHost.style.overflow = 'hidden';

    const observer = new ResizeObserver(syncHeight);
    observer.observe(scrollHost);

    return () => {
      observer.disconnect();
      scrollHost.style.overflow = '';
    };
  }, []);

  return (
    <div
      className="flex w-full min-h-0 flex-col overflow-hidden"
      style={paneHeight != null ? { height: paneHeight, maxHeight: paneHeight } : { minHeight: 320 }}
    >
      {children}
    </div>
  );
}
