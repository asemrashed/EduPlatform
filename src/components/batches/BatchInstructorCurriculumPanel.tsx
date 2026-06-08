'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { batchesService, type BatchClassRecord } from '@/services/batchesService';
import { SubjectCurriculumPanel } from '@/components/batches/SubjectCurriculumPanel';

export function BatchInstructorCurriculumPanel({
  batchId,
  backHref,
  assignedSubjectIds,
}: {
  batchId: string;
  backHref: string;
  assignedSubjectIds: string[];
}) {
  const [subjects, setSubjects] = useState<BatchClassRecord[]>([]);
  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await batchesService.listBatchClasses(batchId);
    if (res.success && res.data) {
      const list = res.data.subjects ?? res.data.classes ?? [];
      const mine = list.filter(
        (s) => s.isActive && assignedSubjectIds.includes(s._id),
      );
      setSubjects(mine);
      setActiveSubjectId((prev) => {
        if (prev && mine.some((s) => s._id === prev)) return prev;
        return mine[0]?._id ?? null;
      });
    } else {
      setError(res.error || 'Failed to load subjects');
    }
    setLoading(false);
  }, [batchId, assignedSubjectIds]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading your subjects…</p>;
  }

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }

  if (subjects.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          You are not assigned to any subject in this batch yet. An admin can assign you
          from the batch Subjects tab.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {subjects.length > 1 && (
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-base">Your subjects</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2 pb-4">
            {subjects.map((s) => (
              <button
                key={s._id}
                type="button"
                onClick={() => setActiveSubjectId(s._id)}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                  activeSubjectId === s._id
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background hover:bg-muted'
                }`}
              >
                {s.title}
              </button>
            ))}
          </CardContent>
        </Card>
      )}

      {activeSubjectId && (
        <SubjectCurriculumPanel
          batchId={batchId}
          subjectId={activeSubjectId}
          backHref={backHref}
        />
      )}
    </div>
  );
}
