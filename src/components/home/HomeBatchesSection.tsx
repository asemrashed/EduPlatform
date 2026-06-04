'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import BatchCard from '@/components/batches/BatchCard';
import type { BatchesContent } from '@/lib/websiteContentTypes';
import {
  publicBatchesService,
  type PublicBatchRow,
} from '@/services/publicBatchesService';

const MAX_CARDS = 4;

export function HomeBatchesSection({ content }: { content?: BatchesContent | null }) {
  const [batches, setBatches] = useState<PublicBatchRow[]>([]);
  const [loading, setLoading] = useState(true);

  const titlePart1 = content?.title?.part1?.trim() || 'Live batch';
  const titlePart2 = content?.title?.part2?.trim() || 'enrollment';
  const description =
    content?.description?.trim() ||
    'Join structured live batches with routine, classes, and instructor support.';
  const buttonText = content?.buttonText?.trim() || 'View all';
  const buttonHref = content?.buttonHref?.trim() || '/enroll';
  const featuredIds = content?.featuredBatchIds ?? [];

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const res = await publicBatchesService.listBatches({ limit: 20 });
      if (!cancelled && res.success && res.data) {
        setBatches(res.data.batches);
      }
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const featuredBatches = useMemo(() => {
    const byId = new Map(batches.map((b) => [b._id, b]));
    const picked = new Set<string>();
    const ordered: PublicBatchRow[] = [];

    for (const id of featuredIds) {
      const row = byId.get(String(id));
      if (row && !picked.has(row._id)) {
        picked.add(row._id);
        ordered.push(row);
      }
    }
    for (const row of batches) {
      if (ordered.length >= MAX_CARDS) break;
      if (!picked.has(row._id)) {
        picked.add(row._id);
        ordered.push(row);
      }
    }
    return ordered.slice(0, MAX_CARDS);
  }, [batches, featuredIds]);

  if (!loading && featuredBatches.length === 0) {
    return null;
  }

  return (
    <section id="batches" className="px-8 py-24">
      <div className="mx-auto max-w-screen-2xl">
        <div className="mb-16 flex flex-col items-end justify-between gap-8 md:flex-row">
          <div className="max-w-2xl">
            <h2 className="mb-4 font-[family-name:var(--font-headline)] text-5xl font-extrabold tracking-tight text-foreground">
              {titlePart1}{' '}
              <span className="text-primary">{titlePart2}</span>
            </h2>
            <p className="text-lg leading-relaxed text-muted-foreground">{description}</p>
          </div>
          <Link
            href={buttonHref}
            className="flex items-center gap-2 font-bold text-primary hover:underline hover:underline-offset-8"
          >
            {buttonText}
            <span className="material-symbols-outlined">north_east</span>
          </Link>
        </div>

        {loading ? (
          <p className="text-center text-muted-foreground">Loading batches…</p>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {featuredBatches.map((b, i) => (
              <BatchCard key={b._id} batch={b} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
