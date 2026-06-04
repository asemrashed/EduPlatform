'use client';

import { useCallback, useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import BatchCard from '@/components/batches/BatchCard';
import {
  publicBatchesService,
  type PublicBatchRow,
} from '@/services/publicBatchesService';

const PAGE_SIZE = 12;

export function PublicEnrollClient() {
  const [batches, setBatches] = useState<PublicBatchRow[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBatches = useCallback(async (term: string, pageNum: number) => {
    setLoading(true);
    setError(null);
    const res = await publicBatchesService.listBatches({
      search: term.trim() || undefined,
      page: pageNum,
      limit: PAGE_SIZE,
    });
    if (res.success && res.data) {
      setBatches(res.data.batches);
      setTotalPages(res.data.pagination.totalPages);
    } else {
      setError(res.error || 'Failed to load batches');
      setBatches([]);
      setTotalPages(1);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadBatches(search, page);
    }, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [loadBatches, search, page]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight">Batch enrollment</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Live academic batches — separate from self-paced course checkout.
        </p>
      </div>

      <Input
        className="mb-6 max-w-md"
        placeholder="Search batches…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

      {loading ? (
        <p className="text-muted-foreground">Loading batches…</p>
      ) : batches.length === 0 ? (
        <p className="text-muted-foreground">No active batches yet. Check back soon.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {batches.map((b, i) => (
              <BatchCard key={b._id} batch={b} index={i} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="px-3 text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
